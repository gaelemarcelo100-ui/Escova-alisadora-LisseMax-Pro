import { useEffect, useRef, useState } from 'react';
import { Pause, Play, Volume2 } from 'lucide-react';

interface YTPlayerInstance {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  setVolume: (volume: number) => void;
  getPlayerState: () => number;
  destroy: () => void;
}

interface YTNamespace {
  Player: new (
    element: HTMLElement | string,
    options: {
      videoId: string;
      width?: string | number;
      height?: string | number;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: (event: { target: YTPlayerInstance }) => void;
        onStateChange?: (event: { target: YTPlayerInstance; data: number }) => void;
      };
    }
  ) => YTPlayerInstance;
  PlayerState: {
    UNSTARTED: number;
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
    BUFFERING: number;
    CUED: number;
  };
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

function extractYouTubeId(url: string): string {
  if (url.includes('youtu.be/')) {
    return url.split('youtu.be/')[1].split(/[?&]/)[0];
  }
  if (url.includes('watch?v=')) {
    return url.split('watch?v=')[1].split(/[?&]/)[0];
  }
  if (url.includes('youtube.com/shorts/')) {
    return url.split('youtube.com/shorts/')[1].split(/[?&]/)[0];
  }
  if (url.includes('youtube.com/embed/')) {
    return url.split('youtube.com/embed/')[1].split(/[?&]/)[0];
  }
  return url;
}

let ytApiPromise: Promise<YTNamespace> | null = null;

function loadYouTubeIframeAPI(): Promise<YTNamespace> {
  if (window.YT && window.YT.Player) {
    return Promise.resolve(window.YT);
  }
  if (ytApiPromise) {
    return ytApiPromise;
  }

  ytApiPromise = new Promise<YTNamespace>((resolve) => {
    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (previousCallback) previousCallback();
      if (window.YT) {
        resolve(window.YT);
      }
    };

    const existingScript = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]'
    );
    if (!existingScript) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      document.head.appendChild(tag);
    }
  });

  return ytApiPromise;
}

interface ShowcaseVideoPlayerProps {
  videoUrl: string;
}

