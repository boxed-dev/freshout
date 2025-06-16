
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Key, Save, Trash2 } from 'lucide-react';
import { openaiService } from '@/services/openaiService';

interface ApiKeySettingsProps {
  onClose: () => void;
  onApiKeySet: () => void;
}

const ApiKeySettings = ({ onClose, onApiKeySet }: ApiKeySettingsProps) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const existingKey = openaiService.getApiKey();

  const handleSave = async () => {
    if (!apiKey.trim()) return;
    
    setIsLoading(true);
    try {
      openaiService.setApiKey(apiKey.trim());
      onApiKeySet();
      onClose();
    } catch (error) {
      console.error('Failed to save API key:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    openaiService.clearApiKey();
    setApiKey('');
    onApiKeySet();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-96 max-w-[90vw]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            OpenAI API Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-3">
              Enter your OpenAI API key to enable AI-powered responses. Your key is stored locally and never shared.
            </p>
            
            {existingKey && (
              <div className="mb-3 p-2 bg-green-50 rounded text-sm text-green-700">
                ✓ API key is currently set
              </div>
            )}
            
            <div className="relative">
              <Input
                type={showKey ? 'text' : 'password'}
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={!apiKey.trim() || isLoading}
              className="flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Key
            </Button>
            
            {existingKey && (
              <Button
                onClick={handleClear}
                variant="destructive"
                size="sm"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            
            <Button
              onClick={onClose}
              variant="outline"
            >
              Cancel
            </Button>
          </div>
          
          <div className="text-xs text-gray-500">
            <p>Get your API key from: <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">OpenAI Platform</a></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiKeySettings;
