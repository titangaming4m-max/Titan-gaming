import { useEffect } from "react";
import { YoutubeVideo } from "../types";
import { X, ExternalLink, Calendar, Tv } from "lucide-react";

interface VideoPlayerModalProps {
  video: YoutubeVideo | null;
  onClose: () => void;
}

export default function VideoPlayerModal({ video, onClose }: VideoPlayerModalProps) {
  useEffect(() => {
    if (!video) return;

    // Handle ESC key press to exit player modal automatically
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [video, onClose]);

  if (!video) return null;

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      id="video-player-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl overflow-hidden rounded-2xl glass-card-premium shadow-[0_15px_50px_rgba(0,0,0,0.8)] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/20">
          <div className="flex items-center space-x-2 text-cyber-blue">
            <Tv className="h-4 w-4" />
            <span className="text-[10px] font-mono tracking-widest font-bold uppercase text-[#a5a1ff]/80">
              CINEMATIC FEED • {video.channelTitle}
            </span>
          </div>
          <button
            id="close-player-btn"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-white/5 hover:text-white transition-all cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Video Player Box */}
        <div className="w-full aspect-video bg-black relative">
          <iframe
            src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1`}
            title={video.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        </div>

        {/* Footer Details */}
        <div className="p-6 space-y-3">
          <h2 className="text-sm sm:text-base font-bold text-white leading-relaxed">
            {video.title}
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-3 border-t border-white/5 text-[11px] font-mono text-gray-400">
            <div className="flex items-center space-x-1.5">
              <Calendar className="h-3.5 w-3.5 text-cyber-pink" />
              <span>Broadcast: {formatDate(video.publishedAt)}</span>
            </div>

            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-cyber-blue hover:text-white hover:underline uppercase tracking-wide font-bold"
            >
              <span>Watch on YouTube directly</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
