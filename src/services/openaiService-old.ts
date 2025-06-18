interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

interface RealtimeMessage {
  type: string;
  [key: string]: any;
}

interface VoiceSettings {
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  temperature: number;
  max_output_tokens: number;
}

export class OpenAIService {
  private apiKey: string | null = null;
  private realtimeWs: WebSocket | null = null;
  private audioContext: AudioContext | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private isRecording: boolean = false;
  private isConnected: boolean = false;
  private onMessageCallback: ((message: string, isComplete: boolean) => void) | null = null;
  private onConnectionStatusChange: ((connected: boolean) => void) | null = null;
  private currentAudioStream: MediaStream | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.apiKey = localStorage.getItem('openai_api_key');
    }
  }

  setApiKey(key: string) {
    this.apiKey = key;
    if (typeof window !== 'undefined') {
      localStorage.setItem('openai_api_key', key);
    }
  }

  getApiKey(): string | null {
    return this.apiKey;
  }
  clearApiKey() {
    this.apiKey = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('openai_api_key');
    }
    this.disconnectRealtime();  }

  // Realtime Voice API Methods
  async connectRealtime(systemMessage: string, voiceSettings: VoiceSettings = {
    voice: 'nova',
    temperature: 0.2,
    max_output_tokens: 150
  }): Promise<boolean> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not set');
    }

    if (this.realtimeWs?.readyState === WebSocket.OPEN) {
      return true;
    }    try {
      // Use our local WebSocket proxy server that handles authentication
      const wsUrl = `ws://localhost:8080?key=${encodeURIComponent(this.apiKey)}`;
      
      console.log('🎤 Connecting to voice proxy server...');
      this.realtimeWs = new WebSocket(wsUrl);

      return new Promise((resolve, reject) => {
        if (!this.realtimeWs) {
          reject(new Error('Failed to create WebSocket'));
          return;
        }        this.realtimeWs.onopen = () => {
          console.log('🔗 Connected to voice proxy server');
        };

        this.realtimeWs.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            
            if (message.type === 'connection.ready') {
              console.log('✅ Voice proxy connected to OpenAI Realtime API');
              this.isConnected = true;
              this.onConnectionStatusChange?.(true);
              
              this.sendRealtimeMessage({
                type: 'session.update',
                session: {
                  modalities: ['text', 'audio'],
                  instructions: systemMessage,
                  voice: voiceSettings.voice,
                  input_audio_format: 'pcm16',
                  output_audio_format: 'pcm16',
                  input_audio_transcription: {
                    model: 'whisper-1'
                  },
                  turn_detection: {
                    type: 'server_vad',
                    threshold: 0.5,
                    prefix_padding_ms: 300,
                    silence_duration_ms: 500
                  },
                  tools: [],
                  tool_choice: 'auto',
                  temperature: voiceSettings.temperature,
                  max_response_output_tokens: voiceSettings.max_output_tokens
                }
              });
              
              clearTimeout(timeoutId);
              originalResolve(true);
              return;
            }            if (message.type === 'error') {
              clearTimeout(timeoutId);
              console.error('Voice proxy error:', message);
              
              // Extract detailed error information from OpenAI API error structure
              const errorDetails = message.error || message;
              let errorMessage = 'Unknown error';
              let errorType = 'unknown';
              let errorCode = 'no_code';
              
              // Handle different error structures
              if (errorDetails.message) {
                errorMessage = errorDetails.message;
              } else if (typeof errorDetails === 'string') {
                errorMessage = errorDetails;
              }
              
              if (errorDetails.type) {
                errorType = errorDetails.type;
              }
              
              if (errorDetails.code) {
                errorCode = errorDetails.code;
              }
              
              console.error('Detailed error info:', {
                type: errorType,
                code: errorCode,
                message: errorMessage,
                event_id: message.event_id,
                fullError: errorDetails,
                fullMessage: message
              });
              
              // Provide specific error messages based on error type and content
              let userFriendlyMessage = '';
              
              if (errorMessage.includes('authentication') || errorMessage.includes('unauthorized') || errorCode.includes('auth')) {
                userFriendlyMessage = '🔐 Authentication failed. Please check your OpenAI API key in Settings.';
              } else if (errorMessage.includes('rate_limit') || errorMessage.includes('quota') || errorCode.includes('rate')) {
                userFriendlyMessage = '⏱️ Rate limit exceeded. Please wait and try again.';
              } else if (errorMessage.includes('model') || errorMessage.includes('access') || errorType.includes('access') || errorCode.includes('model')) {
                userFriendlyMessage = '🚫 Your OpenAI account may not have access to the Realtime API.\n\nThe Realtime API is currently in limited beta. Please check your OpenAI account settings or join the waitlist.';
              } else if (errorMessage.includes('invalid_request') || errorType === 'invalid_request_error') {
                userFriendlyMessage = `❌ Invalid request: ${errorMessage}`;
              } else if (errorCode.includes('insufficient_quota') || errorMessage.includes('insufficient_quota')) {
                userFriendlyMessage = '💳 Insufficient quota. Please check your OpenAI account billing and usage limits.';
              } else {
                userFriendlyMessage = `❌ OpenAI API Error: ${errorMessage}\n\nError Type: ${errorType}\nError Code: ${errorCode}\nEvent ID: ${message.event_id || 'N/A'}`;
              }
              
              originalReject(new Error(userFriendlyMessage));
              return;
            }
            
            this.handleRealtimeMessage(message);
          } catch (parseError) {
            console.error('Error parsing WebSocket message:', parseError);
            clearTimeout(timeoutId);
            originalReject(new Error('Failed to parse WebSocket message'));
          }
        };

        this.realtimeWs.onclose = () => {
          console.log('WebSocket connection closed');
          this.isConnected = false;
          this.onConnectionStatusChange?.(false);
        };        this.realtimeWs.onerror = (error) => {
          console.error('Voice proxy connection error:', error);
          this.isConnected = false;
          this.onConnectionStatusChange?.(false);
          
          clearTimeout(timeoutId);
          const helpfulError = new Error(
            '� Failed to connect to voice proxy server.\n\n' +
            '� To enable voice mode:\n' +
            '1. Run: pnpm voice-proxy\n' +
            '2. Make sure the proxy server is running on localhost:8080\n\n' +
            '✅ Text mode works perfectly with all AI features!'
          );
          originalReject(helpfulError);
        };        // Timeout after 5 seconds
        const timeoutId = setTimeout(() => {
          if (!this.isConnected) {
            this.realtimeWs?.close();
            reject(new Error(
              '⏱️ Voice connection timeout.\n\n' +
              '� Make sure the voice proxy server is running:\n' +
              '   Run: pnpm voice-proxy\n\n' +
              '✅ Text mode works perfectly with all AI features!'
            ));
          }
        }, 5000);

        // Store original functions to clear timeout
        const originalResolve = resolve;
        const originalReject = reject;
      });
    } catch (error) {
      console.error('Failed to connect to Realtime API:', error);
      throw error;
    }
  }

  disconnectRealtime() {
    if (this.realtimeWs) {
      this.realtimeWs.close();
      this.realtimeWs = null;
    }
    this.stopRecording();
    this.isConnected = false;
    this.onConnectionStatusChange?.(false);
  }

  private sendRealtimeMessage(message: RealtimeMessage) {
    if (this.realtimeWs?.readyState === WebSocket.OPEN) {
      this.realtimeWs.send(JSON.stringify(message));
    }
  }
  private handleRealtimeMessage(message: RealtimeMessage) {
    switch (message.type) {
      case 'response.text.delta':
        this.onMessageCallback?.(message.delta, false);
        break;
      case 'response.text.done':
        this.onMessageCallback?.(message.text, true);
        break;
      case 'response.audio.delta':
        this.playAudioDelta(message.delta);
        break;
      case 'input_audio_buffer.speech_started':
        console.log('Speech started');
        break;
      case 'input_audio_buffer.speech_stopped':
        console.log('Speech stopped');
        break;
      case 'conversation.item.input_audio_transcription.completed':
        if (message.transcript) {
          this.onMessageCallback?.(message.transcript, true);
        }
        break;
      case 'session.created':
        console.log('Session created');
        break;
      case 'session.updated':
        console.log('Session updated');
        break;
      case 'error':
        // Error handling is done in the main message handler
        console.warn('Unhandled error message type:', message);
        break;
      default:
        console.log('Unhandled message type:', message.type);
    }
  }

  async startRecording(): Promise<boolean> {
    if (this.isRecording) return true;

    try {
      this.currentAudioStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 24000,
          sampleSize: 16,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      this.audioContext = new AudioContext({ sampleRate: 24000 });
      const source = this.audioContext.createMediaStreamSource(this.currentAudioStream);
      
      // Create audio worklet for real-time processing
      await this.audioContext.audioWorklet.addModule(
        URL.createObjectURL(new Blob([`
          class AudioProcessor extends AudioWorkletProcessor {
            process(inputs, outputs, parameters) {
              const input = inputs[0];
              if (input.length > 0) {
                const channelData = input[0];
                const int16Array = new Int16Array(channelData.length);
                for (let i = 0; i < channelData.length; i++) {
                  int16Array[i] = Math.max(-1, Math.min(1, channelData[i])) * 0x7FFF;
                }
                this.port.postMessage(int16Array.buffer);
              }
              return true;
            }
          }
          registerProcessor('audio-processor', AudioProcessor);
        `], { type: 'application/javascript' }))
      );

      const processor = new AudioWorkletNode(this.audioContext, 'audio-processor');
      processor.port.onmessage = (event) => {
        if (this.isConnected) {
          const audioData = new Uint8Array(event.data);
          const base64Audio = btoa(String.fromCharCode(...audioData));
          this.sendRealtimeMessage({
            type: 'input_audio_buffer.append',
            audio: base64Audio
          });
        }
      };

      source.connect(processor);
      this.isRecording = true;
      return true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      return false;
    }
  }

  stopRecording() {
    if (this.currentAudioStream) {
      this.currentAudioStream.getTracks().forEach(track => track.stop());
      this.currentAudioStream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.isRecording = false;

    if (this.isConnected) {
      this.sendRealtimeMessage({
        type: 'input_audio_buffer.commit'
      });
      this.sendRealtimeMessage({
        type: 'response.create',
        response: {
          modalities: ['text', 'audio']
        }
      });
    }
  }

  private playAudioDelta(base64Audio: string) {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }

    try {
      const audioData = Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0));
      const audioBuffer = this.audioContext.createBuffer(1, audioData.length / 2, 24000);
      const channelData = audioBuffer.getChannelData(0);
      
      for (let i = 0; i < channelData.length; i++) {
        const sample = (audioData[i * 2] | (audioData[i * 2 + 1] << 8));
        channelData[i] = sample < 0x8000 ? sample / 0x8000 : (sample - 0x10000) / 0x8000;
      }

      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      source.start();
    } catch (error) {
      console.error('Failed to play audio:', error);
    }
  }

  setMessageCallback(callback: (message: string, isComplete: boolean) => void) {
    this.onMessageCallback = callback;
  }

  setConnectionStatusCallback(callback: (connected: boolean) => void) {
    this.onConnectionStatusChange = callback;
  }

  getIsRecording(): boolean {
    return this.isRecording;
  }

  getIsConnected(): boolean {
    return this.isConnected;
  }

  async generateResponse(messages: OpenAIMessage[], systemContent: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not set');
    }

    const systemMessage: OpenAIMessage = {
      role: 'system',
      content: systemContent
    };

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4.1',
          messages: [systemMessage, ...messages],
          max_tokens: 150,
          temperature: 0.2
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data: OpenAIResponse = await response.json();
      return data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    } catch (error) {
      console.error('OpenAI API call failed:', error);
      throw error;
    }
  }
}

export const openaiService = new OpenAIService();
