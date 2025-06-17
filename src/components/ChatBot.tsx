
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useChat } from '@/contexts/ChatContext';
import { X, Send, MessageSquare, Settings, Loader2, Sparkles } from 'lucide-react';
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
    window.location.reload();
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-emerald-600 hover:bg-emerald-700 rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200"
      >
        <MessageSquare className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <>
      <div className="fixed top-0 right-0 h-screen w-96 z-50 bg-white/95 backdrop-blur-md border-l border-neutral-200/50 shadow-2xl flex flex-col">
        <div className="p-6 border-b border-neutral-200/50 bg-white/80">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 mb-1">
                Shopping Assistant
              </h2>
              {hasApiKey && (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm text-emerald-600 font-medium">AI Powered</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(true)}
                className="hover:bg-neutral-100 rounded-xl p-2"
                title="API Settings"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="hover:bg-neutral-100 rounded-xl p-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-4 rounded-2xl ${
                  message.isUser
                    ? 'bg-emerald-600 text-white'
                    : 'bg-neutral-100 text-neutral-900'
                }`}
              >
                <div className="flex items-start gap-2">
                  {message.isLoading && <Loader2 className="w-4 h-4 animate-spin mt-1" />}
                  <div className="text-sm prose prose-sm max-w-none">
                    {message.isUser ? (
                      <p className="mb-0">{message.text}</p>
                    ) : (
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                          li: ({ children }) => <li className="ml-2">{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                          em: ({ children }) => <em className="italic">{children}</em>,
                          code: ({ children }) => <code className="bg-neutral-200 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                        }}
                      >
                        {message.text}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
                <span className="text-xs opacity-70 mt-2 block">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-6 border-t border-neutral-200/50 bg-white/80">
          <div className="flex gap-3 mb-3">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={hasApiKey ? "Ask me anything..." : "Set API key for AI responses..."}
              className="flex-1 rounded-xl border-neutral-200 focus:border-emerald-500 focus:ring-emerald-500"
            />
            <Button
              onClick={handleSend}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 rounded-xl px-4"
              disabled={!inputValue.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          <p className="text-xs text-neutral-500 leading-relaxed">
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
