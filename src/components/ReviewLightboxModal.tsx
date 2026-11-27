import { useEffect } from 'react';
import { X, Star, CheckCircle2 } from 'lucide-react';
import { ClonedReviewItem } from '../data/productData';
import { ResilientImage } from './ResilientImage';

interface ReviewLightboxModalProps {
  review: ClonedReviewItem | null;
  onClose: () => void;
}

export function ReviewLightboxModal({ review, onClose }: ReviewLightboxModalProps) {
  useEffect(() => {
    if (!review) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [review, onClose]);

  if (!review) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-zinc-950 aspect-square md:aspect-auto md:min-h-[380px] flex items-center justify-center overflow-hidden">
          <ResilientImage
            src={review.localImgs[0] || ''}
            alt={`Foto enviada por ${review.author}`}
            fallbackLabel={review.author}
            className="w-full h-full object-contain"
          />
        </div>

        <div className="p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-[#111113]">{review.author}</span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-[#028030]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verificado
                  </span>
                </div>
                <div className="flex items-center gap-0.5 mt-1">
                  {Array.from({ length: review.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar foto da avaliação"
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-zinc-700 leading-relaxed">{review.comment}</p>
          </div>

          <div className="pt-4 border-t border-zinc-200 text-xs text-zinc-500">
            LisseMAX Pro — Escova Alisadora e Modeladora 5 em 1 Bivolt
          </div>
        </div>
      </div>
    </div>
  );
}
