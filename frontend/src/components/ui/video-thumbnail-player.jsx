import * as React from "react";
import { cn } from "@/lib/utils.js";
import { Play, X } from "lucide-react";

const VideoPlayer = React.forwardRef(
  (
    {
      className,
      thumbnailUrl,
      videoUrl,
      title,
      description,
      aspectRatio = "16/9",
      ...props
    },
    ref
  ) => {
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    React.useEffect(() => {
      const handleEsc = (event) => {
        if (event.key === "Escape") {
          setIsModalOpen(false);
        }
      };
      window.addEventListener("keydown", handleEsc);
      return () => {
        window.removeEventListener("keydown", handleEsc);
      };
    }, []);

    React.useEffect(() => {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = isModalOpen
        ? "hidden"
        : previousOverflow || "auto";
      return () => {
        document.body.style.overflow = previousOverflow || "auto";
      };
    }, [isModalOpen]);

    return (
      <>
        <div
          ref={ref}
          className={cn(
            "group relative w-full max-w-full cursor-pointer overflow-hidden rounded-lg shadow-lg",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0B0D]",
            className
          )}
          style={{ aspectRatio, width: "100%", maxWidth: "100%" }}
          onClick={() => setIsModalOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsModalOpen(true);
            }
          }}
          tabIndex={0}
          aria-label={`Play video: ${title}`}
          {...props}
        >
          <img
            src={thumbnailUrl}
            alt={`Thumbnail for ${title}`}
            className="block h-full w-full max-w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-white/30">
              <Play className="h-7 w-7 sm:h-8 sm:w-8 fill-white text-white" />
            </div>
          </div>

          <div className="absolute bottom-0 left-0 p-4 sm:p-6">
            <h3 className="line-clamp-2 text-lg font-bold text-white sm:text-2xl">
              {title}
            </h3>
            {description && (
              <p className="mt-1 line-clamp-2 text-xs text-white/80 sm:text-sm">
                {description}
              </p>
            )}
          </div>
        </div>

        {isModalOpen && (
          <div
            className="fixed inset-0 z-[100] flex animate-in fade-in-0 items-center justify-center bg-black/80 backdrop-blur-sm"
            aria-modal="true"
            role="dialog"
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-3 top-3 z-50 rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-white/20 sm:right-4 sm:top-4"
              aria-label="Close video player"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            <div className="aspect-video w-full max-w-4xl p-2 sm:p-4">
              <iframe
                src={videoUrl}
                title={title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                referrerPolicy="strict-origin-when-cross-origin"
                loading="lazy"
                allowFullScreen
                className="h-full w-full rounded-lg"
              ></iframe>
            </div>
          </div>
        )}
      </>
    );
  }
);

VideoPlayer.displayName = "VideoPlayer";

export { VideoPlayer };
