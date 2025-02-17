import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Grid2X2Icon, ArrowLeftRightIcon, PictureInPictureIcon } from "lucide-react";

export interface MixTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  crossFaderValue: number;
}

export const mixTemplates: MixTemplate[] = [
  {
    id: "side-by-side",
    name: "Side by Side",
    description: "Classic 50/50 mix with both videos visible",
    icon: Grid2X2Icon,
    crossFaderValue: 0.5,
  },
  {
    id: "fade-through",
    name: "Fade Through",
    description: "Smooth transition between videos",
    icon: ArrowLeftRightIcon,
    crossFaderValue: 0,
  },
  {
    id: "picture-in-picture",
    name: "Picture in Picture",
    description: "One video in corner overlay",
    icon: PictureInPictureIcon,
    crossFaderValue: 0.2,
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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {mixTemplates.map((template) => {
        const Icon = template.icon;
        const isActive = activeTemplate === template.id;

        return (
          <Card
            key={template.id}
            className={`p-4 cursor-pointer transition-colors hover:bg-accent/5 ${
              isActive ? "border-primary" : "border-border/50"
            }`}
            onClick={() => onSelectTemplate(template)}
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <Icon className={`h-8 w-8 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              <h3 className="font-medium">{template.name}</h3>
              <p className="text-xs text-muted-foreground">
                {template.description}
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}