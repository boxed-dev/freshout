import { WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import { parse } from 'url';

// Create WebSocket server on port 8080
const wss = new WebSocketServer({ port: 8080 });

console.log('🎤 OpenAI Realtime Voice Proxy Server started on ws://localhost:8080');
console.log('📡 Ready to proxy connections to OpenAI Realtime API');

wss.on('connection', function connection(clientWs: WebSocket, request: IncomingMessage) {
  console.log('👤 Client connected from:', request.socket.remoteAddress);
  
  // Parse query parameters to get API key
  const url = parse(request.url || '', true);
  const apiKey = url.query.key as string;
  
  if (!apiKey) {
    console.error('❌ No API key provided');
    clientWs.close(1008, 'API key required');
    return;
  }

  console.log('🔑 Connecting to OpenAI with API key:', apiKey.substring(0, 10) + '...');
  // Create connection to OpenAI Realtime API with proper headers
  const openaiUrl = 'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17';
  
  const openaiWs = new WebSocket(openaiUrl, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'OpenAI-Beta': 'realtime=v1'
    }
  });

  // Handle OpenAI connection events
  openaiWs.on('open', () => {
    console.log('✅ Connected to OpenAI Realtime API');
    
    // Send connection ready signal to client
    clientWs.send(JSON.stringify({
      type: 'connection.ready',
      message: 'Connected to OpenAI Realtime API'
    }));
  });
  openaiWs.on('message', (data: Buffer) => {
    // Forward all messages from OpenAI to client
    if (clientWs.readyState === WebSocket.OPEN) {
      try {
        // Parse the message to log details
        const message = JSON.parse(data.toString());
        
        if (message.type === 'error') {
          console.error('🚨 OpenAI API Error Details:', {
            type: message.error?.type || 'unknown',
            code: message.error?.code || 'no_code',
            message: message.error?.message || 'Unknown error',
            event_id: message.event_id,
            fullError: message
          });
        } else {
          console.log('📤 Forwarding message from OpenAI:', message.type);
        }
        
        clientWs.send(data);
      } catch (parseError) {
        console.log('📤 Forwarding binary/non-JSON message from OpenAI');
        clientWs.send(data);
      }
    }
  });

  openaiWs.on('error', (error) => {
    console.error('❌ OpenAI WebSocket error:', error);
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(JSON.stringify({
        type: 'error',
        message: 'OpenAI connection error',
        details: error.message
      }));
    }
  });

  openaiWs.on('close', (code, reason) => {
    console.log('🔌 OpenAI connection closed:', code, reason.toString());
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.close(code, reason);
    }
  });

  // Handle client messages to OpenAI
  clientWs.on('message', (data: Buffer) => {
    if (openaiWs.readyState === WebSocket.OPEN) {
      console.log('📥 Forwarding message from client to OpenAI');
      openaiWs.send(data);
    } else {
      console.warn('⚠️ OpenAI connection not ready, dropping message');
    }
  });

  clientWs.on('close', () => {
    console.log('👋 Client disconnected');
    if (openaiWs.readyState === WebSocket.OPEN) {
      openaiWs.close();
    }
  });

  clientWs.on('error', (error) => {
    console.error('❌ Client WebSocket error:', error);
    if (openaiWs.readyState === WebSocket.OPEN) {
      openaiWs.close();
    }
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down proxy server...');
  wss.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

export {};
