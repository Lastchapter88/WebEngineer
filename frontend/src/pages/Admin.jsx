import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';

const Admin = ({ onBack }) => {
  const [referenceFiles, setReferenceFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const validTypes = ['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/flac', 'audio/aiff'];
    if (!validTypes.includes(file.type) && !/\.(wav|mp3|flac|aiff|aif)$/i.test(file.name)) {
      toast.error('Please upload a valid audio file (WAV, MP3, FLAC, AIFF).');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log('Uploading reference track:', file.name);
      const uploadResponse = await fetch('http://127.0.0.1:8000/api/v1/upload/reference', {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('Upload error:', errorText);
        throw new Error(`Upload failed: ${uploadResponse.status}`);
      }
      
      const result = await uploadResponse.json();
      console.log('Upload result:', result);
      
      const newFile = {
        id: result.file_id || Date.now(),
        name: file.name.replace(/\.[^/.]+$/, ""),
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        uploaded: 'just now',
        genre: 'Untagged',
        quality: 'Professional'
      };

      setReferenceFiles(prev => [newFile, ...prev]);
      toast.success('Reference track uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload reference track');
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileUpload,
    accept: {
      'audio/*': ['.wav', '.mp3', '.flac', '.aiff', '.aif']
    },
    multiple: false
  });

  const handleDelete = (fileId) => {
    setReferenceFiles(prev => prev.filter(f => f.id !== fileId));
    toast.success('Reference track removed');
  };

  return (
    <>
      <div className="bg-studio" />
      
      {/* Header */}
      <header className="header sticky top-0 z-50 bg-gray-900/95 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button onClick={onBack} className="text-white/70 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[rgb(217,155,98)] to-[rgb(197,135,78)] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <circle cx="10" cy="12" r="6"/><circle cx="14" cy="12" r="6"/>
                </svg>
              </div>
              <div>
                <span className="text-xl font-bold text-white">AIMSTR Admin</span>
                <p className="text-xs text-gray-400">Reference Track Management</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="min-h-screen">
        <main className="max-w-7xl mx-auto px-6 py-8">
          
          {/* Info Banner */}
          <div className="mb-8 p-6 bg-[rgb(217,155,98)]/10 border border-[rgb(217,155,98)]/20 rounded-xl">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-[rgb(217,155,98)] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Reference Track Library</h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Upload professionally mastered reference tracks for the AI to learn from. These tracks will be analyzed for their sonic characteristics 
                  (frequency balance, dynamics, loudness, stereo width) and used to improve mastering quality. Upload high-quality WAV or FLAC files for best results.
                </p>
              </div>
            </div>
          </div>

          {/* Upload Area */}
          <div {...getRootProps()} className={`mb-8 p-12 border-2 border-dashed rounded-xl transition-all cursor-pointer ${
            isDragActive 
              ? 'border-[rgb(217,155,98)] bg-[rgb(217,155,98)]/10' 
              : 'border-white/10 bg-white/5 hover:border-[rgb(217,155,98)]/50 hover:bg-white/10'
          }`}>
            <input {...getInputProps()} />
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-[rgb(217,155,98)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
              </svg>
              <h3 className="text-xl font-semibold text-white mb-2">
                {uploading ? 'Uploading...' : 'Upload Reference Track'}
              </h3>
              <p className="text-gray-400">
                {isDragActive 
                  ? 'Drop the file here...' 
                  : 'Drag and drop or click to upload professionally mastered tracks'}
              </p>
              <p className="text-sm text-gray-500 mt-2">WAV, FLAC, MP3, AIFF (Max 100MB)</p>
            </div>
          </div>

          {/* Reference Files List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Reference Library ({referenceFiles.length})</h2>
            </div>

            {referenceFiles.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
                </svg>
                <p className="text-gray-400">No reference tracks uploaded yet</p>
                <p className="text-sm text-gray-500 mt-1">Upload professionally mastered tracks for AI learning</p>
              </div>
            ) : (
              <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                {referenceFiles.map(file => (
                  <div 
                    key={file.id}
                    className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-white/5 transition items-center border-b border-white/5 last:border-0"
                  >
                    <div className="col-span-5 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[rgb(217,155,98)]/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-[rgb(217,155,98)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-white">{file.name}</div>
                        <div className="text-sm text-gray-400 flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-[rgb(217,155,98)]/20 text-[rgb(217,155,98)] rounded text-xs font-semibold">
                            REFERENCE
                          </span>
                          <span>{file.quality}</span>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2 text-sm text-gray-400">{file.genre}</div>
                    <div className="col-span-2 text-sm text-gray-400">{file.uploaded}</div>
                    <div className="col-span-2 text-sm text-gray-400">{file.size}</div>
                    <div className="col-span-1 flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleDelete(file.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors group"
                        title="Delete reference track"
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

          {/* Stats */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="p-6 bg-white/5 rounded-xl border border-white/10">
              <div className="text-3xl font-bold text-white mb-1">{referenceFiles.length}</div>
              <div className="text-sm text-gray-400">Reference Tracks</div>
            </div>
            <div className="p-6 bg-white/5 rounded-xl border border-white/10">
              <div className="text-3xl font-bold text-white mb-1">
                {referenceFiles.reduce((acc, f) => acc + parseFloat(f.size), 0).toFixed(2)} MB
              </div>
              <div className="text-sm text-gray-400">Total Size</div>
            </div>
            <div className="p-6 bg-white/5 rounded-xl border border-white/10">
              <div className="text-3xl font-bold text-[rgb(217,155,98)] mb-1">Active</div>
              <div className="text-sm text-gray-400">ML Learning Status</div>
            </div>
          </div>

        </main>
      </div>
    </>
  );
};

export default Admin;
