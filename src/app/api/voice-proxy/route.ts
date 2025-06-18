import { NextRequest } from 'next/server';
import { WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';

// Store for managing client connections
const clients = new Map<string, { clientWs: WebSocket; openaiWs: WebSocket | null }>();

export async function GET(request: NextRequest) {
  const upgradeHeader = request.headers.get('upgrade');
  
  if (upgradeHeader !== 'websocket') {
    return new Response('Expected WebSocket upgrade', { status: 426 });
  }

  const { searchParams } = new URL(request.url);
  const apiKey = searchParams.get('key');
  
  if (!apiKey) {
    return new Response('Missing API key', { status: 400 });
  }

  // This is a placeholder - actual WebSocket upgrade handling requires server setup
  return new Response(JSON.stringify({
    message: 'WebSocket proxy ready',
    instruction: 'Connect via WebSocket to this endpoint with your API key as query parameter'
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

// Note: For full WebSocket support in Next.js API routes, you need custom server setup
// This is a simplified version - see implementation below for the actual proxy logic

export function createVoiceProxy(req: IncomingMessage, socket: any, head: Buffer) {
  const url = new URL(req.url!, `http://${req.headers.host}`);
  const apiKey = url.searchParams.get('key');
  
  if (!apiKey) {
    socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
    socket.destroy();
    return;
  }

  const wss = new WebSocketServer({ noServer: true });
  
  wss.handleUpgrade(req, socket, head, (clientWs) => {
    const clientId = Math.random().toString(36).substring(7);
    
    // Connect to OpenAI Realtime API with proper authentication
    const openaiWs = new WebSocket(
      'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01',
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'OpenAI-Beta': 'realtime=v1'
        }
      }
    );

    // Store the connection pair
    clients.set(clientId, { clientWs, openaiWs: null });

    openaiWs.on('open', () => {
      console.log('Connected to OpenAI Realtime API');
      clients.get(clientId)!.openaiWs = openaiWs;
      
      // Send ready signal to client
      clientWs.send(JSON.stringify({ type: 'connection.ready' }));
    });

    openaiWs.on('message', (data) => {
      // Forward messages from OpenAI to client
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(data);
      }
    });

    openaiWs.on('error', (error) => {
      console.error('OpenAI WebSocket error:', error);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({ 
          type: 'error', 
          message: 'OpenAI connection error',
          details: error.message 
        }));
      }
    });

    openaiWs.on('close', () => {
      console.log('OpenAI connection closed');
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.close();
      }
      clients.delete(clientId);
    });

    // Handle messages from client to OpenAI
    clientWs.on('message', (data) => {
      const connection = clients.get(clientId);
      if (connection?.openaiWs && connection.openaiWs.readyState === WebSocket.OPEN) {
        connection.openaiWs.send(data);
      }
    });

    clientWs.on('close', () => {
      console.log('Client disconnected');
      const connection = clients.get(clientId);
      if (connection?.openaiWs) {
        connection.openaiWs.close();
      }
      clients.delete(clientId);
    });

    clientWs.on('error', (error) => {
      console.error('Client WebSocket error:', error);
      const connection = clients.get(clientId);
      if (connection?.openaiWs) {
        connection.openaiWs.close();
      }
      clients.delete(clientId);
    });
  });
}