export function ShowcaseVideoPlayer({ videoUrl }: ShowcaseVideoPlayerProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayerInstance | null>(null);
  const completedRef = useRef<boolean>(false);

  const [hasCompletedFirstPlay, setHasCompletedFirstPlay] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [needsAudioUnlock, setNeedsAudioUnlock] = useState<boolean>(false);

  const videoId = extractYouTubeId(videoUrl);

  useEffect(() => {
    let cancelled = false;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

    const unlockAudioOnFirstGesture = () => {
      const p = playerRef.current;
      if (!p) return;
      try {
        p.unMute();
        p.setVolume(100);
        if (!completedRef.current && p.getPlayerState() !== 1) {
          p.playVideo();
        }
        setNeedsAudioUnlock(false);
      } catch {
        // ignore player state errors during teardown
      }
    };

    const handleGlobalGesture = () => {
      unlockAudioOnFirstGesture();
    };

    window.addEventListener('pointerdown', handleGlobalGesture, { passive: true, once: true });
    window.addEventListener('touchstart', handleGlobalGesture, { passive: true, once: true });
    window.addEventListener('keydown', handleGlobalGesture, { passive: true, once: true });

    loadYouTubeIframeAPI().then((YT) => {
      if (cancelled || !hostRef.current) return;

      const mountEl = document.createElement('div');
      mountEl.className = 'w-full h-full';
      hostRef.current.innerHTML = '';
      hostRef.current.appendChild(mountEl);

      playerRef.current = new YT.Player(mountEl, {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          iv_load_policy: 3,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            if (cancelled) return;
            const player = event.target;
            try {
              player.unMute();
              player.setVolume(100);
              player.playVideo();
            } catch {
              // ignore
            }

            // If browser autoplay policy blocks unmuted playback on cold load,
            // immediately start muted so the video keeps running and allow 1-click/gesture unmute.
            fallbackTimer = setTimeout(() => {
              if (cancelled) return;
              try {
                const state = player.getPlayerState();
                if (state !== YT.PlayerState.PLAYING && state !== YT.PlayerState.BUFFERING) {
                  player.mute();
                  player.playVideo();
                  setNeedsAudioUnlock(true);
                } else if (player.isMuted()) {
                  setNeedsAudioUnlock(true);
                }
              } catch {
                // ignore
              }
            }, 650);
          },
          onStateChange: (event) => {
            if (cancelled) return;
            const player = event.target;

            if (event.data === YT.PlayerState.ENDED) {
              completedRef.current = true;
              setHasCompletedFirstPlay(true);
              setIsPaused(false);
              try {
                player.seekTo(0, true);
                player.playVideo();
              } catch {
                // ignore
              }
              return;
            }

            if (event.data === YT.PlayerState.PLAYING) {
              setIsPaused(false);
              try {
                if (!player.isMuted()) {
                  setNeedsAudioUnlock(false);
                }
              } catch {
                // ignore
              }
              return;
            }

            if (event.data === YT.PlayerState.PAUSED) {
              if (completedRef.current) {
                setIsPaused(true);
              }
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      if (fallbackTimer) clearTimeout(fallbackTimer);
      window.removeEventListener('pointerdown', handleGlobalGesture);
      window.removeEventListener('touchstart', handleGlobalGesture);
      window.removeEventListener('keydown', handleGlobalGesture);
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          // ignore
        }
        playerRef.current = null;
      }
    };
  }, [videoId]);

  const handleEnableAudio = () => {
    const p = playerRef.current;
    if (!p) return;
    try {
      p.unMute();
      p.setVolume(100);
      p.playVideo();
      setNeedsAudioUnlock(false);
    } catch {
      // ignore
    }
  };

  const handleTogglePause = () => {
    if (!hasCompletedFirstPlay) return;
    const p = playerRef.current;
    if (!p) return;
    try {
      if (isPaused) {
        p.playVideo();
        setIsPaused(false);
      } else {
        p.pauseVideo();
        setIsPaused(true);
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-[#EADFE3] bg-[#1E1017] shadow-[0_14px_40px_rgba(30,16,23,0.12)] select-none">
      {/* YouTube IFrame host with pointer-events disabled to block all native controls */}
      <div ref={hostRef} className="w-full h-full pointer-events-none" />

      {/* Transparent shield: blocks manual pause during first playthrough; toggles pause-only after first completion */}
      {hasCompletedFirstPlay ? (
        <button
          type="button"
          onClick={handleTogglePause}
          aria-label={isPaused ? 'Continuar vídeo' : 'Pausar vídeo'}
          className="absolute inset-0 z-10 w-full h-full bg-transparent cursor-pointer focus:outline-none"
        />
      ) : (
        <div className="absolute inset-0 z-10" aria-hidden="true" />
      )}

      {/* Audio unlock prompt only if browser blocked unmuted autoplay before user interaction */}
      {needsAudioUnlock && (
        <button
          type="button"
          onClick={handleEnableAudio}
          className="absolute bottom-4 right-4 z-20 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E1017]/90 hover:bg-[#1E1017] text-white text-xs sm:text-sm font-bold border border-white/20 shadow-lg backdrop-blur-sm transition-transform hover:scale-105 cursor-pointer"
        >
          <Volume2 className="w-4 h-4 text-[#34D399]" />
          <span>Ativar Áudio</span>
        </button>
      )}

      {/* Pause-only control unlocked strictly AFTER first full playthrough */}
      {hasCompletedFirstPlay && (
        <button
          type="button"
          onClick={handleTogglePause}
          aria-label={isPaused ? 'Continuar vídeo' : 'Pausar vídeo'}
          className="absolute bottom-4 left-4 z-20 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E1017]/90 hover:bg-[#1E1017] text-white text-xs sm:text-sm font-bold border border-white/20 shadow-lg backdrop-blur-sm transition-transform hover:scale-105 cursor-pointer"
        >
          {isPaused ? (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Continuar</span>
            </>
          ) : (
            <>
              <Pause className="w-4 h-4 fill-white" />
              <span>Pausar</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
