import React from 'react';

const MasteringModal = ({
  selectedFile,
  step,
  genre,
  setGenre,
  style,
  setStyle,
  intensity,
  setIntensity,
  isPlaying,
  togglePlayback,
  activeVersion,
  switchVersion,
  previewUrl,
  processingProgress,
  processingStage,
  isProcessing,
  startPreview,
  createFinalMaster,
  finalMasteredUrl,
  resetToStart,
  onClose
}) => {
  
  const genres = ['Pop', 'Hip-Hop', 'Trap', 'R&B', 'Soul', 'Jazz', 'Classical', 'Amapiano'];
  const styles = ['Warm', 'Balanced', 'Open'];
  const intensities = ['Low', 'Medium', 'High'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4" onClick={onClose}>
      <div className="relative max-w-lg w-full max-h-[90vh] overflow-y-auto bg-black/90 backdrop-blur-xl rounded-2xl border border-[rgb(217,155,98)]/20 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-8">
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Step 1: Configure */}
        {step === 'configure' && (
          <>
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-white mb-1">{selectedFile.name}</h2>
              <p className="text-sm text-gray-400">
                {previewUrl ? 'Change settings and create new preview' : 'Configure mastering settings'}
              </p>
            </div>

            {/* Play Button */}
            <div className="mb-8">
              <div 
                onClick={togglePlayback}
                className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-[rgb(217,155,98)] to-[rgb(197,135,78)] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform shadow-lg"
              >
                {isPlaying ? (
                  <svg width="48" height="48" fill="black" viewBox="0 0 24 24">
                    <rect x="6" y="4" width="4" height="16"/>
                    <rect x="14" y="4" width="4" height="16"/>
                  </svg>
                ) : (
                  <svg width="48" height="48" fill="black" viewBox="0 0 24 24">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                )}
              </div>
            </div>

            {/* Genre Selection */}
            <div className="mb-6">
              <label className="block mb-2 text-sm text-gray-300">Genre</label>
              <div className="grid grid-cols-4 gap-2">
                {genres.map(g => (
                  <button
                    key={g}
                    onClick={() => setGenre(g)}
                    className={`py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                      genre === g
                        ? 'bg-[rgb(217,155,98)] text-black'
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Style Selection */}
            <div className="mb-6">
              <label className="block mb-2 text-sm text-gray-300">Style (Fine-tune)</label>
              <div className="flex gap-3">
                {styles.map(s => (
                  <button
                    key={s}
                    onClick={() => setStyle(s)}
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                      style === s
                        ? 'bg-[rgb(217,155,98)] text-black'
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Intensity */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-gray-300">Intensity</label>
                <span className="text-sm text-[rgb(217,155,98)]">{intensity}</span>
              </div>
              <div className="flex gap-3">
                {intensities.map(i => (
                  <button
                    key={i}
                    onClick={() => setIntensity(i)}
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                      intensity === i
                        ? 'bg-[rgb(217,155,98)] text-black'
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>

            {/* Create Preview Button */}
            <button
              onClick={startPreview}
              disabled={isProcessing}
              className="w-full py-4 rounded-lg bg-gradient-to-r from-[rgb(217,155,98)] to-[rgb(197,135,78)] hover:from-[rgb(207,145,88)] hover:to-[rgb(187,125,68)] text-black font-bold text-lg disabled:opacity-50 shadow-lg transition-all"
            >
              {isProcessing ? `Processing... ${processingProgress}%` : (previewUrl ? 'Create New Preview' : 'Create Preview')}
            </button>

            {isProcessing && (
              <div className="mt-3 w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-[rgb(217,155,98)] to-[rgb(197,135,78)] h-full transition-all duration-300"
                  style={{ width: `${processingProgress}%` }}
                />
              </div>
            )}

            {/* Back to Preview Button (if preview exists) */}
            {previewUrl && !isProcessing && (
              <button
                onClick={() => setStep('preview')}
                className="w-full mt-3 py-3 rounded-lg bg-white/5 hover:bg-white/10 text-white font-semibold transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Current Preview
              </button>
            )}
          </>
        )}

        {/* Step 2: Preview Comparison */}
        {step === 'preview' && (
          <>
            <button
              onClick={resetToStart}
              className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Settings
            </button>

            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-white mb-1">Preview Comparison</h2>
              <p className="text-sm text-gray-400">Listen to the loudest sections (60s)</p>
            </div>

            {/* Play Button */}
            <div className="mb-6">
              <div 
                onClick={togglePlayback}
                className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-[rgb(217,155,98)] to-[rgb(197,135,78)] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform shadow-lg"
              >
                {isPlaying ? (
                  <svg width="36" height="36" fill="black" viewBox="0 0 24 24">
                    <rect x="6" y="4" width="4" height="16"/>
                    <rect x="14" y="4" width="4" height="16"/>
                  </svg>
                ) : (
                  <svg width="36" height="36" fill="black" viewBox="0 0 24 24">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                )}
              </div>
            </div>

            {/* Waveform Visualization */}
            <div className="mb-6">
              <div className="bg-gray-800/50 rounded-lg p-6 border border-white/5">
                <div className="flex items-center gap-1 h-20 justify-center">
                  {[...Array(60)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-gradient-to-t from-[rgb(217,155,98)] to-[rgb(197,135,78)] rounded-full"
                      style={{
                        height: `${Math.random() * 70 + 20}%`,
                        opacity: 0.8
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Toggle Switch */}
            <div className="mb-6">
              <div className="flex items-center justify-between bg-gray-800 rounded-xl p-1 border border-white/10">
                <button
                  onClick={() => switchVersion('original')}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                    activeVersion === 'original'
                      ? 'bg-white text-gray-900 shadow-lg'
                      : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  Original
                </button>
                <button
                  onClick={() => switchVersion('mastered')}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                    activeVersion === 'mastered'
                      ? 'bg-white text-gray-900 shadow-lg'
                      : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  Mastered
                </button>
              </div>
              <p className="text-center text-sm text-gray-400 mt-2">
                Currently playing: <span className="text-[rgb(217,155,98)] font-semibold">
                  {activeVersion === 'original' ? 'Original' : 'Mastered'}
                </span>
              </p>
            </div>

            {/* Adjustable Settings */}
            <div className="bg-gray-800/50 rounded-lg p-6 mb-6 border border-white/5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Fine-tune Settings
              </h3>
              
              {/* Genre (Read-only) */}
              <div className="mb-4">
                <label className="block mb-2 text-xs text-gray-400">Genre</label>
                <div className="px-4 py-2 bg-gray-700/50 rounded-lg text-white font-semibold text-center">
                  {genre}
                </div>
              </div>

              {/* Style Selection */}
              <div className="mb-4">
                <label className="block mb-2 text-xs text-gray-400">Style (Fine-tune)</label>
                <div className="flex gap-2">
                  {styles.map(s => (
                    <button
                      key={s}
                      onClick={() => setStyle(s)}
                      className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-all ${
                        style === s
                          ? 'bg-[rgb(217,155,98)] text-black'
                          : 'bg-gray-700/50 text-white/70 hover:bg-gray-600/50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Intensity */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-gray-400">Intensity</label>
                  <span className="text-xs text-[rgb(217,155,98)] font-semibold">{intensity}</span>
                </div>
                <div className="flex gap-2">
                  {intensities.map(i => (
                    <button
                      key={i}
                      onClick={() => setIntensity(i)}
                      className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-all ${
                        intensity === i
                          ? 'bg-[rgb(217,155,98)] text-black'
                          : 'bg-gray-700/50 text-white/70 hover:bg-gray-600/50'
                      }`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>

              {/* Regenerate Preview Button */}
              <button
                onClick={startPreview}
                disabled={isProcessing}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-[rgb(217,155,98)] to-[rgb(197,135,78)] hover:from-[rgb(207,145,88)] hover:to-[rgb(187,125,68)] text-black font-bold disabled:opacity-50 shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Regenerating... {processingProgress}%
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Regenerate Preview
                  </>
                )}
              </button>
              <p className="text-xs text-gray-500 text-center mt-2">
                Try different styles & intensities to find your perfect sound
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={createFinalMaster}
                disabled={isProcessing}
                className="w-full py-4 bg-gradient-to-r from-[rgb(217,155,98)] to-[rgb(197,135,78)] hover:from-[rgb(207,145,88)] hover:to-[rgb(187,125,68)] rounded-xl font-bold text-lg text-black shadow-lg transition-all disabled:opacity-50"
              >
                Master Full Track
              </button>
              <button
                onClick={resetToStart}
                disabled={isProcessing}
                className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl font-semibold text-white transition-all disabled:opacity-50"
              >
                Change Genre
              </button>
            </div>
          </>
        )}

        {/* Step 3: Processing */}
        {step === 'processing' && (
          <>
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-white mb-2">Mastering Your Track</h2>
              <p className="text-sm text-gray-400">This may take a few minutes...</p>
            </div>

            {/* Processing Animation */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <svg className="w-24 h-24 text-[rgb(217,155,98)] animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{processingProgress}%</span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[rgb(217,155,98)] to-[rgb(197,135,78)] h-full transition-all duration-500 ease-out"
                  style={{ width: `${processingProgress}%` }}
                />
              </div>
            </div>

            {/* Processing Stage */}
            <p className="text-center text-gray-400 mb-8">{processingStage}</p>

            {/* Song Info */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-white/5">
              <p className="text-sm text-gray-400 mb-1">Processing</p>
              <p className="font-semibold text-white">{selectedFile.name}</p>
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Genre:</span> <span className="text-white">{genre}</span>
                </div>
                <div>
                  <span className="text-gray-500">Style:</span> <span className="text-white">{style}</span>
                </div>
                <div>
                  <span className="text-gray-500">Intensity:</span> <span className="text-white">{intensity}</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Step 4: Complete */}
        {step === 'complete' && (
          <>
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">Mastering Complete!</h2>
              <p className="text-gray-400">Your track is ready to download</p>
            </div>

            {/* Track Info */}
            <div className="bg-gray-800/50 rounded-lg p-6 mb-6 border border-white/5">
              <h3 className="font-semibold text-lg text-white mb-1">{selectedFile.name}</h3>
              
              <div className="grid grid-cols-3 gap-4 mb-4 mt-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Genre</p>
                  <p className="font-medium text-sm text-white">{genre}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Style</p>
                  <p className="font-medium text-sm text-white">{style}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Intensity</p>
                  <p className="font-medium text-sm text-white">{intensity}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>{selectedFile.name}_Mastered.wav</span>
              </div>
            </div>

            {/* Download Button */}
            <a
              href={finalMasteredUrl}
              download
              className="block w-full py-4 bg-gradient-to-r from-[rgb(217,155,98)] to-[rgb(197,135,78)] hover:from-[rgb(207,145,88)] hover:to-[rgb(187,125,68)] rounded-xl font-bold text-lg text-black text-center shadow-lg transition-all flex items-center justify-center gap-2 mb-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Mastered Track
            </a>

            {/* Advanced Tweaking Button */}
            <button
              onClick={() => setStep('advanced')}
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 mb-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Advanced Tweaking
            </button>

            {/* Secondary Actions */}
            <button
              onClick={() => { resetToStart(); onClose(); }}
              className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl font-semibold text-white transition-all"
            >
              Master Another Track
            </button>
          </>
        )}

        </div>
      </div>
    </div>
  );
};

export default MasteringModal;
