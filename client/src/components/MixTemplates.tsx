import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SplitSquareHorizontalIcon, LayersIcon, PictureInPictureIcon, ShuffleIcon } from "lucide-react";

export interface MixTemplate {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  crossFaderValue: number;
}

export const mixTemplates: MixTemplate[] = [
  {
    id: "side-by-side",
    name: "Side by Side",
    icon: SplitSquareHorizontalIcon,
    crossFaderValue: 0.5,
  },
  {
    id: "fade-through",
    name: "Fade Through",
    icon: LayersIcon,
    crossFaderValue: 0,
  },
  {
    id: "picture-in-picture",
    name: "Picture in Picture",
    icon: PictureInPictureIcon,
    crossFaderValue: 0.2,
  },
  {
    id: "random-mix",
    name: "Random Mix",
    icon: ShuffleIcon,
    crossFaderValue: 0.5,
  },
];

interface MixTemplatesProps {
  onSelectTemplate: (template: MixTemplate) => void;
  activeTemplate: string;
}

export default function MixTemplates({
  onSelectTemplate,
  activeTemplate,
}: MixTemplatesProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
      {mixTemplates.map((template) => {
        const Icon = template.icon;
        const isActive = activeTemplate === template.id;

        return (
          <Card
            key={template.id}
            className={`p-3 cursor-pointer transition-colors hover:bg-accent/5 ${
              isActive ? "border-primary" : "border-border/50"
            }`}
            onClick={() => onSelectTemplate(template)}
          >
            <div className="flex flex-col items-center text-center space-y-1.5">
              <Icon className={`h-6 w-6 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              <h3 className="text-sm font-medium">{template.name}</h3>
            </div>
          </Card>
        );
      })}
    </div>
  );
}