
import React from 'react';

interface VideoDebugMonitorProps {
  leftPlayerRef: any;
  rightPlayerRef: any;
}

export default function VideoDebugMonitor({ leftPlayerRef, rightPlayerRef }: VideoDebugMonitorProps) {
  const [debugInfo, setDebugInfo] = React.useState({
    left: { playing: false, ready: false },
    right: { playing: false, ready: false }
  });

  React.useEffect(() => {
    const interval = setInterval(() => {
      const leftPlayer = leftPlayerRef.current?.getInternalPlayer();
      const rightPlayer = rightPlayerRef.current?.getInternalPlayer();

      setDebugInfo({
        left: {
          playing: leftPlayer?.getPlayerState() === 1,
          ready: !!leftPlayer
        },
        right: {
          playing: rightPlayer?.getPlayerState() === 1,
          ready: !!rightPlayer
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [leftPlayerRef, rightPlayerRef]);

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-2 rounded text-xs">
      <div>Left: {debugInfo.left.playing ? '▶️' : '⏸️'} {debugInfo.left.ready ? '✅' : '❌'}</div>
      <div>Right: {debugInfo.right.playing ? '▶️' : '⏸️'} {debugInfo.right.ready ? '✅' : '❌'}</div>
    </div>
  );
}
