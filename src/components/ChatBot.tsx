
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useChat } from '@/contexts/ChatContext';
import { X, Send, MessageSquare, Settings, Loader2 } from 'lucide-react';
import ApiKeySettings from './ApiKeySettings';
import { openaiService } from '@/services/openaiService';
import ReactMarkdown from 'react-markdown';

const ChatBot = () => {
  const { messages, isOpen, setIsOpen, sendMessage, hasApiKey } = useChat();
  const [inputValue, setInputValue] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim()) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handleApiKeySet = () => {
    // Trigger re-render to update hasApiKey status
    window.location.reload();
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-green-600 hover:bg-green-700 rounded-full w-14 h-14 shadow-lg"
      >
        <MessageSquare className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <>
      <div className="fixed top-0 right-0 h-screen w-96 z-50 bg-white border-l shadow-xl flex flex-col">
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Shopping Assistant
              {hasApiKey && (
                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  AI Enabled
                </span>
              )}
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(true)}
                title="API Settings"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.isUser
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="flex items-start gap-2">
                  {message.isLoading && <Loader2 className="w-3 h-3 animate-spin mt-1" />}
                  <div className="text-sm prose prose-sm max-w-none">
                    {message.isUser ? (
                      <p>{message.text}</p>
                    ) : (
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                          li: ({ children }) => <li className="ml-2">{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                          em: ({ children }) => <em className="italic">{children}</em>,
                          code: ({ children }) => <code className="bg-gray-200 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                        }}
                      >
                        {message.text}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
                <span className="text-xs opacity-70">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-4 border-t bg-gray-50">
          <div className="flex gap-2 mb-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={hasApiKey ? "Ask me anything..." : "Set API key for AI responses..."}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              disabled={!inputValue.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          <p className="text-xs text-gray-500">
            {hasApiKey 
              ? "✨ AI-powered responses enabled. Try: 'what vegetables do you have?', 'recommend veggies for biryani', 'add tomatoes to cart'"
              : "Try: 'show vegetables', 'go to cart', 'find tomatoes', 'add carrots to cart'"
            }
          </p>
        </div>
      </div>

      {showSettings && (
        <ApiKeySettings
          onClose={() => setShowSettings(false)}
          onApiKeySet={handleApiKeySet}
        />
      )}
    </>
  );
};

export default ChatBot;
