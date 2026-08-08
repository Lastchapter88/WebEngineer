import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload as UploadIcon, Play, Pause } from 'lucide-react'
import toast from 'react-hot-toast'

import { apiService } from '../services/api'

function Upload() {
  const navigate = useNavigate()
  const [mainFile, setMainFile] = useState(null)
  const [referenceFile, setReferenceFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  
  // Audio context refs
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const sourceRef = useRef(null)
  const animationRef = useRef(null)
  const audioRef = useRef(new Audio())
  const canvasRef = useRef(null)

  const handleMainFileSelect = (file) => {
    if (file.size > 100 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 100MB')
      return
    }

    setMainFile(file)
    toast.success(`Loaded: ${file.name}`)
    setupAudioAnalysis(file)
  }

  const handleReferenceFileSelect = (file) => {
    if (file.size > 100 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 100MB')
      return
    }

    setReferenceFile(file)
    toast.success(`Reference loaded: ${file.name}`)
  }

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e, type) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (!file) return
    
    if (type === 'main') handleMainFileSelect(file)
    else handleReferenceFileSelect(file)
  }

  // Audio analysis setup
  const setupAudioAnalysis = (file) => {
    if (!file) return
    
    const url = URL.createObjectURL(file)
    audioRef.current.src = url
    audioRef.current.crossOrigin = 'anonymous'
    
    // Clean up previous audio context
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close()
    }
    
    // Create new audio context
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
    sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current)
    analyserRef.current = audioContextRef.current.createAnalyser()
    analyserRef.current.fftSize = 256
    
    sourceRef.current.connect(analyserRef.current)
    analyserRef.current.connect(audioContextRef.current.destination)
    
    // Start visualization
    visualizeAudio()
  }

  // Audio visualization
  const visualizeAudio = () => {
    if (!analyserRef.current || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const analyser = analyserRef.current
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    
    const draw = () => {
      animationRef.current = requestAnimationFrame(draw)
      analyser.getByteFrequencyData(dataArray)
      
      const W = canvas.width
      const H = canvas.height
      ctx.clearRect(0, 0, W, H)
      
      // Draw analyzer bars
      const barWidth = (W / bufferLength) * 2.5
      let x = 0
      
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * H
        const hue = 200 + (i / bufferLength * 60)
        
        ctx.fillStyle = `hsla(${hue}, 80%, 60%, 0.8)`
        ctx.fillRect(x, H - barHeight, barWidth, barHeight)
        x += barWidth + 1
      }
    }
    
    draw()
  }

  // Play/pause toggle
  const togglePlayback = async () => {
    if (!audioContextRef.current) return
    
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume()
    }
    
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
      cancelAnimationFrame(animationRef.current)
    } else {
      await audioRef.current.play()
      setIsPlaying(true)
      visualizeAudio()
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close()
      }
    }
  }, [])

  const handleUploadAndMaster = async () => {
    if (!mainFile) {
      toast.error('Please upload your track first')
      return
    }

    setIsUploading(true)

    try {
      // Upload main track
      toast.loading('Uploading your track...', { id: 'upload' })
      const mainUpload = await apiService.uploadTrack(mainFile)
      
      // Upload reference if provided
      let refUpload = null
      if (referenceFile) {
        refUpload = await apiService.uploadReference(referenceFile)
      }

      toast.success('Upload complete!', { id: 'upload' })

      // For now, go to preset selection
      // In the future, this will trigger mastering job
      navigate('/presets', {
        state: {
          fileId: mainUpload.file_id,
          referenceId: refUpload?.file_id,
          fileName: mainFile.name
        }
      })

    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Upload failed. Please try again.', { id: 'upload' })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div 
      className="bg-app min-h-screen"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
    >
      {/* Header */}
      <header className="sticky top-0 z-40">
        <div className="bg-black/50 backdrop-blur border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="h-10 w-10 grid place-items-center rounded-md hover:bg-white/5" aria-label="Menu">
                <svg className="w-5 h-5 text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full grid place-items-center ring-1 ring-white/20">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-white/90" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <circle cx="10" cy="12" r="6" />
                    <circle cx="14" cy="12" r="6" />
                  </svg>
                </div>
                <span className="tracking-[0.25em] text-white/90 text-sm font-medium">AIMSTR</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleUploadAndMaster}
                disabled={!mainFile || isUploading}
                className="px-4 py-2 rounded-full btn-wood font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? 'Uploading...' : 'Get Started'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="hero-photo"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-16 relative">
          <div className="max-w-xl">
            <h1 className="text-3xl sm:text-5xl font-bold leading-tight">
              Master your music with <span className="text-[rgb(var(--blue))]">AI</span>
            </h1>
            <p className="text-slate-200/90 mt-2 sm:mt-3 text-base sm:text-lg">Create custom, affordable, release‑ready masters in minutes.</p>
          </div>

          {/* Uploaders */}
          <div className="mt-6 sm:mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Main Track */}
            <label 
              className={`panel uploader rounded-2xl p-4 sm:p-6 md:col-span-2 cursor-pointer flex items-center gap-4 sm:gap-5 ${isDragging ? 'drag-active' : ''}`}
              onDrop={(e) => handleDrop(e, 'main')}
              onDragOver={handleDragOver}
            >
              <input
                type="file"
                className="hidden"
                accept="audio/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleMainFileSelect(file)
                }}
              />
              
              <span className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-black/30 grid place-items-center text-[rgb(var(--blue))] ring-1 ring-white/10 shrink-0">
                <svg className="icon-up" viewBox="0 0 24 24">
                  <path d="M12 18V6m0 0l-5 5m5-5l5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>

              <span className="min-w-0">
                <span className="block text-base sm:text-lg font-semibold truncate">
                  Upload your track
                </span>
                <span className="block text-xs sm:text-sm text-slate-200/80 truncate">
                  {mainFile?.name || 'Accepted: MP3, M4A, WAV, AAC, OGG, AIFF • Max 100MB'}
                </span>
                
                {/* Analyzer */}
                {mainFile && (
                  <div className="mt-3 w-full">
                    <canvas 
                      ref={canvasRef} 
                      className="analyzer w-full h-10 rounded-lg"
                    />
                    <div className="mt-2 flex items-center gap-3">
                      <button 
                        onClick={togglePlayback}
                        className="px-3 py-1.5 rounded-md btn-blue text-xs font-semibold flex items-center gap-1"
                      >
                        {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                        {isPlaying ? 'Pause' : 'Play'}
                      </button>
                      <span className="text-xs text-slate-200/80">
                        {isPlaying ? 'Playing' : 'Ready'}
                      </span>
                    </div>
                  </div>
                )}
              </span>
            </label>

            {/* Reference Track */}
            <label 
              className={`panel uploader rounded-2xl p-4 sm:p-6 cursor-pointer flex items-center gap-4 ${isDragging ? 'drag-active' : ''}`}
              onDrop={(e) => handleDrop(e, 'reference')}
              onDragOver={handleDragOver}
            >
              <input
                type="file"
                className="hidden"
                accept="audio/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleReferenceFileSelect(file)
                }}
              />
              
              <span className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-black/30 grid place-items-center text-[rgb(var(--blue))] ring-1 ring-white/10 shrink-0">
                <svg className="icon-up" viewBox="0 0 24 24">
                  <path d="M12 18V6m0 0l-5 5m5-5l5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>

              <span className="min-w-0">
                <span className="block text-base sm:text-lg font-semibold truncate">
                  Upload a desired output song
                </span>
                <span className="block text-xs sm:text-sm text-slate-200/80 truncate">
                  {referenceFile?.name || 'Optional: a track you want your result to resemble'}
                </span>
              </span>
            </label>
          </div>
        </div>
      </section>

      {/* Accent stripe */}
      <section className="py-8" style={{
        background: 'linear-gradient(90deg, rgba(var(--wood)/.95), rgba(var(--wood)/.95)), linear-gradient(90deg, rgba(var(--blue)/.05), rgba(var(--blue)/.05))'
      }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center gap-5 text-black">
          <div className="h-14 w-14 rounded-full bg-black/10 grid place-items-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-black/70">
              <path d="M12 18V6m0 0l-5 5m5-5l5 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div className="font-semibold">Upload your track</div>
            <div className="text-sm opacity-80">Accepted file formats: MP3, M4A, WAV, AAC, OGG, AIFF</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-4xl font-bold mb-3">Master a track today to hear the hype</h2>
          <p className="text-slate-200/90 mb-6">Discover how great you can sound with instant AI mastering</p>
          
          {!mainFile && (
            <label className="inline-flex cursor-pointer">
              <input
                type="file"
                className="hidden"
                accept="audio/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleMainFileSelect(file)
                }}
              />
              <span className="inline-flex items-center gap-2 px-6 py-3 rounded-full btn-wood font-semibold">
                <UploadIcon className="w-5 h-5" />
                Upload your track
              </span>
            </label>
          )}
        </div>
      </section>

      <footer className="border-t border-white/5 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center text-sm text-slate-300"> 2025 AI Mastering</div>
      </footer>
    </div>
  )
}

export default Upload
