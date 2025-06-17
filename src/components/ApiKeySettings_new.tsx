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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="w-96 max-w-[90vw] border-0 shadow-2xl rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="bg-emerald-100 p-2 rounded-xl">
              <Key className="w-5 h-5 text-emerald-600" />
            </div>
            OpenAI API Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {existingKey && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <p className="text-sm text-emerald-700 font-medium">
                ✓ API key is currently configured
              </p>
            </div>
          )}
          
          <div className="space-y-3">
            <label className="text-sm font-medium text-neutral-700">API Key</label>
            <div className="relative">
              <Input
                type={showKey ? 'text' : 'password'}
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-12 rounded-xl border-neutral-200"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-neutral-100 rounded-lg"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-neutral-500">
              Your API key is stored locally and never shared. Get yours from{' '}
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
                OpenAI Platform
              </a>
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={!apiKey.trim() || isLoading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 rounded-xl"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Key'}
            </Button>
            
            {existingKey && (
              <Button
                onClick={handleClear}
                variant="outline"
                className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-xl"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
          
          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full text-neutral-600 hover:bg-neutral-100 rounded-xl"
          >
            Cancel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiKeySettings;
