import { Monitor, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VideoInfoProps {
  title?: string;
  channelTitle?: string;
  onToggleMixMode: () => void;
  mixMode?: boolean;
}

export default function VideoInfo({ 
  title = 'Untitled Video',
  onToggleMixMode,
  mixMode = false 
}: VideoInfoProps) {
  return (
    <div className="py-3 px-1">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-medium leading-tight">
          {title}
        </h1>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1.5 h-8 px-3" 
          onClick={onToggleMixMode}
        >
          {mixMode ? <Play className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
          {mixMode ? 'Watch' : 'Mix'}
        </Button>
      </div>
    </div>
  );
}