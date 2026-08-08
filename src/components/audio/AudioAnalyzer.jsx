import { useEffect, useRef, useState } from 'react'
import { Play, Pause } from 'lucide-react'

function AudioAnalyzer({ audioFile }) {
  const canvasRef = useRef(null)
  const audioRef = useRef(null)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const sourceRef = useRef(null)
  const animationRef = useRef(null)
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [status, setStatus] = useState('Ready')

  useEffect(() => {
    if (!audioFile) return

    // Create audio element
    const audio = new Audio()
    audio.crossOrigin = 'anonymous'
    audio.loop = true
    audioRef.current = audio

    // Load file
    const url = URL.createObjectURL(audioFile)
    audio.src = url

    setStatus('Ready')

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
      if (sourceRef.current) {
        try {
          sourceRef.current.disconnect()
        } catch (e) {
          // ignore
        }
      }
      URL.revokeObjectURL(url)
    }
  }, [audioFile])

  const setupAudioContext = () => {
    if (audioContextRef.current) return

    const AudioContext = window.AudioContext || window.webkitAudioContext
    audioContextRef.current = new AudioContext()

    const analyser = audioContextRef.current.createAnalyser()
    analyser.fftSize = 512
    analyser.smoothingTimeConstant = 0.85
    analyserRef.current = analyser

    const source = audioContextRef.current.createMediaElementSource(audioRef.current)
    sourceRef.current = source
    
    source.connect(analyser)
    analyser.connect(audioContextRef.current.destination)

    startVisualization()
  }

  const startVisualization = () => {
    const canvas = canvasRef.current
    const analyser = analyserRef.current
    if (!canvas || !analyser) return

    const ctx = canvas.getContext('2d')
    const dpr = Math.max(1, window.devicePixelRatio || 1)
    
    const resize = () => {
      const width = canvas.clientWidth * dpr
      const height = canvas.clientHeight * dpr
      canvas.width = width
      canvas.height = height
    }
    resize()

    const dataArray = new Uint8Array(analyser.frequencyBinCount)

    const draw = () => {
      analyser.getByteFrequencyData(dataArray)

      const width = canvas.width
      const height = canvas.height

      ctx.clearRect(0, 0, width, height)

      // Gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, height)
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.08)')
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0.02)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      // Draw bars
      const barCount = dataArray.length
      const barWidth = Math.max(2, width / (barCount * 1.2))
      let x = 0

      for (let i = 0; i < barCount; i++) {
        const value = dataArray[i] / 255 // 0 to 1
        const barHeight = value * (height * 0.9)

        // Blue bars with alpha based on value
        const alpha = 0.6 + 0.4 * value
        ctx.fillStyle = `rgba(52, 160, 255, ${alpha})` 
        ctx.fillRect(x, height - barHeight, barWidth, barHeight)

        x += barWidth * 1.2
      }

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()
  }

  const togglePlayPause = async () => {
    const audio = audioRef.current
    if (!audio) return

    if (!audioContextRef.current) {
      setupAudioContext()
    }

    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume()
    }

    if (audio.paused) {
      await audio.play()
      setIsPlaying(true)
      setStatus('Playing')
    } else {
      audio.pause()
      setIsPlaying(false)
      setStatus('Paused')
    }
  }

  if (!audioFile) return null

  return (
    <div className="mt-3">
      <canvas
        ref={canvasRef}
        className="analyzer w-full"
        style={{ height: '42px' }}
      />
      <div className="mt-2 flex items-center gap-3">
        <button
          onClick={togglePlayPause}
          className="px-3 py-1.5 rounded-md btn-blue text-xs font-semibold flex items-center gap-1.5"
        >
          {isPlaying ? (
            <>
              <Pause className="w-3 h-3" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-3 h-3" />
              Play
            </>
          )}
        </button>
        <span className="text-xs text-slate-200/80">{status}</span>
      </div>
    </div>
  )
}

export default AudioAnalyzer
