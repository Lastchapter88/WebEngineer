import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

const AdvancedMasterConsole = ({ 
  masteredFile, 
  onSave, 
  onBack 
}) => {
  const [activePlugin, setActivePlugin] = useState('eq');
  const [isSaving, setIsSaving] = useState(false);
  
  // Plugin states
  const [eqSettings, setEqSettings] = useState({
    enabled: true,
    lowShelf: { freq: 80, gain: 0, q: 0.7 },
    lowMid: { freq: 250, gain: 0, q: 1.0 },
    mid: { freq: 1000, gain: 0, q: 1.0 },
    highMid: { freq: 4000, gain: 0, q: 1.0 },
    highShelf: { freq: 12000, gain: 0, q: 0.7 }
  });

  const [compressorSettings, setCompressorSettings] = useState({
    enabled: true,
    threshold: -20,
    ratio: 4,
    attack: 10,
    release: 100,
    knee: 3,
    makeup: 0
  });

  const [limiterSettings, setLimiterSettings] = useState({
    enabled: true,
    threshold: -1.0,
    ceiling: -0.3,
    release: 50
  });

  const [stereoSettings, setStereoSettings] = useState({
    enabled: false,
    width: 100,
    balance: 0
  });

  const [exciterSettings, setExciterSettings] = useState({
    enabled: false,
    amount: 0,
    frequency: 5000,
    harmonics: 2
  });

  const plugins = [
    { id: 'eq', name: 'EQ', icon: '📊' },
    { id: 'compressor', name: 'Compressor', icon: '⚡' },
    { id: 'limiter', name: 'Limiter', icon: '🛡️' },
    { id: 'stereo', name: 'Stereo', icon: '🎚️' },
    { id: 'exciter', name: 'Exciter', icon: '✨' }
  ];

  const handleApplyChanges = async () => {
    setIsSaving(true);
    toast.loading('Applying advanced settings...');
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/master/advanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_path: masteredFile,
          eq: eqSettings,
          compressor: compressorSettings,
          limiter: limiterSettings,
          stereo: stereoSettings,
          exciter: exciterSettings
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        toast.dismiss();
        toast.success('Advanced settings applied!');
      } else {
        throw new Error(result.detail || 'Failed to apply settings');
      }
    } catch (error) {
      toast.dismiss();
      toast.error(`Failed: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all advanced settings to AI master defaults?')) {
      setEqSettings({
        enabled: true,
        lowShelf: { freq: 80, gain: 0, q: 0.7 },
        lowMid: { freq: 250, gain: 0, q: 1.0 },
        mid: { freq: 1000, gain: 0, q: 1.0 },
        highMid: { freq: 4000, gain: 0, q: 1.0 },
        highShelf: { freq: 12000, gain: 0, q: 0.7 }
      });
      setCompressorSettings({
        enabled: true,
        threshold: -20,
        ratio: 4,
        attack: 10,
        release: 100,
        knee: 3,
        makeup: 0
      });
      setLimiterSettings({
        enabled: true,
        threshold: -1.0,
        ceiling: -0.3,
        release: 50
      });
      setStereoSettings({
        enabled: false,
        width: 100,
        balance: 0
      });
      setExciterSettings({
        enabled: false,
        amount: 0,
        frequency: 5000,
        harmonics: 2
      });
      toast.success('Settings reset to defaults');
    }
  };

  const togglePlugin = (pluginId) => {
    switch(pluginId) {
      case 'eq':
        setEqSettings(prev => ({ ...prev, enabled: !prev.enabled }));
        break;
      case 'compressor':
        setCompressorSettings(prev => ({ ...prev, enabled: !prev.enabled }));
        break;
      case 'limiter':
        setLimiterSettings(prev => ({ ...prev, enabled: !prev.enabled }));
        break;
      case 'stereo':
        setStereoSettings(prev => ({ ...prev, enabled: !prev.enabled }));
        break;
      case 'exciter':
        setExciterSettings(prev => ({ ...prev, enabled: !prev.enabled }));
        break;
    }
  };

  const renderEQControls = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Parametric EQ</h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-sm text-gray-400">Bypass</span>
          <input
            type="checkbox"
            checked={!eqSettings.enabled}
            onChange={() => setEqSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
            className="w-4 h-4"
          />
        </label>
      </div>

      {Object.entries(eqSettings).map(([key, value]) => {
        if (key === 'enabled') return null;
        
        const bandNames = {
          lowShelf: 'Low Shelf',
          lowMid: 'Low Mid',
          mid: 'Mid',
          highMid: 'High Mid',
          highShelf: 'High Shelf'
        };

        return (
          <div key={key} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <h4 className="text-sm font-semibold text-[rgb(217,155,98)] mb-3">{bandNames[key]}</h4>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Freq (Hz)</label>
                <input
                  type="number"
                  value={value.freq}
                  onChange={(e) => setEqSettings(prev => ({
                    ...prev,
                    [key]: { ...prev[key], freq: parseFloat(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 bg-slate-900 text-white rounded border border-slate-700 focus:border-[rgb(217,155,98)] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Gain (dB)</label>
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="0.1"
                  value={value.gain}
                  onChange={(e) => setEqSettings(prev => ({
                    ...prev,
                    [key]: { ...prev[key], gain: parseFloat(e.target.value) }
                  }))}
                  className="w-full"
                />
                <span className="text-xs text-white">{value.gain.toFixed(1)} dB</span>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Q</label>
                <input
                  type="range"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={value.q}
                  onChange={(e) => setEqSettings(prev => ({
                    ...prev,
                    [key]: { ...prev[key], q: parseFloat(e.target.value) }
                  }))}
                  className="w-full"
                />
                <span className="text-xs text-white">{value.q.toFixed(1)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderCompressorControls = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Multiband Compressor</h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-sm text-gray-400">Bypass</span>
          <input
            type="checkbox"
            checked={!compressorSettings.enabled}
            onChange={() => setCompressorSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
            className="w-4 h-4"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <label className="text-sm text-gray-400 block mb-2">Threshold</label>
          <input
            type="range"
            min="-60"
            max="0"
            step="0.5"
            value={compressorSettings.threshold}
            onChange={(e) => setCompressorSettings(prev => ({ ...prev, threshold: parseFloat(e.target.value) }))}
            className="w-full"
          />
          <span className="text-white font-mono">{compressorSettings.threshold.toFixed(1)} dB</span>
        </div>

        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <label className="text-sm text-gray-400 block mb-2">Ratio</label>
          <input
            type="range"
            min="1"
            max="20"
            step="0.5"
            value={compressorSettings.ratio}
            onChange={(e) => setCompressorSettings(prev => ({ ...prev, ratio: parseFloat(e.target.value) }))}
            className="w-full"
          />
          <span className="text-white font-mono">{compressorSettings.ratio.toFixed(1)}:1</span>
        </div>

        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <label className="text-sm text-gray-400 block mb-2">Attack</label>
          <input
            type="range"
            min="0.1"
            max="100"
            step="0.1"
            value={compressorSettings.attack}
            onChange={(e) => setCompressorSettings(prev => ({ ...prev, attack: parseFloat(e.target.value) }))}
            className="w-full"
          />
          <span className="text-white font-mono">{compressorSettings.attack.toFixed(1)} ms</span>
        </div>

        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <label className="text-sm text-gray-400 block mb-2">Release</label>
          <input
            type="range"
            min="10"
            max="500"
            step="1"
            value={compressorSettings.release}
            onChange={(e) => setCompressorSettings(prev => ({ ...prev, release: parseFloat(e.target.value) }))}
            className="w-full"
          />
          <span className="text-white font-mono">{compressorSettings.release.toFixed(0)} ms</span>
        </div>

        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <label className="text-sm text-gray-400 block mb-2">Knee</label>
          <input
            type="range"
            min="0"
            max="12"
            step="0.5"
            value={compressorSettings.knee}
            onChange={(e) => setCompressorSettings(prev => ({ ...prev, knee: parseFloat(e.target.value) }))}
            className="w-full"
          />
          <span className="text-white font-mono">{compressorSettings.knee.toFixed(1)} dB</span>
        </div>

        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <label className="text-sm text-gray-400 block mb-2">Makeup Gain</label>
          <input
            type="range"
            min="0"
            max="24"
            step="0.5"
            value={compressorSettings.makeup}
            onChange={(e) => setCompressorSettings(prev => ({ ...prev, makeup: parseFloat(e.target.value) }))}
            className="w-full"
          />
          <span className="text-white font-mono">+{compressorSettings.makeup.toFixed(1)} dB</span>
        </div>
      </div>
    </div>
  );

  const renderLimiterControls = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">True Peak Limiter</h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-sm text-gray-400">Bypass</span>
          <input
            type="checkbox"
            checked={!limiterSettings.enabled}
            onChange={() => setLimiterSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
            className="w-4 h-4"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="p-6 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <label className="text-sm text-gray-400 block mb-3">Input Threshold</label>
          <input
            type="range"
            min="-12"
            max="0"
            step="0.1"
            value={limiterSettings.threshold}
            onChange={(e) => setLimiterSettings(prev => ({ ...prev, threshold: parseFloat(e.target.value) }))}
            className="w-full h-3"
          />
          <div className="flex justify-between mt-2">
            <span className="text-white font-mono text-lg">{limiterSettings.threshold.toFixed(1)} dB</span>
            <span className="text-gray-500 text-sm">More limiting ←→ Less limiting</span>
          </div>
        </div>

        <div className="p-6 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <label className="text-sm text-gray-400 block mb-3">Output Ceiling</label>
          <input
            type="range"
            min="-2"
            max="0"
            step="0.1"
            value={limiterSettings.ceiling}
            onChange={(e) => setLimiterSettings(prev => ({ ...prev, ceiling: parseFloat(e.target.value) }))}
            className="w-full h-3"
          />
          <div className="flex justify-between mt-2">
            <span className="text-white font-mono text-lg">{limiterSettings.ceiling.toFixed(1)} dBFS</span>
            <span className="text-gray-500 text-sm">Recommended: -0.3 dBFS</span>
          </div>
        </div>

        <div className="p-6 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <label className="text-sm text-gray-400 block mb-3">Release Time</label>
          <input
            type="range"
            min="1"
            max="200"
            step="1"
            value={limiterSettings.release}
            onChange={(e) => setLimiterSettings(prev => ({ ...prev, release: parseFloat(e.target.value) }))}
            className="w-full h-3"
          />
          <div className="flex justify-between mt-2">
            <span className="text-white font-mono text-lg">{limiterSettings.release.toFixed(0)} ms</span>
            <span className="text-gray-500 text-sm">Fast ←→ Slow</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStereoControls = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Stereo Imaging</h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-sm text-gray-400">Bypass</span>
          <input
            type="checkbox"
            checked={!stereoSettings.enabled}
            onChange={() => setStereoSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
            className="w-4 h-4"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="p-6 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <label className="text-sm text-gray-400 block mb-3">Stereo Width</label>
          <input
            type="range"
            min="0"
            max="200"
            step="1"
            value={stereoSettings.width}
            onChange={(e) => setStereoSettings(prev => ({ ...prev, width: parseFloat(e.target.value) }))}
            className="w-full h-3"
          />
          <div className="flex justify-between mt-2">
            <span className="text-white font-mono text-lg">{stereoSettings.width}%</span>
            <span className="text-gray-500 text-sm">Mono ←→ Wide</span>
          </div>
        </div>

        <div className="p-6 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <label className="text-sm text-gray-400 block mb-3">Pan/Balance</label>
          <input
            type="range"
            min="-100"
            max="100"
            step="1"
            value={stereoSettings.balance}
            onChange={(e) => setStereoSettings(prev => ({ ...prev, balance: parseFloat(e.target.value) }))}
            className="w-full h-3"
          />
          <div className="flex justify-between mt-2">
            <span className="text-white font-mono text-lg">
              {stereoSettings.balance === 0 ? 'Center' : 
               stereoSettings.balance < 0 ? `${Math.abs(stereoSettings.balance)}% L` : 
               `${stereoSettings.balance}% R`}
            </span>
            <span className="text-gray-500 text-sm">Left ←→ Right</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderExciterControls = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Harmonic Exciter</h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-sm text-gray-400">Bypass</span>
          <input
            type="checkbox"
            checked={!exciterSettings.enabled}
            onChange={() => setExciterSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
            className="w-4 h-4"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="p-6 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <label className="text-sm text-gray-400 block mb-3">Amount</label>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={exciterSettings.amount}
            onChange={(e) => setExciterSettings(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
            className="w-full h-3"
          />
          <div className="flex justify-between mt-2">
            <span className="text-white font-mono text-lg">{exciterSettings.amount}%</span>
            <span className="text-gray-500 text-sm">Subtle ←→ Intense</span>
          </div>
        </div>

        <div className="p-6 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <label className="text-sm text-gray-400 block mb-3">Frequency</label>
          <input
            type="range"
            min="2000"
            max="16000"
            step="100"
            value={exciterSettings.frequency}
            onChange={(e) => setExciterSettings(prev => ({ ...prev, frequency: parseFloat(e.target.value) }))}
            className="w-full h-3"
          />
          <div className="flex justify-between mt-2">
            <span className="text-white font-mono text-lg">{exciterSettings.frequency} Hz</span>
            <span className="text-gray-500 text-sm">Warm ←→ Bright</span>
          </div>
        </div>

        <div className="p-6 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <label className="text-sm text-gray-400 block mb-3">Harmonic Type</label>
          <select
            value={exciterSettings.harmonics}
            onChange={(e) => setExciterSettings(prev => ({ ...prev, harmonics: parseInt(e.target.value) }))}
            className="w-full px-4 py-3 bg-slate-900 text-white rounded border border-slate-700 focus:border-[rgb(217,155,98)] focus:outline-none"
          >
            <option value={2}>Even (Warm, Tube-like)</option>
            <option value={3}>Odd (Bright, Transistor-like)</option>
            <option value={4}>Both (Complex, Tape-like)</option>
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 overflow-y-auto">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-lg border-b border-slate-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Advanced Master Console</h1>
                <p className="text-sm text-gray-400">Fine-tune your master like a pro engineer</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                Reset
              </button>
              
              <button
                onClick={handleApplyChanges}
                disabled={isSaving}
                className="px-6 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    Apply Changes
                  </>
                )}
              </button>

              <button
                onClick={onSave}
                className="px-6 py-2 bg-gradient-to-r from-[rgb(217,155,98)] to-[rgb(197,135,78)] hover:from-[rgb(207,145,88)] hover:to-[rgb(187,125,68)] text-black font-bold rounded-lg transition-all"
              >
                Save & Download
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          
          {/* Plugin Sidebar */}
          <div className="col-span-3">
            <div className="sticky top-24 space-y-2">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Plugins</h3>
              
              {plugins.map((plugin) => {
                const isEnabled = 
                  (plugin.id === 'eq' && eqSettings.enabled) ||
                  (plugin.id === 'compressor' && compressorSettings.enabled) ||
                  (plugin.id === 'limiter' && limiterSettings.enabled) ||
                  (plugin.id === 'stereo' && stereoSettings.enabled) ||
                  (plugin.id === 'exciter' && exciterSettings.enabled);

                return (
                  <button
                    key={plugin.id}
                    onClick={() => setActivePlugin(plugin.id)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      activePlugin === plugin.id
                        ? 'border-[rgb(217,155,98)] bg-[rgb(217,155,98)]/10' 
                        : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{plugin.icon}</span>
                        <span className="font-semibold text-white">{plugin.name}</span>
                      </div>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={(e) => {
                            e.stopPropagation();
                            togglePlugin(plugin.id);
                          }}
                          className="w-5 h-5 rounded"
                        />
                      </div>
                    </div>
                    <div className={`h-1 rounded-full ${isEnabled ? 'bg-[rgb(217,155,98)]' : 'bg-gray-700'}`}></div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Plugin Controls */}
          <div className="col-span-9">
            <div className="bg-slate-800/30 backdrop-blur-lg rounded-2xl border border-slate-700/50 p-8">
              {activePlugin === 'eq' && renderEQControls()}
              {activePlugin === 'compressor' && renderCompressorControls()}
              {activePlugin === 'limiter' && renderLimiterControls()}
              {activePlugin === 'stereo' && renderStereoControls()}
              {activePlugin === 'exciter' && renderExciterControls()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedMasterConsole;
