import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import MasteringModal from '../components/MasteringModal';
import AdvancedMasterConsole from '../components/AdvancedMasterConsole';

const Library = ({ user, onSignOut, onAdminClick }) => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showMasteringModal, setShowMasteringModal] = useState(false);
  const [step, setStep] = useState('configure'); // 'configure', 'preview', 'processing', 'complete', 'advanced'
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState('Analyzing audio...');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [genre, setGenre] = useState('Pop');
  const [style, setStyle] = useState('Balanced');
  const [intensity, setIntensity] = useState('Medium');
  const [activeVersion, setActiveVersion] = useState('original');
  const [isPlaying, setIsPlaying] = useState(false);
  const [finalMasteredUrl, setFinalMasteredUrl] = useState(null);
  
  const audioPlayer = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const validTypes = ['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/flac', 'audio/aiff'];
    if (!validTypes.includes(file.type) && !/\.(wav|mp3|flac|aiff|aif)$/i.test(file.name)) {
      toast.error('Please upload a valid audio file (WAV, MP3, FLAC, AIFF).');
      return;
    }

    const newFile = {
      id: Date.now(),
      file: file,
      name: file.name.replace(/\.[^/.]+$/, ""),
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      created: 'just now',
      url: URL.createObjectURL(file),
      status: 'processing'
    };

    setFiles(prev => [newFile, ...prev]);
    
    // Simulate processing
    setTimeout(() => {
      const readyFile = { ...newFile, status: 'ready' };
      setFiles(prev => prev.map(f => 
        f.id === newFile.id ? readyFile : f
      ));
      openMasteringModal(readyFile);
      toast.success('File ready for mastering!');
    }, 2000);
  }, []);

  const handleDeleteFile = useCallback((fileId, e) => {
    e.stopPropagation(); // Prevent opening the modal
    
    setFiles(prev => {
      const fileToDelete = prev.find(f => f.id === fileId);
      if (fileToDelete?.url) {
        URL.revokeObjectURL(fileToDelete.url); // Clean up memory
      }
      return prev.filter(f => f.id !== fileId);
    });
    
    // If the deleted file was selected, close the modal
    if (selectedFile?.id === fileId) {
      setShowMasteringModal(false);
      setSelectedFile(null);
    }
    
    toast.success('File removed');
  }, [selectedFile]);

  const openMasteringModal = useCallback((file) => {
    setSelectedFile(file);
    setShowMasteringModal(true);
    setStep('configure');
    setPreviewUrl(null);
    setFinalMasteredUrl(null);
    setActiveVersion('original');
    setProcessingProgress(0);
  }, []);

  const resetToStart = useCallback(() => {
    setStep('configure');
    setProcessingProgress(0);
    setIsPlaying(false);
    setActiveVersion('original');
    setPreviewUrl(null);
    setFinalMasteredUrl(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileUpload,
    accept: {
      'audio/*': ['.wav', '.mp3', '.flac', '.aiff', '.aif']
    },
    multiple: false
  });

  const startPreview = async () => {
    if (!selectedFile) {
      toast.error('No file selected');
      return;
    }

    if (!selectedFile.file) {
      toast.error('File object not found. Please re-upload the file.');
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingStage('Creating preview from loudest sections...');
    const formData = new FormData();
    formData.append('file', selectedFile.file);
    
    console.log('Starting preview with file:', selectedFile.file.name, 'Size:', selectedFile.file.size);

    try {
      console.log('Uploading file:', selectedFile.file.name);
      const uploadResponse = await fetch('http://127.0.0.1:8000/api/v1/upload/track', {
        method: 'POST',
        body: formData
      });

      console.log('Upload response status:', uploadResponse.status);
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('Upload error:', errorText);
        throw new Error(`Upload failed: ${uploadResponse.status}`);
      }
      
      const uploadResult = await uploadResponse.json();
      console.log('Upload result:', uploadResult);
      const { file_id } = uploadResult;

      // Map frontend genre names to backend names
      const genreMap = {
        'pop': 'pop',
        'hip-hop': 'hiphop',
        'trap': 'trap',
        'r&b': 'rnb',
        'soul': 'soul',
        'jazz': 'jazz',
        'classical': 'classical',
        'amapiano': 'amapiano'
      };
      const backendGenre = genreMap[genre.toLowerCase()] || 'pop';
      
      console.log('Starting preview with:', { file_id, genre: backendGenre, style, intensity });
      const masterResponse = await fetch('http://127.0.0.1:8000/api/v1/master/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_id,
          genre: backendGenre,
          style: style.toLowerCase(),
          intensity: intensity.toLowerCase(),
          preview_duration: 60.0
        }),
      });

      console.log('Preview response status:', masterResponse.status);
      if (!masterResponse.ok) {
        const errorText = await masterResponse.text();
        console.error('Preview creation error:', errorText);
        throw new Error(`Preview creation failed: ${masterResponse.status}`);
      }
      
      const masterResult = await masterResponse.json();
      console.log('Preview result:', masterResult);
      const { job_id } = masterResult;
      toast.success('Creating preview from loudest parts...');

      let pollCount = 0;
      const interval = setInterval(async () => {
        pollCount++;
        setProcessingProgress(Math.min(90, pollCount * 15));

        if (pollCount > 40) {
          clearInterval(interval);
          setIsProcessing(false);
          toast.error('Processing timeout');
          return;
        }

        try {
          const statusResponse = await fetch(`http://127.0.0.1:8000/api/v1/master/${job_id}/status`);
          const statusResult = await statusResponse.json();
          console.log('Preview status:', statusResult);

          if (statusResult.status === 'completed') {
            setProcessingProgress(100);
            setProcessingStage('Preview ready!');
            
            // Use the new preview URLs
            if (statusResult.preview_mastered_url && statusResult.preview_original_url) {
              const masteredUrl = `http://127.0.0.1:8000${statusResult.preview_mastered_url}`;
              const originalUrl = `http://127.0.0.1:8000${statusResult.preview_original_url}`;
              console.log('Preview URLs:', { original: originalUrl, mastered: masteredUrl });
              setPreviewUrl(masteredUrl);
              // Update selectedFile with original preview URL for comparison
              setSelectedFile(prev => ({ ...prev, previewOriginalUrl: originalUrl }));
            } else {
              // Fallback to old behavior
              const masteredUrl = `http://127.0.0.1:8000${statusResult.download_url}`;
              console.log('Preview completed! Mastered URL:', masteredUrl);
              setPreviewUrl(masteredUrl);
            }
            
            setActiveVersion('mastered'); // Auto-switch to mastered preview
            setStep('preview'); // Move to preview step
            setIsProcessing(false);
            clearInterval(interval);
            toast.success('Preview ready! Toggle to compare.');
          } else if (statusResult.status === 'failed') {
            clearInterval(interval);
            setIsProcessing(false);
            toast.error(`Failed: ${statusResult.error}`);
          }
        } catch (error) {
          console.error('Status check error:', error);
          clearInterval(interval);
          setIsProcessing(false);
          toast.error('Status check failed');
        }
      }, 2000);
    } catch (error) {
      console.error('Preview creation error:', error);
      setIsProcessing(false);
      setProcessingProgress(0);
      toast.error(error.message || 'Failed to create preview');
    }
  };

  const togglePlayback = () => {
    if (!audioPlayer.current) return;
    
    if (isPlaying) {
      audioPlayer.current.pause();
    } else {
      audioPlayer.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const switchVersion = (version) => {
    console.log('Switching to:', version, 'Preview URL:', previewUrl);
    
    if (!previewUrl && version === 'mastered') {
      toast.error('Preview not ready yet!');
      return;
    }

    if (audioPlayer.current) {
      const wasPlaying = !audioPlayer.current.paused;
      const currentTime = audioPlayer.current.currentTime;
      
      setActiveVersion(version);
      // Use preview original URL if available, otherwise use full file URL
      const originalSrc = selectedFile.previewOriginalUrl || selectedFile.url;
      const newSrc = version === 'original' ? originalSrc : previewUrl;
      console.log('Setting audio source to:', newSrc);
      
      audioPlayer.current.src = newSrc;
      audioPlayer.current.load(); // Force reload
      audioPlayer.current.currentTime = currentTime;
      
      if (wasPlaying) {
        audioPlayer.current.play().catch(err => console.error('Play error:', err));
      }
      
      toast.success(`Playing ${version === 'original' ? 'Original Preview' : 'Mastered Preview'}`);
    }
  };

  const createFinalMaster = async () => {
    if (!selectedFile) return;
    
    setStep('processing');
    setProcessingProgress(0);
    setProcessingStage('Analyzing frequency spectrum...');
    const formData = new FormData();
    formData.append('file', selectedFile.file);

    try {
      console.log('Creating FULL master (not preview)');
      const uploadResponse = await fetch('http://127.0.0.1:8000/api/v1/upload/track', {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) throw new Error('Upload failed');
      
      const { file_id } = await uploadResponse.json();

      // Map genre
      const genreMap = {
        'pop': 'pop',
        'hip-hop': 'hiphop',
        'trap': 'trap',
        'r&b': 'rnb',
        'soul': 'soul',
        'jazz': 'jazz',
        'classical': 'classical',
        'amapiano': 'amapiano'
      };
      const backendGenre = genreMap[genre.toLowerCase()] || 'pop';

      // Process FULL song (preview_only: false)
      const masterResponse = await fetch('http://127.0.0.1:8000/api/v1/master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_id,
          genre: backendGenre,
          style: style.toLowerCase(),
          intensity: intensity.toLowerCase(),
          preview_only: false  // FULL SONG
        }),
      });

      if (!masterResponse.ok) throw new Error('Mastering failed');
      
      const { job_id } = await masterResponse.json();
      toast.success('Processing full master...');

      // Poll for completion with progress stages
      let pollCount = 0;
      const stages = [
        { progress: 20, text: 'Analyzing frequency spectrum...' },
        { progress: 40, text: 'Applying EQ adjustments...' },
        { progress: 60, text: 'Dynamic range processing...' },
        { progress: 80, text: 'Loudness maximization...' },
        { progress: 95, text: 'Finalizing master...' }
      ];
      
      const interval = setInterval(async () => {
        pollCount++;
        
        // Update progress stage
        const stageIndex = Math.min(Math.floor(pollCount / 2), stages.length - 1);
        if (stageIndex < stages.length) {
          setProcessingProgress(stages[stageIndex].progress);
          setProcessingStage(stages[stageIndex].text);
        }

        if (pollCount > 60) {  // 3 minutes max
          clearInterval(interval);
          setStep('preview');
          toast.error('Processing timeout');
          return;
        }

        try {
          const statusResponse = await fetch(`http://127.0.0.1:8000/api/v1/master/${job_id}/status`);
          const statusResult = await statusResponse.json();

          if (statusResult.status === 'completed') {
            setProcessingProgress(100);
            setProcessingStage('Complete!');
            setFinalMasteredUrl(`http://127.0.0.1:8000${statusResult.download_url}`);
            setStep('complete');
            clearInterval(interval);
            toast.success('Full master ready!');
          } else if (statusResult.status === 'failed') {
            clearInterval(interval);
            setStep('preview');
            toast.error(`Failed: ${statusResult.error}`);
          }
        } catch (error) {
          clearInterval(interval);
          setStep('preview');
          toast.error('Status check failed');
        }
      }, 3000);
    } catch (error) {
      console.error('Full master error:', error);
      setStep('preview');
      toast.error(error.message || 'Failed to create master');
    }
  };

  useEffect(() => {
    if (selectedFile && audioPlayer.current) {
      audioPlayer.current.src = selectedFile.url;
    }
  }, [selectedFile]);

  // Auto-switch audio when preview is ready
  useEffect(() => {
    if (previewUrl && audioPlayer.current && activeVersion === 'mastered') {
      const wasPlaying = !audioPlayer.current.paused;
      const currentTime = audioPlayer.current.currentTime;
      
      console.log('Auto-switching to mastered preview:', previewUrl);
      audioPlayer.current.src = previewUrl;
      audioPlayer.current.load();
      audioPlayer.current.currentTime = currentTime;
      
      if (wasPlaying) {
        audioPlayer.current.play().catch(err => console.error('Auto-play error:', err));
      }
    }
  }, [previewUrl, activeVersion]);

  return (
    <>
      <div className="bg-studio" />
      
      {/* Header */}
      <header className="header sticky top-0 z-50 bg-gray-900/95 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[rgb(217,155,98)] to-[rgb(197,135,78)] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <circle cx="10" cy="12" r="6"/><circle cx="14" cy="12" r="6"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-white">AIMSTR</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={onAdminClick}
              className="px-4 py-2 rounded-lg text-sm bg-[rgb(217,155,98)]/20 hover:bg-[rgb(217,155,98)]/30 text-[rgb(217,155,98)] border border-[rgb(217,155,98)]/30 font-semibold"
            >
              Admin
            </button>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-300">{user?.email}</span>
              <button 
                onClick={onSignOut}
                className="px-4 py-2 rounded-lg text-sm bg-white/5 hover:bg-white/10 text-white border border-white/10"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white">Library</h1>
              <p className="text-gray-400 mt-2">Your mastered tracks and uploads</p>
            </div>

            {files.length === 0 ? (
              <div {...getRootProps()} className={`text-center py-20 border-2 border-dashed rounded-lg ${isDragActive ? 'border-[rgb(217,155,98)] bg-[rgb(217,155,98)]/10' : 'border-white/10'}`}>
                <input {...getInputProps()} />
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
                </svg>
                <h2 className="text-xl font-semibold mb-2 text-gray-300">No files yet.</h2>
                <p className="text-gray-400">Drag and drop or click to upload audio files</p>
              </div>
            ) : (
              <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                {files.map(file => (
                  <div 
                    key={file.id}
                    onClick={() => {
                      if (file.status === 'ready') {
                        openMasteringModal(file);
                      } else {
                        toast.error('Please wait for file to finish processing');
                      }
                    }}
                    className={`grid grid-cols-12 gap-4 px-6 py-4 hover:bg-white/5 transition items-center border-b border-white/5 last:border-0 ${
                      file.status === 'ready' ? 'cursor-pointer' : 'cursor-wait opacity-60'
                    }`}
                  >
                    <div className="col-span-6 flex items-center gap-3">
                      <svg className="w-8 h-8 text-[rgb(217,155,98)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
                      </svg>
                      <div>
                        <div className="font-medium text-white">{file.name}</div>
                        <div className="text-sm text-gray-400 flex items-center gap-2">
                          <span>MP3</span>
                          <span className="px-2 py-0.5 bg-gray-700 rounded text-xs">
                            {file.status === 'processing' ? 'PROCESSING...' : 'ORIGINAL'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2 text-sm text-gray-400">{file.created}</div>
                    <div className="col-span-2 text-sm text-gray-400">{file.size}</div>
                    <div className="col-span-1 text-sm text-gray-400">-</div>
                    <div className="col-span-1 flex items-center justify-end gap-2">
                      <button 
                        onClick={(e) => handleDeleteFile(file.id, e)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors group"
                        title="Delete file"
                      >
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Sidebar */}
        <aside className="w-80 p-6 overflow-y-auto bg-gray-900/60 backdrop-blur-lg border-l border-white/5">
          <div className="space-y-4">
            {/* Upload Track */}
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-5 text-left bg-gradient-to-br from-[rgb(217,155,98)]/10 to-[rgb(197,135,78)]/5 hover:from-[rgb(217,155,98)]/20 hover:to-[rgb(197,135,78)]/10 rounded-xl border border-[rgb(217,155,98)]/20 hover:border-[rgb(217,155,98)]/40 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[rgb(217,155,98)]/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[rgb(217,155,98)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white mb-1">Upload Track</div>
                  <div className="text-xs text-gray-400 leading-relaxed">Upload your audio file to start mastering with AI-powered presets</div>
                </div>
              </div>
            </button>

            {/* Reference Song */}
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-5 text-left bg-gradient-to-br from-purple-500/10 to-purple-600/5 hover:from-purple-500/20 hover:to-purple-600/10 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white mb-1">Reference Song</div>
                  <div className="text-xs text-gray-400 leading-relaxed">Upload a professionally mastered track. AI will analyze and match its sonic characteristics to your music</div>
                </div>
              </div>
            </button>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-start gap-2 mb-2">
                <svg className="w-5 h-5 text-[rgb(217,155,98)] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">How it works</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Choose style presets for quick mastering, or upload a reference track for AI-powered matching that learns and replicates professional sound characteristics.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Hidden file input */}
      <input 
        ref={fileInputRef}
        type="file" 
        accept="audio/*" 
        style={{ display: 'none' }} 
        onChange={(e) => handleFileUpload(Array.from(e.target.files || []))}
      />

      {/* Mastering Modal */}
      {showMasteringModal && selectedFile && step !== 'advanced' && (
        <MasteringModal
          selectedFile={selectedFile}
          step={step}
          setStep={setStep}
          genre={genre}
          setGenre={setGenre}
          style={style}
          setStyle={setStyle}
          intensity={intensity}
          setIntensity={setIntensity}
          isPlaying={isPlaying}
          togglePlayback={togglePlayback}
          activeVersion={activeVersion}
          switchVersion={switchVersion}
          previewUrl={previewUrl}
          processingProgress={processingProgress}
          processingStage={processingStage}
          isProcessing={isProcessing}
          startPreview={startPreview}
          createFinalMaster={createFinalMaster}
          finalMasteredUrl={finalMasteredUrl}
          resetToStart={resetToStart}
          onClose={() => setShowMasteringModal(false)}
        />
      )}

      {step === 'advanced' && finalMasteredUrl && (
        <AdvancedMasterConsole
          masteredFile={finalMasteredUrl}
          onSave={() => {
            // Download the file
            const link = document.createElement('a');
            link.href = finalMasteredUrl;
            link.download = `${selectedFile.name}_Advanced_Master.wav`;
            link.click();
            toast.success('Master downloaded!');
          }}
          onBack={() => setStep('complete')}
        />
      )}

      <audio 
        ref={audioPlayer} 
        style={{ display: 'none' }} 
        onPlay={() => setIsPlaying(true)} 
        onPause={() => setIsPlaying(false)}
      />
    </>
  );
};

export default Library;
