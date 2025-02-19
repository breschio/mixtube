import { useEffect, useState } from 'react';
import type ReactPlayer from 'react-player/youtube';

interface VideoSubtitlesProps {
  rightPlayer: ReactPlayer | null;
  isVisible: boolean;
}

export default function VideoSubtitles({ rightPlayer, isVisible }: VideoSubtitlesProps) {
  const [currentCaption, setCurrentCaption] = useState<string>('');

  useEffect(() => {
    if (!rightPlayer || !isVisible) return;

    // Access the internal player to get captions
    const player = rightPlayer.getInternalPlayer();
    if (!player) return;

    const enableCaptions = () => {
      player.loadModule('captions');
      // Try to set English captions first, fall back to any available captions
      const tracks = player.getOption('captions', 'tracklist') || [];
      if (tracks.length > 0) {
        const englishTrack = tracks.find((track: any) => 
          track.languageCode.toLowerCase().includes('en')
        );
        player.setOption('captions', 'track', englishTrack || tracks[0]);
        player.setOption('captions', 'reload', true);
      }
    };

    const updateCaption = () => {
      try {
        const activeCaptions = player.getOption('captions', 'track') || {};
        const newCaption = activeCaptions.text || '';
        if (newCaption !== currentCaption) {
          setCurrentCaption(newCaption);
        }
      } catch (error) {
        console.error('Error updating captions:', error);
      }
    };

    // Enable captions and start updating
    enableCaptions();
    const interval = setInterval(updateCaption, 100);

    return () => {
      clearInterval(interval);
      if (player) {
        try {
          player.unloadModule('captions');
        } catch (error) {
          console.error('Error unloading captions:', error);
        }
      }
    };
  }, [rightPlayer, isVisible, currentCaption]);

  if (!isVisible || !currentCaption) return null;

  return (
    <div className="absolute bottom-8 left-0 right-0 flex justify-center z-50">
      <div className="bg-black/80 px-4 py-2 rounded-lg text-white text-center max-w-[80%] text-sm sm:text-base font-medium shadow-lg">
        {currentCaption}
      </div>
    </div>
  );
}