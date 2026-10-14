import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

const app = express();

// High-performance gzip/brotli compression with complete API bypass
app.use(
  compression({
    filter: (req, res) => {
      // Never compress API or Server-Sent Events routes so chunks flush immediately to client
      if (req.path.startsWith('/api')) {
        return false;
      }
      return compression.filter(req, res);
    },
    level: 6,
  })
);

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Cached GoogleGenAI client singleton
let aiClientInstance: GoogleGenAI | null = null;
const getAIClient = (): GoogleGenAI | null => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClientInstance) {
    aiClientInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClientInstance;
};

// Health and capability status endpoint
app.get('/api/status', (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    status: 'online',
    appName: 'SOURCE AI',
    studio: 'Source Lab',
    developer: 'Saksham Rajawat',
    tagline: 'Intelligence, Without Limits.',
    aiConfigured: hasKey,
    defaultModel: 'gemini-3.8-flash',
    speedModel: 'gemini-3.1-flash-lite',
    features: {
      streaming: true,
      imageUnderstanding: true,
      webSearch: true,
      textToSpeech: true,
      imageGeneration: true,
      smartRouting: true,
      performanceMetrics: true,
    },
  });
});

// Helper to determine the fastest optimal model based on prompt and mode
function selectOptimalModel(
  requestedModel: string | undefined,
  mode: string | undefined,
  webSearch: boolean,
  hasImages: boolean,
  latestPrompt: string
): { model: string; isLightweight: boolean } {
  // If user explicitly picked Flash Lite or Flash 3.8
  if (requestedModel === 'gemini-3.1-flash-lite') {
    return {
      model: 'gemini-3.1-flash-lite',
      isLightweight: true,
    };
  }
  if (requestedModel === 'gemini-3.8-flash') {
    return {
      model: 'gemini-3.8-flash',
      isLightweight: false,
    };
  }

  // AUTO Smart Routing:
  // Web search and complex reasoning/coding use flagship gemini-3.8-flash
  if (webSearch || mode === 'reasoning' || mode === 'coding') {
    return {
      model: 'gemini-3.8-flash',
      isLightweight: false,
    };
  }

  // Simple short queries, greetings, writing adjustments, quick Q&A route to gemini-3.1-flash-lite for ultra-fast TTFT
  const promptLower = latestPrompt.trim().toLowerCase();
  const isGreetingOrShort =
    promptLower.length < 90 ||
    /^(hi|hello|hey|greetings|thanks|thank you|who are you|what is your name|summarize|translate|fix this)/i.test(
      promptLower
    );

  if (isGreetingOrShort && !hasImages) {
    return {
      model: 'gemini-3.1-flash-lite',
      isLightweight: true,
    };
  }

  // Default balanced model
  return {
    model: 'gemini-3.8-flash',
    isLightweight: false,
  };
}

