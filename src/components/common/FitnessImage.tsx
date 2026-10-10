import React, { useState } from 'react';
import { Dumbbell, Utensils, Calendar, Maximize2, X } from 'lucide-react';

interface Props {
  src?: string;
  alt: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'wide' | 'auto';
  fallbackType?: 'exercise' | 'food' | 'schedule';
  enableZoom?: boolean;
}

export const FitnessImage: React.FC<Props> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  aspectRatio = 'auto',
  fallbackType = 'exercise',
  enableZoom = false,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const aspectClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[16/9]',
    auto: '',
  }[aspectRatio];

  if (!src || hasError) {
    return (
      <div
        className={`bg-charcoal-900 border border-charcoal-800 rounded-xl flex flex-col items-center justify-center p-3 text-slate-400 select-none ${aspectClass} ${className}`}
      >
        {fallbackType === 'exercise' ? (
          <Dumbbell className="w-6 h-6 text-emerald-400/80 mb-1" />
        ) : fallbackType === 'food' ? (
          <Utensils className="w-6 h-6 text-amber-400/80 mb-1" />
        ) : (
          <Calendar className="w-6 h-6 text-cyan-400/80 mb-1" />
        )}
        <span className="text-[10px] text-center font-medium line-clamp-1 text-slate-400">{alt}</span>
      </div>
    );
  }

  return (
    <>
      <div className={`relative overflow-hidden rounded-xl bg-charcoal-900 group ${aspectClass}`}>
        {isLoading && (
          <div className="absolute inset-0 bg-charcoal-850 animate-pulse flex items-center justify-center">
            {fallbackType === 'exercise' ? (
              <Dumbbell className="w-5 h-5 text-emerald-500/30" />
            ) : (
              <Utensils className="w-5 h-5 text-amber-500/30" />
            )}
          </div>
        )}

        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          className={`${className} transition-transform duration-300 group-hover:scale-105 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {enableZoom && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomOpen(true);
            }}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition shadow backdrop-blur-sm"
            title="View Full Image"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Zoom Modal */}
      {isZoomOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsZoomOpen(false)}
        >
          <div
            className="relative max-w-2xl w-full bg-charcoal-900 border border-charcoal-800 rounded-2xl overflow-hidden shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsZoomOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/70 hover:bg-black text-white transition z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={src} alt={alt} className="w-full max-h-[75vh] object-contain rounded-xl" />
            <div className="p-3 text-center">
              <h4 className="text-sm font-bold text-white">{alt}</h4>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
