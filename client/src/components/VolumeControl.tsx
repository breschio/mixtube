import { Slider } from "@/components/ui/slider";
import { Volume2 } from "lucide-react";

interface VolumeControlProps {
  value: number;
  onChange: (value: number) => void;
}

export default function VolumeControl({ value, onChange }: VolumeControlProps) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-background/80 backdrop-blur-sm shadow-lg transition-all duration-300 hover:shadow-primary/25">
      <Volume2 className="h-4 w-4 text-primary/80" />
      <Slider
        value={[value]}
        max={1}
        step={0.01}
        onValueChange={([newValue]) => onChange(newValue)}
        className="w-24 transition-transform hover:scale-[1.02]"
      />
    </div>
  );
}