"use client"

import { useState, useRef, useEffect } from "react"
import Hls from "hls.js"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Settings,
  Download,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

interface VideoPlayerProps {
  src: string
  poster?: string
  title?: string
  autoPlay?: boolean
  allowDownload?: boolean
  onComplete?: () => void
  onError?: () => void
  className?: string
}

export function VideoPlayer({
  src,
  poster,
  title,
  autoPlay = false,
  allowDownload = false,
  onComplete,
  onError,
  className,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [showControls, setShowControls] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [hls, setHls] = useState<Hls | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const initializePlayer = () => {
      if (Hls.isSupported()) {
        const newHls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        })
        newHls.loadSource(src)
        newHls.attachMedia(video)
        newHls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (autoPlay) {
            video.play().catch((err) => {
              console.error("Autoplay failed:", err)
            })
          }
        })
        newHls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error("Network error, trying to recover...")
                newHls.startLoad()
                break
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error("Media error, trying to recover...")
                newHls.recoverMediaError()
                break
              default:
                console.error("Unrecoverable error")
                destroyPlayer()
                break
            }
          }
        })
        setHls(newHls)
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // For Safari, use native HLS playback
        video.src = src
        video.addEventListener("loadedmetadata", () => {
          if (autoPlay) {
            video.play().catch((err) => {
              console.error("Autoplay failed:", err)
            })
          }
        })
      } else {
        console.error("HLS is not supported in this browser.")
        setError("This video format is not supported in your browser.")
      }
    }

    const destroyPlayer = () => {
      if (hls) {
        hls.destroy()
        setHls(null)
      }
    }

    initializePlayer()

    return () => {
      destroyPlayer()
    }
  }, [src, autoPlay])

  // Hide controls after inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout

    const resetTimeout = () => {
      clearTimeout(timeout)
      setShowControls(true)

      if (isPlaying) {
        timeout = setTimeout(() => {
          setShowControls(false)
        }, 3000)
      }
    }

    resetTimeout()

    const container = containerRef.current
    if (container) {
      container.addEventListener("mousemove", resetTimeout)
      container.addEventListener("touchstart", resetTimeout)
    }

    return () => {
      clearTimeout(timeout)
      if (container) {
        container.removeEventListener("mousemove", resetTimeout)
        container.removeEventListener("touchstart", resetTimeout)
      }
    }
  }, [isPlaying])

  // Handle video events
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onLoadedMetadata = () => {
      setDuration(video.duration)
      setLoading(false)
    }

    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime)
    }

    const onEnded = () => {
      setIsPlaying(false)
      if (onComplete) onComplete()
    }

    const onError = () => {
      console.error("Video error:", video.error)
      const errorMessage = video.error
        ? `Error code ${video.error.code}: ${getVideoErrorMessage(video.error.code)}`
        : "Error loading video. Please try again."
      setError(errorMessage)
      setLoading(false)
      if (onError) onError()
    }

    const onVolumeChange = () => {
      setIsMuted(video.muted)
      setVolume(video.volume)
    }

    const onLoadStart = () => {
      setLoading(true)
      setError(null)
    }

    const onCanPlay = () => {
      setLoading(false)
      if (autoPlay) {
        video.play().catch((err) => {
          console.error("Autoplay failed:", err)
        })
      }
    }

    video.addEventListener("loadedmetadata", onLoadedMetadata)
    video.addEventListener("timeupdate", onTimeUpdate)
    video.addEventListener("ended", onEnded)
    video.addEventListener("error", onError)
    video.addEventListener("volumechange", onVolumeChange)
    video.addEventListener("loadstart", onLoadStart)
    video.addEventListener("canplay", onCanPlay)

    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata)
      video.removeEventListener("timeupdate", onTimeUpdate)
      video.removeEventListener("ended", onEnded)
      video.removeEventListener("error", onError)
      video.removeEventListener("volumechange", onVolumeChange)
      video.removeEventListener("loadstart", onLoadStart)
      video.removeEventListener("canplay", onCanPlay)
    }
  }, [onComplete, onError, autoPlay, src])

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  // Play/pause
  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play().catch((err) => {
        console.error("Play failed:", err)
        setError("Playback failed. Please try again.")
      })
    }

    setIsPlaying(!isPlaying)
  }

  // Mute/unmute
  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !video.muted
    setIsMuted(!isMuted)
  }

  // Fullscreen
  const toggleFullscreen = () => {
    const container = containerRef.current
    if (!container) return

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
    } else {
      document.exitFullscreen()
    }
  }

  // Seek
  const handleSeek = (value: number[]) => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = value[0]
    setCurrentTime(value[0])
  }

  // Volume
  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current
    if (!video) return

    video.volume = value[0]
    setVolume(value[0])

    if (value[0] === 0) {
      video.muted = true
      setIsMuted(true)
    } else if (isMuted) {
      video.muted = false
      setIsMuted(false)
    }
  }

  // Skip forward/backward
  const skip = (seconds: number) => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds))
  }

  // Format time (seconds to MM:SS)
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  // Download video
  const downloadVideo = () => {
    if (!src) return

    const a = document.createElement("a")
    a.href = src
    a.download = title || "video"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  // Retry loading video
  const retryVideo = () => {
    setError(null)
    setLoading(true)
    setRetryCount((prev) => prev + 1)

    if (hls) {
      hls.destroy()
    }

    const video = videoRef.current
    if (video) {
      video.load()
      if (Hls.isSupported()) {
        const newHls = new Hls()
        newHls.loadSource(src)
        newHls.attachMedia(video)
        setHls(newHls)
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src
      }
    }
  }

  // Get descriptive error message based on error code
  const getVideoErrorMessage = (code: number): string => {
    switch (code) {
      case MediaError.MEDIA_ERR_ABORTED:
        return "Playback aborted by the user."
      case MediaError.MEDIA_ERR_NETWORK:
        return "Network error prevented video download."
      case MediaError.MEDIA_ERR_DECODE:
        return "Format error. The video might be corrupted or use an unsupported format."
      case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
        return "The video format is not supported by your browser."
      default:
        return "Unknown error occurred."
    }
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden rounded-lg bg-black",
        isFullscreen ? "fixed inset-0 z-50" : "w-full aspect-video",
        className,
      )}
      onDoubleClick={toggleFullscreen}
    >
      {/* Video */}
      <video
        ref={videoRef}
        poster={poster}
        className="w-full h-full object-contain"
        playsInline
        onClick={togglePlay}
        onLoadedMetadata={() => {
          setDuration(videoRef.current?.duration || 0)
          setLoading(false)
        }}
        onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
        onEnded={() => {
          setIsPlaying(false)
          if (onComplete) onComplete()
        }}
        onError={() => {
          console.error("Video error:", videoRef.current?.error)
          setError("Error loading video. Please try again.")
          setLoading(false)
          if (onError) onError()
        }}
        crossOrigin="anonymous"
      />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white p-4 text-center">
          <div className="max-w-md flex flex-col items-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <p className="mb-4">{error}</p>
            <Button onClick={retryVideo} className="text-white">
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Controls overlay */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      >
        {/* Title bar */}
        {title && (
          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent">
            <h3 className="text-white font-medium truncate">{title}</h3>
          </div>
        )}

        {/* Play/pause button (center) */}
        <button
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary/80 hover:bg-primary text-white rounded-full p-4 transition-all"
          onClick={togglePlay}
        >
          {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
        </button>

        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          {/* Progress bar */}
          <div className="mb-2">
            <Slider
              value={[currentTime]}
              min={0}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeek}
              className="cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* Play/pause */}
              <Button variant="ghost" size="icon" onClick={togglePlay} className="text-white">
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>

              {/* Skip backward */}
              <Button variant="ghost" size="icon" onClick={() => skip(-10)} className="text-white">
                <SkipBack className="h-5 w-5" />
              </Button>

              {/* Skip forward */}
              <Button variant="ghost" size="icon" onClick={() => skip(10)} className="text-white">
                <SkipForward className="h-5 w-5" />
              </Button>

              {/* Volume */}
              <div className="hidden sm:flex items-center space-x-2">
                <Button variant="ghost" size="icon" onClick={toggleMute} className="text-white">
                  {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  min={0}
                  max={1}
                  step={0.1}
                  onValueChange={handleVolumeChange}
                  className="w-20 cursor-pointer"
                />
              </div>

              {/* Time */}
              <div className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Settings */}
              <Button variant="ghost" size="icon" className="text-white">
                <Settings className="h-5 w-5" />
              </Button>

              {/* Download */}
              {allowDownload && (
                <Button variant="ghost" size="icon" onClick={downloadVideo} className="text-white">
                  <Download className="h-5 w-5" />
                </Button>
              )}

              {/* Fullscreen */}
              <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="text-white">
                {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

