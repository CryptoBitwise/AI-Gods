import React, { useState, useEffect } from 'react';
import { Settings, Key, Zap, TestTube, AlertCircle, CheckCircle, X, Info } from 'lucide-react';
import groqAIService, { GroqConfig } from '../services/groqAI';

interface GroqAISettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const GroqAISettings: React.FC<GroqAISettingsProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<GroqConfig>(groqAIService.getConfig());
  const [apiKey, setApiKey] = useState('');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(groqAIService.getStatus());
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadStatus();
      loadAvailableModels();
      // Load current API key if available
      const currentConfig = groqAIService.getConfig();
      if (currentConfig.apiKey) {
        setApiKey(currentConfig.apiKey);
      }
    }
  }, [isOpen]);

  const loadStatus = () => {
    setStatus(groqAIService.getStatus());
  };

  const loadAvailableModels = async () => {
    if (status.initialized) {
      try {
        const models = await groqAIService.getAvailableModels();
        setAvailableModels(models);
      } catch (error) {
        console.error('Failed to load models:', error);
      }
    }
  };

  const handleSaveConfig = async () => {
    setIsLoading(true);
    try {
      console.log('🔑 Attempting to save API key:', apiKey ? 'Key provided' : 'No key');
      console.log('🔑 API key length:', apiKey.length);
      console.log('🔑 API key preview:', apiKey.substring(0, 10) + '...');

      // Manually set API key first
      groqAIService.setApiKey(apiKey);
      console.log('🔑 API key set in service');

      // Update config
      const newConfig = { ...config, apiKey };
      groqAIService.updateConfig(newConfig);
      console.log('⚙️ Config updated');

      // Force refresh status to see if API key is now recognized
      loadStatus();
      console.log('🔄 Status refreshed, current status:', groqAIService.getStatus());

      console.log('⚙️ Attempting to initialize...');

      // Try to initialize
      const success = await groqAIService.initialize();
      if (success) {
        setConfig(newConfig);
        loadStatus();
        await loadAvailableModels();
        setTestResult({ success: true, message: 'Configuration saved and service initialized successfully!' });
        console.log('✅ Service initialized successfully!');
      } else {
        setTestResult({ success: false, message: 'Failed to initialize service. Check your API key.' });
        console.log('❌ Service initialization failed');
      }
    } catch (error) {
      console.error('💥 Error in handleSaveConfig:', error);
      setTestResult({ success: false, message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    try {
      const models = await groqAIService.getAvailableModels();
      setTestResult({
        success: true,
        message: `Connection successful! Available models: ${models.slice(0, 3).join(', ')}...`
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetConfig = () => {
    const defaultConfig = groqAIService.getConfig();
    setConfig(defaultConfig);
    setApiKey(defaultConfig.apiKey);
    setTestResult(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-divine-500/30 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-divine-500/30">
          <div className="flex items-center space-x-3">
            <Zap className="text-2xl text-divine-400" />
            <div>
              <h1 className="text-2xl font-bold text-divine-100">Groq AI Settings</h1>
              <p className="text-divine-300">
                Configure GPT OSS integration for divine AI responses
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-divine-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="bg-slate-800 border border-slate-600 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-divine-100 mb-3">Service Status</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${status.hasApiKey ? 'bg-green-400' : 'bg-red-400'
                  }`}></div>
                <div className="text-sm text-slate-300">API Key</div>
                <div className="text-xs text-slate-400">
                  {status.hasApiKey ? 'Configured' : 'Missing'}
                </div>
              </div>
              <div className="text-center">
                <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${status.initialized ? 'bg-green-400' : 'bg-yellow-400'
                  }`}></div>
                <div className="text-sm text-slate-300">Initialized</div>
                <div className="text-xs text-slate-400">
                  {status.initialized ? 'Ready' : 'Pending'}
                </div>
              </div>
              <div className="text-center">
                <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${status.ready ? 'bg-green-400' : 'bg-red-400'
                  }`}></div>
                <div className="text-sm text-slate-300">Ready</div>
                <div className="text-xs text-slate-400">
                  {status.ready ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>
          </div>

          {/* API Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-divine-100">API Configuration</h3>

            <div>
              <label className="block text-sm font-medium text-divine-300 mb-2">
                Groq API Key
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="gsk_..."
                  className="w-full bg-slate-700 border border-divine-500/30 rounded-lg px-3 py-2 text-divine-100 pr-12"
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-divine-300 hover:text-divine-100"
                >
                  {showApiKey ? <X size={16} /> : <Key size={16} />}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Get your API key from{' '}
                <a
                  href="https://console.groq.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-divine-400 hover:text-divine-300 underline"
                >
                  Groq Console
                </a>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-divine-300 mb-2">
                  Model
                </label>
                <select
                  value={config.defaultModel}
                  onChange={(e) => setConfig({ ...config, defaultModel: e.target.value })}
                  className="w-full bg-slate-700 border border-divine-500/30 rounded-lg px-3 py-2 text-divine-100"
                >
                  {availableModels.length > 0 ? (
                    availableModels.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))
                  ) : (
                    <>
                      <option value="llama-3.1-70b-versatile">Llama 3.1 70B Versatile (Recommended)</option>
                      <option value="llama-3.1-8b-instant">Llama 3.1 8B Instant</option>
                      <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
                      <option value="gemma-7b-it">Gemma 7B IT</option>
                      <option value="qwen2.5-72b-instruct">Qwen2.5 72B Instruct</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-divine-300 mb-2">
                  Temperature
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1.5"
                  step="0.1"
                  value={config.temperature}
                  onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                  className="w-full"
                />
                <div className="text-xs text-slate-400 text-center">
                  {config.temperature.toFixed(1)} (Creativity)
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-divine-300 mb-2">
                Max Tokens
              </label>
              <input
                type="range"
                min="100"
                max="2000"
                step="100"
                value={config.maxTokens}
                onChange={(e) => setConfig({ ...config, maxTokens: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="text-xs text-slate-400 text-center">
                {config.maxTokens} tokens (Response length)
              </div>
            </div>
          </div>

          {/* Test Results */}
          {testResult && (
            <div className={`p-4 rounded-lg border ${testResult.success
              ? 'bg-green-600/20 border-green-500/30'
              : 'bg-red-600/20 border-red-500/30'
              }`}>
              <div className="flex items-center space-x-2">
                {testResult.success ? (
                  <CheckCircle className="text-green-400" size={20} />
                ) : (
                  <AlertCircle className="text-red-400" size={20} />
                )}
                <span className={testResult.success ? 'text-green-100' : 'text-red-100'}>
                  {testResult.message}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleTestConnection}
              disabled={isLoading || !apiKey}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <TestTube size={16} />
              <span>Test Connection</span>
            </button>

            <button
              onClick={handleSaveConfig}
              disabled={isLoading || !apiKey}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-divine-600 hover:bg-divine-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <Settings size={16} />
              <span>Save & Initialize</span>
            </button>
          </div>

          {/* Debug Info */}
          <div className="bg-slate-800 border border-slate-600 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-divine-100 mb-3">Debug Info</h3>
            <div className="text-sm text-slate-300 space-y-2">
              <div>API Key Length: {apiKey.length}</div>
              <div>API Key Preview: {apiKey ? `${apiKey.substring(0, 10)}...` : 'None'}</div>
              <div>Service Status: {JSON.stringify(groqAIService.getStatus())}</div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    console.log('🔍 Current service status:', groqAIService.getStatus());
                    console.log('🔍 Current config:', groqAIService.getConfig());
                  }}
                  className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-divine-100 rounded text-xs transition-colors"
                >
                  Log to Console
                </button>
                <button
                  onClick={() => {
                    loadStatus();
                    console.log('🔄 Status refreshed manually');
                  }}
                  className="px-3 py-1 bg-blue-700 hover:bg-blue-600 text-white rounded text-xs transition-colors"
                >
                  Refresh Status
                </button>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleResetConfig}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-divine-100 rounded-lg transition-colors"
            >
              Reset to Defaults
            </button>
          </div>

          {/* Info */}
          <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Info className="text-blue-400 mt-0.5" size={20} />
              <div className="text-sm text-blue-200">
                <p className="font-medium mb-2">GPT OSS Integration</p>
                <p className="mb-2">
                  This service uses Groq's ultra-fast inference to power your AI Gods with real AI responses.
                  Each god will respond with unique personality based on their temperament and domain.
                </p>
                <p>
                  <strong>Recommended:</strong> Llama 3.1 70B for the best creative responses and divine wisdom.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroqAISettings;