// Stream chat completion endpoint with SSE & instant chunk flushing
app.post('/api/chat/stream', async (req, res) => {
  const requestStartTime = Date.now();
  let firstTokenTime: number | null = null;
  const { messages, mode, webSearch, attachments, systemInstruction, preferredModel } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  const ai = getAIClient();
  if (!ai) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY is not configured on the server. Please check the Secrets panel in AI Studio.',
    });
  }

  // Setup Server-Sent Events headers immediately for zero handshake delay
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  let clientDisconnected = false;
  res.on('close', () => {
    if (!res.writableEnded) {
      clientDisconnected = true;
    }
  });

  try {
    // Determine system persona based on mode
    let baseSystemPrompt = `You are SOURCE AI, a next-generation AI assistant created by Source Lab and developed by Saksham Rajawat.
Your tagline is "Intelligence, Without Limits."
You are deeply knowledgeable, articulate, concise yet thorough, exceptionally creative, and precise.
Format code blocks using markdown with explicit language tags. Provide clean headings and bullet points.
If asked about who created or developed you, state clearly: "I am SOURCE AI, created by Source Lab and developed by Saksham Rajawat." Never mention Sachin Rajput.`;

    if (mode === 'reasoning') {
      baseSystemPrompt += `\nMode: Advanced Reasoning & Problem Solving. Break down complex logic step-by-step.`;
    } else if (mode === 'coding') {
      baseSystemPrompt += `\nMode: Software Engineering. Write clean, production-grade modern code with concise explanations.`;
    } else if (mode === 'study') {
      baseSystemPrompt += `\nMode: Study & Educational Tutor. Break down concepts intuitively with clear steps.`;
    } else if (mode === 'creative') {
      baseSystemPrompt += `\nMode: Creative Studio. Focus on vivid storytelling, originality, and compelling prose.`;
    }

    if (systemInstruction) {
      baseSystemPrompt += `\n\nCustom instruction: ${systemInstruction}`;
    }

    // Context Window Optimization:
    // Only send the last 10 messages to keep latency minimal and prevent context bloat.
    // Older messages can be summarized or pruned, and heavy base64 strings in older turns are pruned.
    const MAX_CONTEXT_TURNS = 10;
    const historySlice = messages.slice(-MAX_CONTEXT_TURNS);

    const contents: Array<{
      role: 'user' | 'model';
      parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>;
    }> = [];

    let hasAnyImage = false;
    let latestPromptText = '';

    for (let i = 0; i < historySlice.length; i++) {
      const msg = historySlice[i];
      const isLastTurn = i === historySlice.length - 1;
      const role = msg.role === 'assistant' ? 'model' : 'user';
      const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

      // Include base64 data only for recent/active turns to minimize token payload overhead
      if (role === 'user' && msg.attachments && Array.isArray(msg.attachments)) {
        for (const att of msg.attachments) {
          if (att.data && att.mimeType && att.isImage) {
            hasAnyImage = true;
            if (isLastTurn || i >= historySlice.length - 2) {
              const cleanBase64 = att.data.replace(/^data:[^;]+;base64,/, '');
              parts.push({
                inlineData: {
                  mimeType: att.mimeType,
                  data: cleanBase64,
                },
              });
            } else {
              parts.push({ text: `[Attached image: ${att.name}]` });
            }
          } else if (att.name) {
            parts.push({ text: `[Attached file: ${att.name}]` });
          }
        }
      }

      if (msg.content) {
        parts.push({ text: msg.content });
        if (isLastTurn && role === 'user') {
          latestPromptText = msg.content;
        }
      }

      // Also attach any top-level attachments from the current request
      if (isLastTurn && role === 'user' && attachments && Array.isArray(attachments)) {
        for (const att of attachments) {
          if (att.data && att.mimeType && att.isImage) {
            hasAnyImage = true;
            const cleanBase64 = att.data.replace(/^data:[^;]+;base64,/, '');
            const exists = parts.some((p) => p.inlineData?.data === cleanBase64);
            if (!exists) {
              parts.push({
                inlineData: {
                  mimeType: att.mimeType,
                  data: cleanBase64,
                },
              });
            }
          }
        }
      }

      if (parts.length > 0) {
        contents.push({ role, parts });
      }
    }

    // Select optimal model
    const { model: selectedModel } = selectOptimalModel(
      preferredModel,
      mode,
      Boolean(webSearch),
      hasAnyImage,
      latestPromptText
    );

    // Tools setup
    const tools: any[] = [];
    if (webSearch) {
      tools.push({ googleSearch: {} });
    }

    const config: any = {
      systemInstruction: baseSystemPrompt,
      temperature: mode === 'creative' ? 0.9 : mode === 'coding' || mode === 'reasoning' ? 0.2 : 0.7,
    };

    if (tools.length > 0) {
      config.tools = tools;
    }

    // Stream from selected Gemini model
    const responseStream = await ai.models.generateContentStream({
      model: selectedModel,
      contents,
      config,
    });

    let fullAccumulatedText = '';
    let searchGroundingSources: any[] = [];
    let chunkCount = 0;

    for await (const chunk of responseStream) {
      if (clientDisconnected) break;

      const chunkText = chunk.text || '';
      fullAccumulatedText += chunkText;
      chunkCount++;

      if (firstTokenTime === null && chunkText) {
        firstTokenTime = Date.now();
      }

      // Extract search grounding sources if present
      const candidate = chunk.candidates?.[0];
      if (candidate?.groundingMetadata?.groundingChunks) {
        const webChunks = candidate.groundingMetadata.groundingChunks
          .filter((c: any) => c.web?.uri && c.web?.title)
          .map((c: any) => ({
            title: c.web.title,
            uri: c.web.uri,
          }));
        if (webChunks.length > 0) {
          searchGroundingSources = webChunks;
        }
      }

      // Write chunk instantly and flush socket buffer
      res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
      if (typeof (res as any).flush === 'function') {
        (res as any).flush();
      }
    }

    // Send final metadata event with performance metrics and sources
    if (!clientDisconnected) {
      const totalDuration = Date.now() - requestStartTime;
      const ttft = firstTokenTime ? firstTokenTime - requestStartTime : totalDuration;

      res.write(
        `data: ${JSON.stringify({
          done: true,
          sources: searchGroundingSources.length > 0 ? searchGroundingSources : undefined,
          metrics: {
            ttftMs: ttft,
            totalMs: totalDuration,
            modelUsed: selectedModel,
            chunks: chunkCount,
            charCount: fullAccumulatedText.length,
          },
        })}\n\n`
      );
      if (typeof (res as any).flush === 'function') {
        (res as any).flush();
      }
      res.end();
    }
  } catch (error: any) {
    console.error('Error in chat streaming:', error);
    if (!clientDisconnected) {
      res.write(
        `data: ${JSON.stringify({
          error: error?.message || 'An error occurred during response generation.',
        })}\n\n`
      );
      if (typeof (res as any).flush === 'function') {
        (res as any).flush();
      }
      res.end();
    }
  }
});

