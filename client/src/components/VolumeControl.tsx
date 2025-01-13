import { Slider } from "@/components/ui/slider";
import { Volume2 } from "lucide-react";

interface VolumeControlProps {
  value: number;
  onChange: (value: number) => void;
}

export default function VolumeControl({ value, onChange }: VolumeControlProps) {
  return (
    <div className="flex items-center gap-2">
      <Volume2 className="h-4 w-4" />
      <Slider
        value={[value]}
        max={1}
        step={0.01}
        onValueChange={([newValue]) => onChange(newValue)}
        className="w-24"
      />
    </div>
  );
}
