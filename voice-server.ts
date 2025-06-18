import express from "express";
import { createServer } from "http";
import WebSocket, { WebSocketServer } from "ws";
import "dotenv/config";

const app = express();
const server = createServer(app);
const port = process.env.VOICE_PORT || 8080;
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error("❌ OPENAI_API_KEY environment variable is required");
  console.log("📝 Please add OPENAI_API_KEY to your .env file");
  process.exit(1);
}

// Enable CORS for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Parse JSON bodies
app.use(express.json());

console.log("🚀 Starting OpenAI Realtime Voice Server...");

// API route for token generation
app.get("/token", async (req, res) => {
  console.log("🎫 Token generation request received");
  
  try {
    const response = await fetch(
      "https://api.openai.com/v1/realtime/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-realtime-preview-2024-12-17",
          voice: "verse",
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ OpenAI API Error:", response.status, errorText);
      
      // Parse error details if possible
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: { message: errorText } };
      }
      
      return res.status(response.status).json({
        error: "Failed to generate token",
        details: errorData.error?.message || errorText,
        code: errorData.error?.code || 'unknown'
      });
    }

    const data = await response.json();
    console.log("✅ Token generated successfully");
    res.json(data);
  } catch (error) {
    console.error("❌ Token generation error:", error);
    res.status(500).json({ 
      error: "Failed to generate token",
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    service: "OpenAI Realtime Voice Server",
    hasApiKey: !!apiKey,
    timestamp: new Date().toISOString()
  });
});

// WebSocket server for realtime connections
const wss = new WebSocketServer({ server, path: '/realtime' });

wss.on('connection', (clientWs) => {
  console.log('🔗 Client connected to WebSocket');
  let openaiWs: WebSocket | null = null;
  let isAuthenticated = false;

  clientWs.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      
      if (message.type === 'auth' && message.token) {
        // Authenticate and connect to OpenAI
        console.log('🔐 Authenticating with OpenAI...');
        
        try {
          openaiWs = new WebSocket('wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17', {
            headers: {
              'Authorization': `Bearer ${message.token}`,
              'OpenAI-Beta': 'realtime=v1'
            }
          });

          openaiWs.on('open', () => {
            console.log('✅ Connected to OpenAI Realtime API');
            isAuthenticated = true;
            clientWs.send(JSON.stringify({
              type: 'auth.success',
              message: 'Connected to OpenAI Realtime API'
            }));
          });

          openaiWs.on('message', (data) => {
            // Forward all messages from OpenAI to client
            if (clientWs.readyState === WebSocket.OPEN) {
              try {
                const message = JSON.parse(data.toString());
                if (message.type === 'error') {
                  console.error('🚨 OpenAI API Error:', message);
                }
                clientWs.send(data);
              } catch (parseError) {
                clientWs.send(data);
              }
            }
          });

          openaiWs.on('error', (error) => {
            console.error('❌ OpenAI WebSocket error:', error);
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({
                type: 'error',
                error: {
                  message: 'OpenAI connection error',
                  details: error.message
                }
              }));
            }
          });

          openaiWs.on('close', () => {
            console.log('🔌 OpenAI connection closed');
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({
                type: 'connection.closed',
                message: 'OpenAI connection closed'
              }));
            }
          });

        } catch (authError) {
          console.error('❌ Authentication failed:', authError);
          clientWs.send(JSON.stringify({
            type: 'auth.error',
            error: {
              message: 'Authentication failed',
              details: authError instanceof Error ? authError.message : 'Unknown error'
            }
          }));
        }
      } else if (isAuthenticated && openaiWs?.readyState === WebSocket.OPEN) {
        // Forward authenticated messages to OpenAI
        openaiWs.send(data);
      } else {
        clientWs.send(JSON.stringify({
          type: 'error',
          error: {
            message: 'Not authenticated',
            details: 'Please authenticate first'
          }
        }));
      }
    } catch (parseError) {
      console.error('❌ Error parsing client message:', parseError);
      clientWs.send(JSON.stringify({
        type: 'error',
        error: {
          message: 'Invalid message format',
          details: 'Could not parse JSON'
        }
      }));
    }
  });

  clientWs.on('close', () => {
    console.log('🔌 Client disconnected');
    if (openaiWs) {
      openaiWs.close();
    }
  });

  clientWs.on('error', (error) => {
    console.error('❌ Client WebSocket error:', error);
    if (openaiWs) {
      openaiWs.close();
    }
  });
});

// Start the server
server.listen(port, () => {
  console.log(`✅ OpenAI Realtime Voice Server running on port ${port}`);
  console.log(`🔗 Health check: http://localhost:${port}/health`);
  console.log(`🎫 Token endpoint: http://localhost:${port}/token`);
  console.log(`🎙️ WebSocket endpoint: ws://localhost:${port}/realtime`);
  console.log(`🔑 API Key configured: ${apiKey ? 'Yes' : 'No'}`);
});