// Text-to-Speech endpoint with in-memory caching for repeated phrases
const ttsCache = new Map<string, string>();

app.post('/api/audio/tts', async (req, res) => {
  const { text, voice = 'Kore' } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text is required for TTS' });
  }

  const cacheKey = `${voice}:${text.slice(0, 200).trim().toLowerCase()}`;
  if (ttsCache.has(cacheKey)) {
    return res.json({
      audioUrl: ttsCache.get(cacheKey),
      format: 'wav',
      voice,
      cached: true,
    });
  }

  const ai = getAIClient();
  if (!ai) {
    return res.status(503).json({ error: 'Gemini API not configured' });
  }

  try {
    const cleanText = text.slice(0, 800).replace(/[*#`_\[\]()]/g, ' ');

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [{ text: cleanText }],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(500).json({ error: 'No audio generated by model' });
    }

    const audioUrl = `data:audio/wav;base64,${base64Audio}`;
    if (ttsCache.size > 50) {
      const firstKey = ttsCache.keys().next().value;
      if (firstKey) ttsCache.delete(firstKey);
    }
    ttsCache.set(cacheKey, audioUrl);

    res.json({
      audioUrl,
      format: 'wav',
      voice,
    });
  } catch (error: any) {
    console.error('TTS Generation error:', error);
    res.status(500).json({ error: error?.message || 'Failed to synthesize speech' });
  }
});

// Image Generation endpoint using gemini-3.1-flash-lite-image
app.post('/api/image/generate', async (req, res) => {
  const { prompt, aspectRatio = '1:1' } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const ai = getAIClient();
  if (!ai) {
    return res.status(503).json({ error: 'Gemini API not configured' });
  }

  try {
    const validAspectRatios = ['1:1', '3:4', '4:3', '9:16', '16:9'];
    const chosenAspect = validAspectRatios.includes(aspectRatio) ? aspectRatio : '1:1';

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: chosenAspect as any,
        },
      },
    });

    let imageUrl: string | null = null;
    let textDescription = '';

    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      } else if (part.text) {
        textDescription += part.text;
      }
    }

    if (!imageUrl) {
      return res.status(500).json({
        error: 'The image generation model did not return image data.',
        detail: textDescription,
      });
    }

    res.json({
      imageUrl,
      description: textDescription,
      aspectRatio: chosenAspect,
    });
  } catch (error: any) {
    console.error('Image Generation error:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate image' });
  }
});

// Start server with static caching headers
async function startServer() {
  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // 1-year immutable cache for built assets, 1 hour for HTML
    app.use(
      express.static(path.resolve(__dirname, 'dist'), {
        maxAge: '1y',
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'public, max-age=3600');
          }
        },
      })
    );
    app.get('*', (req, res) => {
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[SOURCE AI] Turbo Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
