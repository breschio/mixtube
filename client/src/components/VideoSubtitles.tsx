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

    const updateCaption = () => {
      const tracks = player.getOption('captions', 'tracklist') || [];
      if (tracks.length > 0) {
        const activeCaptions = player.getOption('captions', 'track') || {};
        setCurrentCaption(activeCaptions.text || '');
      }
    };

    // Enable captions if available
    player.loadModule('captions');
    player.setOption('captions', 'track', { languageCode: 'en' });
    
    // Update captions periodically
    const interval = setInterval(updateCaption, 100);

    return () => {
      clearInterval(interval);
      if (player) {
        player.unloadModule('captions');
      }
    };
  }, [rightPlayer, isVisible]);

  if (!isVisible || !currentCaption) return null;

  return (
    <div className="absolute bottom-8 left-0 right-0 flex justify-center">
      <div className="bg-black/80 px-4 py-2 rounded-lg text-white text-center max-w-[80%]">
        {currentCaption}
      </div>
    </div>
  );
}
