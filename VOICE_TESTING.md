# Voice Mode Testing Instructions

## Quick Test Setup

### 1. Start the Voice Proxy Server
```bash
pnpm voice-proxy
```
You should see:
```
🎤 OpenAI Realtime Voice Proxy Server started on ws://localhost:8080
📡 Ready to proxy connections to OpenAI Realtime API
```

### 2. Start the Development Server (in a new terminal)
```bash
pnpm dev
```

### 3. Test Voice Mode

1. **Open the app** in your browser (http://localhost:3001 or 3000)
2. **Click the chat icon** to open the assistant
3. **Click the settings icon** and enter your OpenAI API key
4. **Click the phone icon** to enable voice mode
5. **Click the microphone button** and start speaking!

## Test Commands

Try these voice commands:
- "What vegetables do you have?"
- "Add tomatoes to my cart"
- "Show me the carrots"
- "Go to my cart"
- "Remove one tomato"
- "What's in my cart?"

## Expected Behavior

✅ **Working Voice Mode:**
- Microphone button turns green when connected
- Real-time speech recognition
- AI responds with voice
- Cart operations work via voice
- Seamless conversation flow

❌ **If Voice Mode Fails:**
- Clear error messages explaining the issue
- "Try Demo Mode" button for browser-based speech
- Text mode always works as fallback

## Troubleshooting

**Connection Issues:**
- Ensure proxy server is running on port 8080
- Check that your OpenAI API key has Realtime API access
- Verify no firewall is blocking localhost:8080

**Audio Issues:**
- Allow microphone permissions in browser
- Check browser audio settings
- Try different browsers (Chrome/Edge recommended)

**API Issues:**
- Verify OpenAI API key is valid
- Check OpenAI account has Realtime API access
- Monitor browser console for detailed error messages

## Demo Mode Fallback

If the full voice mode doesn't work:
1. Click "Try Demo Mode" in the error message
2. Uses browser's built-in speech recognition
3. AI responses are spoken using text-to-speech
4. All the same AI features work

## Architecture

```
Browser ←→ WebSocket Proxy (localhost:8080) ←→ OpenAI Realtime API
```

The proxy server handles authentication headers that browsers cannot send directly, enabling full real-time voice functionality.
