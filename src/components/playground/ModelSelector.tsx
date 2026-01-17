import { useState, useEffect } from "react";
import { MODELS, PROVIDERS, LLMProvider } from "../../services/llm";
import { Key, CheckCircle, Eye, EyeOff } from "lucide-react";

interface ModelSelectorProps {
  provider: LLMProvider;
  model: string;
  setProvider: (p: LLMProvider) => void;
  setModel: (m: string) => void;
  hasKey: boolean;
  onSaveKey: (key: string) => void;
  theme: any;
}

export const ModelSelector = ({
  provider,
  model,
  setProvider,
  setModel,
  hasKey,
  onSaveKey,
  theme: t
}: ModelSelectorProps) => {
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // When provider changes, set default model
  useEffect(() => {
    const models = MODELS[provider] || [];
    if (models && models.length > 0) {
      if (!models.find(m => m.id === model)) {
          const firstModel = models[0];
          if (firstModel) {
             setModel(firstModel.id);
          }
      }
    }
    // Check if we need to show key input (if no key exists)
    if (!hasKey) {
        setShowKeyInput(true);
    } else {
        setShowKeyInput(false);
    }
  }, [provider, hasKey]);

  const handleSaveKey = () => {
      onSaveKey(apiKeyInput);
      setApiKeyInput("");
      setShowKeyInput(false);
  };

  return (
    <div className={`p-4 rounded-xl border ${t.border} ${t.card} mb-4`}>
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Selection Controls */}
        <div className="flex gap-4 w-full md:w-auto">
          {/* Provider Select */}
          <div className="w-full md:w-48">
            <label className={`block text-xs font-medium ${t.textSecondary} mb-1`}>Provider</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as LLMProvider)}
              className={`w-full p-2 rounded-lg border text-sm ${t.input}`}
            >
              {Object.entries(PROVIDERS).map(([key, val]) => (
                <option key={key} value={val}>{key}</option>
              ))}
            </select>
          </div>

          {/* Model Select */}
          <div className="w-full md:w-48">
            <label className={`block text-xs font-medium ${t.textSecondary} mb-1`}>Model</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className={`w-full p-2 rounded-lg border text-sm ${t.input}`}
            >
              {(MODELS[provider] || []).map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* API Key Status */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            {hasKey && !showKeyInput ? (
                <div className="flex items-center gap-2 text-green-500 text-sm font-medium bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20">
                    <CheckCircle className="w-4 h-4" />
                    <span>API Key Active</span>
                    <button 
                        onClick={() => setShowKeyInput(true)}
                        className={`ml-2 text-xs underline ${t.textSecondary} hover:text-white`}
                    >
                        Change
                    </button>
                </div>
            ) : (
                 <div className="flex items-center gap-2 w-full md:w-[300px]">
                    <div className="relative w-full">
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Key className="h-4 w-4 text-gray-400" />
                          </div>
                        <input 
                            type={showPassword ? "text" : "password"}
                            placeholder={`Enter ${provider.toUpperCase()} API Key`}
                            value={apiKeyInput}
                            onChange={(e) => setApiKeyInput(e.target.value)}
                            className={`pl-10 pr-10 py-2 w-full text-sm rounded-lg border ${t.input}`}
                        />
                         <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-300" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400 hover:text-gray-300" />
                            )}
                          </button>
                    </div>
                    <button
                        onClick={handleSaveKey}
                        disabled={!apiKeyInput}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${t.accent} ${t.accentHover} disabled:opacity-50`}
                    >
                        Save
                    </button>
                    {hasKey && (
                        <button
                            onClick={() => setShowKeyInput(false)}
                            className={`p-2 rounded-lg text-sm ${t.button}`}
                        >
                            Cancel
                        </button>
                    )}
                 </div>
            )}
        </div>
      </div>
    </div>
  );
};
