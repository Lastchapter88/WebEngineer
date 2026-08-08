import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';

const Upload = () => {
  const [mainFile, setMainFile] = useState(null);
  const [refFile, setRefFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [finalMasteredUrl, setFinalMasteredUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [genre, setGenre] = useState('Pop');
  const [style, setStyle] = useState('Balanced');
  const [loudness, setLoudness] = useState('Medium');
  const [activeVersion, setActiveVersion] = useState('original'); // 'original' or 'mastered'
  const [originalUrl, setOriginalUrl] = useState(null);

  const audioPlayer = useRef(null);
  const progressFill = useRef(null);
  const timeDisplay = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const animationFrameId = useRef(null);
  const waveformBarsRef = useRef([]);

  
  const startPreview = useCallback(async () => {
    if (!mainFile) {
      toast.error('Please select a file to master.');
      return;
    }

    console.log('Starting preview process...');
    console.log('Main file:', mainFile);
    console.log('Style:', style, 'Loudness:', loudness, 'Genre:', genre);

    setIsProcessing(true);
    setPreviewUrl(null);
    const formData = new FormData();
    formData.append('file', mainFile);

    try {
      console.log('Uploading file to backend...');
      const uploadResponse = await fetch('http://127.0.0.1:8000/api/v1/upload/track', { 
        method: 'POST', 
        body: formData 
      }).catch(err => {
        console.error('Network error during upload:', err);
        throw new Error('Cannot connect to backend server. Is it running on port 8000?');
      });
      console.log('Upload response status:', uploadResponse.status);
      
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('Upload failed:', errorText);
        throw new Error(`File upload failed: ${uploadResponse.status}`);
      }
      
      const uploadResult = await uploadResponse.json();
      console.log('Upload result:', uploadResult);
      const { file_id } = uploadResult;

      console.log('Starting preview with style:', style, 'loudness:', loudness, 'genre:', genre);
      const masterResponse = await fetch('http://127.0.0.1:8000/api/v1/master/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          file_id, 
          genre: genre,
          style: style,
          intensity: loudness,
          preview_duration: 60.0
        }),
      });
      console.log('Preview response status:', masterResponse.status);
      
      if (!masterResponse.ok) {
        const errorText = await masterResponse.text();
        console.error('Preview creation failed:', errorText);
        throw new Error(`Preview creation failed: ${masterResponse.status}`);
      }
      
      const masterResult = await masterResponse.json();
      console.log('Preview result:', masterResult);
      const { job_id } = masterResult;
      toast.success('Creating preview from loudest parts...');

      let pollCount = 0;
      const maxPolls = 40; // 2 minutes max (40 * 3 seconds)
      const interval = setInterval(async () => {
        pollCount++;
        // Simulate progress (0-90% while polling, 100% when complete)
        const simulatedProgress = Math.min(90, pollCount * 15);
        setProcessingProgress(simulatedProgress);
        
        // Timeout after max polls
        if (pollCount > maxPolls) {
          clearInterval(interval);
          setIsProcessing(false);
          setProcessingProgress(0);
          toast.error('Processing timeout. Please try again.');
          return;
        }
        
        try {
          console.log('Checking preview status for job:', job_id, `(attempt ${pollCount})`);
          const statusResponse = await fetch(`http://127.0.0.1:8000/api/v1/master/${job_id}/status`);
          
          if (!statusResponse.ok) {
            console.error('Status check failed:', statusResponse.status);
            throw new Error(`Status check failed: ${statusResponse.status}`);
          }
          
          const statusResult = await statusResponse.json();
          console.log('Preview status result:', statusResult);
          
          if (statusResult.status === 'completed') {
            setProcessingProgress(100);
            
            // Use the new preview URLs
            if (statusResult.preview_mastered_url && statusResult.preview_original_url) {
              const masteredPreviewUrl = `http://127.0.0.1:8000${statusResult.preview_mastered_url}`;
              const originalPreviewUrl = `http://127.0.0.1:8000${statusResult.preview_original_url}`;
              
              setPreviewUrl(masteredPreviewUrl);
              setOriginalUrl(originalPreviewUrl);
              
              console.log('Preview URLs ready:', {
                original: originalPreviewUrl,
                mastered: masteredPreviewUrl
              });
            } else {
              // Fallback to old behavior
              const previewAudioUrl = `http://127.0.0.1:8000${statusResult.download_url}`;
              setPreviewUrl(previewAudioUrl);
            }
            
            setIsProcessing(false);
            clearInterval(interval);
            setShowComparisonModal(true);
            toast.success('Preview ready! Compare original vs mastered.');
          } else if (statusResult.status === 'failed') {
            clearInterval(interval);
            setIsProcessing(false);
            setProcessingProgress(0);
            toast.error(`Processing failed: ${statusResult.error || 'Unknown error'}`);
          }
        } catch (error) {
          console.error('Status polling error:', error);
          clearInterval(interval);
          setIsProcessing(false);
          setProcessingProgress(0);
          toast.error('Failed to check processing status');
        }
      }, 2000);
    } catch (error) {
      console.error('Mastering error:', error);
      toast.error(error.message || 'An error occurred during processing');
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  }, [mainFile, genre, style, loudness]);

  const createFinalMaster = useCallback(async () => {
    if (!previewUrl) {
      toast.error('No preview available to save.');
      return;
    }

    setIsSaving(true);
    try {
      // In a real implementation, this would save the master to the user's library
      // For now, we'll just set the final URL to the preview URL
      setFinalMasteredUrl(previewUrl);
      toast.success('Master saved! Ready for download.');
      setIsSaving(false);
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save master');
      setIsSaving(false);
    }
  }, [previewUrl]);

  const onDropMain = useCallback(acceptedFiles => {
    const file = acceptedFiles[0];
    if (!file) return;

    const validTypes = ['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/flac', 'audio/aiff', 'audio/x-aiff', 'audio/x-m4a', 'audio/aac'];
    const validExts = /\.(wav|mp3|flac|aiff|aif|m4a|aac)$/i;

    if (!validTypes.includes(file.type) && !validExts.test(file.name)) {
      toast.error('Please upload a valid audio file (WAV, MP3, FLAC, AIFF).');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 100MB.');
      return;
    }

    // Reset preview/final state when a new file is chosen
    setPreviewUrl(null);
    setFinalMasteredUrl(null);
    setActiveVersion('original');
    setIsProcessing(false);
    setIsSaving(false);
    setProcessingProgress(0);
    setShowComparisonModal(false);
    setMainFile(file);
    const url = URL.createObjectURL(file);
    setOriginalUrl(url);
    if (audioPlayer.current) {
      audioPlayer.current.src = url;
    }
  }, []);

  const onDropRef = useCallback(acceptedFiles => {
    const file = acceptedFiles[0];
    if (!file) return;
    setRefFile(file);
  }, []);

  const { getRootProps: mainDropProps, getInputProps: mainInputProps, isDragActive: mainDragActive } = useDropzone({ onDrop: onDropMain, accept: 'audio/*' });
  const { getRootProps: refDropProps, getInputProps: refInputProps } = useDropzone({ onDrop: onDropRef, accept: 'audio/*' });

  useEffect(() => {
    const player = audioPlayer.current;
    const updateProgress = () => {
      if (player && progressFill.current && timeDisplay.current) {
        const percent = (player.currentTime / player.duration) * 100;
        progressFill.current.style.width = `${percent || 0}%`;
        timeDisplay.current.textContent = formatTime(player.currentTime);
      }
    };
    if (player) player.addEventListener('timeupdate', updateProgress);
    return () => {
      if (player) player.removeEventListener('timeupdate', updateProgress);
    };
  }, []);

  const setupAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
    }
    if (audioPlayer.current && !sourceRef.current) {
      sourceRef.current = audioContextRef.current.createMediaElementSource(audioPlayer.current);
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
    }
  };

  const visualize = () => {
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameId.current = requestAnimationFrame(draw);
      analyserRef.current.getByteFrequencyData(dataArray);
      waveformBarsRef.current.forEach((bar, i) => {
        if (bar) {
          const barHeight = (dataArray[i] / 255) * 100;
          bar.style.height = `${barHeight}%`;
        }
      });
    };
    draw();
  };

  useEffect(() => {
    if (mainFile && audioPlayer.current) {
      audioPlayer.current.play().catch(error => {
        console.error("Autoplay failed:", error);
        toast('Click play to start the audio.', { icon: 'ℹ️' });
      });
    }
  }, [mainFile]);

  const switchVersion = (version) => {
    if (!previewUrl && version === 'mastered') {
      toast.error('Preview is not ready yet!');
      return;
    }
    
    if (audioPlayer.current) {
      const wasPlaying = !audioPlayer.current.paused;
      const currentTime = audioPlayer.current.currentTime;
      
      setActiveVersion(version);
      audioPlayer.current.src = version === 'original' ? originalUrl : previewUrl;
      audioPlayer.current.currentTime = currentTime;
      
      if (wasPlaying) {
        audioPlayer.current.play();
      }
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const togglePlay = (e) => {
    e.stopPropagation();
    if (audioPlayer.current.paused) {
      const playAudio = () => {
        audioPlayer.current.play();
        visualize();
        setIsPlaying(true);
      };

      if (!audioContextRef.current) {
        setupAudioContext();
      }

      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().then(playAudio);
      } else {
        playAudio();
      }
    
    } else {
      audioPlayer.current.pause();
      cancelAnimationFrame(animationFrameId.current);
      setIsPlaying(false);
    }
  };

  return (
    <>
      <div className="bg-studio" />
      <div className="content-wrapper min-h-screen flex flex-col justify-center items-center p-5">
        <div className="max-w-3xl w-full">
          <header className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white text-shadow">Welcome to Online Mastering with <span style={{ color: 'rgba(var(--warm-accent), 1)' }}>AIMSTR</span></h1>
            <p className="text-lg text-white/90 mt-2 text-shadow">Create custom, affordable, release-ready masters in minutes</p>
          </header>

          {/* Step Indicator */}
          <div className="max-w-3xl mx-auto mb-6 px-2">
            <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
              <div className={`rounded-full py-2 text-center ${!mainFile ? 'bg-yellow-700/40 text-white' : 'bg-yellow-600 text-black'}`}>1. Upload</div>
              <div className={`rounded-full py-2 text-center ${mainFile && !previewUrl ? 'bg-yellow-600 text-black' : previewUrl ? 'bg-yellow-600 text-black' : 'bg-yellow-700/40 text-white'}`}>2. Preview</div>
              <div className={`rounded-full py-2 text-center ${finalMasteredUrl ? 'bg-yellow-600 text-black' : 'bg-yellow-700/40 text-white'}`}>3. Create Master</div>
            </div>
          </div>

          <div {...mainDropProps()} className={`upload-card rounded-2xl p-10 mb-6 ${mainFile ? 'has-file' : ''} ${mainDragActive ? 'drag-active' : ''}`}>
            <input {...mainInputProps()} />
            {!mainFile ? (
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <svg className="icon-upload" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <p className="text-xl font-semibold text-white mb-2">Click to upload or drag and drop</p>
                <p className="file-info">WAV, MP3, FLAC, AIFF • Max 100MB</p>
              </div>
            ) : (
              <div>
                <div className="text-center mb-4">
                  <p className="file-name">{mainFile.name}</p>
                  <p className="file-info">{(mainFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
                <div className="waveform-container">{[...Array(64)].map((_, i) => <div key={i} className="waveform-bar" ref={el => waveformBarsRef.current[i] = el} style={{ height: `${20 + Math.random() * 60}%` }} />)}</div>
                <div className="player-controls">
                  <button onClick={togglePlay} className="play-button">
                    {isPlaying ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(var(--warm-accent), 0.95)" strokeWidth="2.5"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(var(--warm-accent), 0.95)" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                    )}
                  </button>
                  <div className="progress-bar" onClick={(e) => { e.stopPropagation(); const rect = e.currentTarget.getBoundingClientRect(); audioPlayer.current.currentTime = ((e.clientX - rect.left) / rect.width) * audioPlayer.current.duration; }}>
                    <div ref={progressFill} className="progress-fill"></div>
                  </div>
                  <span ref={timeDisplay} className="time-display">0:00</span>
                </div>
              </div>
            )}
          </div>

          <div {...refDropProps()} className={`upload-card rounded-lg p-6 mb-8 ${refFile ? 'has-file' : ''}`}>
            <input {...refInputProps()} />
            <div className="flex items-center gap-4">
              <svg className="icon-upload w-8 h-8 flex-shrink-0" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <div>
                <p className="text-lg font-semibold text-white">{refFile ? `✓ Reference: ${refFile.name}` : 'Upload a desired output song'}</p>
                <p className="file-info">Optional: a track you want your result to resemble</p>
              </div>
            </div>
          </div>

          {mainFile && !previewUrl && (
            <div className="mb-8 p-6 bg-black/40 backdrop-blur-md rounded-lg border border-white/10">

              {/* Style Selection */}
              <div className="mb-6">
                <label className="block mb-2 text-sm font-semibold text-white/90">Style</label>
                <div className="flex gap-2">
                  {['Warm', 'Balanced', 'Open'].map(s => (
                    <button
                      key={s}
                      onClick={() => setStyle(s)}
                      className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                        style === s
                          ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-white'
                          : 'bg-gray-700/50 text-white/70 hover:bg-gray-600/50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Loudness Selection */}
              <div className="mb-6">
                <label className="block mb-2 text-sm font-semibold text-white/90">Loudness</label>
                <div className="flex gap-2">
                  {['Low', 'Medium', 'High'].map(l => (
                    <button
                      key={l}
                      onClick={() => setLoudness(l)}
                      className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                        loudness === l
                          ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-white'
                          : 'bg-gray-700/50 text-white/70 hover:bg-gray-600/50'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Genre Selection */}
              <div className="mb-6">
                <label htmlFor="genre-preset" className="block mb-2 text-sm font-semibold text-white/90">Genre</label>
                <select id="genre-preset" value={genre} onChange={(e) => setGenre(e.target.value)} className="w-full p-3 bg-gray-800/80 rounded-lg text-white/90 border border-white/10 focus:ring-2 focus:ring-yellow-500 focus:outline-none">
                  <option>Pop</option>
                  <option>Rock</option>
                  <option>Hip-Hop</option>
                  <option>Electronic</option>
                  <option>Acoustic</option>
                  <option>Jazz</option>
                  <option>Classical</option>
                </select>
              </div>

              {/* Process Preview Button */}
              <div className="text-center">
                <button onClick={startPreview} disabled={isProcessing} className="btn-primary w-full">
                  {isProcessing ? `Processing... ${processingProgress}%` : 'Create Preview'}
                </button>
                {isProcessing && (
                  <div className="mt-3 w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-full transition-all duration-300"
                      style={{ width: `${processingProgress}%` }}
                    />
                  </div>
                )}
                {!isProcessing && (
                  <p className="text-xs text-white/50 mt-2">Generate a preview to compare before finalizing</p>
                )}
              </div>
            </div>
          )}

          {/* Comparison Modal - Popup overlay */}
          {showComparisonModal && previewUrl && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowComparisonModal(false)}>
              <div className="relative max-w-2xl w-full mx-4 p-8 bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-[rgb(217,155,98)]/30 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                {/* Close button */}
                <button 
                  onClick={() => setShowComparisonModal(false)}
                  className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                <h2 className="text-2xl font-bold text-white mb-6 text-center">Compare Versions</h2>
              
              {/* Toggle Switch */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <span className={`text-sm font-semibold transition-colors ${
                  activeVersion === 'original' ? 'text-white' : 'text-white/50'
                }`}>Original</span>
                <button
                  onClick={() => switchVersion(activeVersion === 'original' ? 'mastered' : 'original')}
                  className={`relative w-14 h-7 rounded-full transition-all ${
                    activeVersion === 'mastered' ? 'bg-[rgb(217,155,98)]' : 'bg-gray-600'
                  }`}
                  title="Toggle between original and mastered"
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
                      activeVersion === 'mastered' ? 'translate-x-7' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className={`text-sm font-semibold transition-colors ${
                  activeVersion === 'mastered' ? 'text-[rgb(217,155,98)]' : 'text-white/50'
                }`}>Master</span>
              </div>
              
                <p className="text-center text-sm text-[rgb(217,155,98)] mb-6">
                  ✓ Preview ready! Toggle between versions while playing
                </p>

                {/* Show current preset settings */}
                <div className="text-center text-xs text-white/50 mb-6 p-3 bg-black/30 rounded-lg">
                  <p>Style: <span className="text-[rgb(217,155,98)] font-semibold">{style}</span> | Loudness: <span className="text-[rgb(217,155,98)] font-semibold">{loudness}</span> | Genre: <span className="text-[rgb(217,155,98)] font-semibold">{genre}</span></p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-center">
                  {!finalMasteredUrl ? (
                    <>
                      <button 
                        onClick={() => setShowComparisonModal(false)}
                        className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all"
                      >
                        Keep Editing
                      </button>
                      <button 
                        onClick={() => {
                          createFinalMaster();
                        }} 
                        disabled={isSaving}
                        className="px-8 py-3 bg-gradient-to-r from-[rgb(217,155,98)] to-[rgb(197,135,78)] hover:from-[rgb(207,145,88)] hover:to-[rgb(187,125,68)] text-black font-bold rounded-lg transition-all shadow-lg"
                      >
                        {isSaving ? 'Saving...' : 'Save Master'}
                      </button>
                    </>
                  ) : (
                    <div className="text-center w-full">
                      <p className="text-green-400 font-semibold mb-3">✓ Master saved to library!</p>
                      <a href={finalMasteredUrl} download className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all">
                        Download Master
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
        <audio ref={audioPlayer} style={{ display: 'none' }} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onEnded={() => { setIsPlaying(false); cancelAnimationFrame(animationFrameId.current); }} />
      </div>
    </>
  );
};

export default Upload;
