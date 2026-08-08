import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'

function UploadZone({ 
  title, 
  subtitle, 
  onFileSelect, 
  accept = "audio/*",
  showAnalyzer = false,
  className = ""
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState('')
  const fileInputRef = useRef(null)

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

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer?.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFileInputChange = (e) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFile = (file) => {
    setFileName(file.name)
    if (onFileSelect) {
      onFileSelect(file)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <label
      className={`panel uploader rounded-2xl p-4 sm:p-6 cursor-pointer flex items-center gap-4 sm:gap-5 ${
        isDragging ? 'drag-active' : ''
      } ${className}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileInputChange}
      />
      
      {/* Icon */}
      <span className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-black/30 grid place-items-center text-[rgb(var(--blue))] ring-1 ring-white/10 shrink-0">
        <Upload className="w-5 h-5 sm:w-6 sm:h-6" />
      </span>

      {/* Content */}
      <span className="min-w-0 flex-1">
        <span className="block text-base sm:text-lg font-semibold truncate">
          {title}
        </span>
        <span className="block text-xs sm:text-sm text-slate-200/80 truncate">
          {fileName || subtitle}
        </span>
        
        {/* Analyzer placeholder */}
        {showAnalyzer && fileName && (
          <div className="mt-3 h-10 rounded-lg bg-gradient-to-b from-white/5 to-white/2">
            {/* Analyzer will be rendered here */}
          </div>
        )}
      </span>
    </label>
  )
}

export default UploadZone
