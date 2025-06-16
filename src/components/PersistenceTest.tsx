import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const PersistenceTest = () => {
  const [testData, setTestData] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  const testPersistence = () => {
    // Test localStorage
    const testObj = {
      timestamp: new Date().toISOString(),
      data: 'Test persistence data',
      number: Math.random()
    };
    
    localStorage.setItem('persistence-test', JSON.stringify(testObj));
    console.log('Saved to localStorage:', testObj);
    
    // Read it back
    const retrieved = localStorage.getItem('persistence-test');
    if (retrieved) {
      const parsed = JSON.parse(retrieved);
      setTestData(parsed);
      console.log('Retrieved from localStorage:', parsed);
    }
  };

  const clearTest = () => {
    localStorage.removeItem('persistence-test');
    setTestData(null);
    console.log('Cleared test data');
  };

  const checkChatData = () => {
    const chatSession = localStorage.getItem('veggiebot-session');
    const chatPrefs = localStorage.getItem('veggiebot-preferences');
    
    console.log('Chat Session Data:', chatSession ? JSON.parse(chatSession) : 'None');
    console.log('Chat Preferences:', chatPrefs ? JSON.parse(chatPrefs) : 'None');
    
    setTestData({
      sessionExists: !!chatSession,
      prefsExists: !!chatPrefs,
      sessionData: chatSession ? JSON.parse(chatSession) : null
    });
  };

  useEffect(() => {
    // Auto-check on mount
    checkChatData();
  }, []);

  if (!isVisible) {
    return (
      <div className="fixed bottom-20 right-4 z-40">
        <Button
          onClick={() => setIsVisible(true)}
          size="sm"
          variant="outline"
          className="bg-red-500 text-white hover:bg-red-600"
        >
          🔧 Debug
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 z-40 bg-white border rounded-lg shadow-lg p-4 w-80 max-h-60 overflow-y-auto">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-sm">Persistence Debug</h3>
        <Button 
          onClick={() => setIsVisible(false)} 
          size="sm" 
          variant="ghost"
          className="text-xs"
        >
          ×
        </Button>
      </div>
      
      <div className="space-y-2">
        <div className="flex gap-2">
          <Button onClick={testPersistence} size="sm" className="text-xs">
            Test Save
          </Button>
          <Button onClick={checkChatData} size="sm" className="text-xs">
            Check Chat
          </Button>
          <Button onClick={clearTest} size="sm" variant="outline" className="text-xs">
            Clear
          </Button>
        </div>
        
        {testData && (
          <div className="bg-gray-100 p-2 rounded text-xs">
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(testData, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="text-xs text-gray-500">
          Open console for detailed logs
        </div>
      </div>
    </div>
  );
};

export default PersistenceTest; 