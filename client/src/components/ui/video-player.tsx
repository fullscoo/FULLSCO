import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, SkipForward, SkipBack } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  autoPlay?: boolean;
  onTimeUpdate?: (currentTime: number) => void;
  onEnded?: () => void;
  initialTime?: number;
  className?: string;
}

const VideoPlayer = ({
  src,
  poster,
  title,
  autoPlay = false,
  onTimeUpdate,
  onEnded,
  initialTime = 0,
  className,
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [loaded, setLoaded] = useState(false);
  
  // Hide controls after inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const handleMouseMove = () => {
      setIsControlsVisible(true);
      clearTimeout(timeout);
      
      if (isPlaying) {
        timeout = setTimeout(() => {
          setIsControlsVisible(false);
        }, 3000);
      }
    };
    
    const container = containerRef.current;
    container?.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      container?.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, [isPlaying]);
  
  // Initialize video with saved time
  useEffect(() => {
    if (videoRef.current && initialTime > 0 && !loaded) {
      videoRef.current.currentTime = initialTime;
      setCurrentTime(initialTime);
      setLoaded(true);
    }
  }, [initialTime, loaded]);
  
  // Format time display (MM:SS)
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };
  
  const handleVolumeChange = (newValue: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    
    const volumeValue = newValue[0];
    video.volume = volumeValue;
    setVolume(volumeValue);
    setIsMuted(volumeValue === 0);
  };
  
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isMuted) {
      video.volume = volume || 1;
      video.muted = false;
    } else {
      video.muted = true;
    }
    setIsMuted(!isMuted);
  };
  
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    
    const newTime = video.currentTime;
    setCurrentTime(newTime);
    
    if (onTimeUpdate) {
      onTimeUpdate(newTime);
    }
  };
  
  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    
    setDuration(video.duration);
  };
  
  const handleSeek = (newValue: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    
    const seekTime = newValue[0];
    video.currentTime = seekTime;
    setCurrentTime(seekTime);
  };
  
  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };
  
  const skipForward = () => {
    const video = videoRef.current;
    if (!video) return;
    
    const newTime = Math.min(video.currentTime + 10, duration);
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };
  
  const skipBackward = () => {
    const video = videoRef.current;
    if (!video) return;
    
    const newTime = Math.max(video.currentTime - 10, 0);
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };
  
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative group bg-black overflow-hidden rounded-lg",
        className
      )}
      onDoubleClick={toggleFullscreen}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full"
        onClick={togglePlayPause}
        onTimeUpdate={handleTimeUpdate}
        onEnded={onEnded}
        onLoadedMetadata={handleLoadedMetadata}
        playsInline
        autoPlay={autoPlay}
      />
      
      {/* Play button overlay when paused */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Button 
            size="icon"
            variant="ghost"
            className="h-16 w-16 rounded-full bg-black/30 text-white hover:bg-black/50"
            onClick={togglePlayPause}
          >
            <Play className="h-8 w-8 fill-current" />
          </Button>
        </div>
      )}
      
      {/* Video Controls */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-4 pt-10 transition-opacity duration-300",
        isControlsVisible || !isPlaying ? "opacity-100" : "opacity-0"
      )}>
        {title && <div className="text-white font-medium mb-2 text-sm">{title}</div>}
        
        {/* Progress bar */}
        <Slider
          value={[currentTime]}
          min={0}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeek}
          className="mb-2"
        />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-white hover:bg-white/10"
              onClick={togglePlayPause}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-white hover:bg-white/10"
              onClick={skipBackward}
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            
            <Button
              size="icon"
              variant="ghost" 
              className="h-8 w-8 text-white hover:bg-white/10"
              onClick={skipForward}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
            
            <div className="text-white text-xs ml-2">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 mr-2">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-white hover:bg-white/10"
                onClick={toggleMute}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              
              <Slider
                value={[isMuted ? 0 : volume]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                className="w-20"
              />
            </div>
            
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-white hover:bg-white/10"
              onClick={toggleFullscreen}
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
