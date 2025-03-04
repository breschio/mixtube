import { Card } from "@/components/ui/card";
import { SplitSquareHorizontalIcon, LayersIcon } from "lucide-react";

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
    crossFaderValue: 0.6,
  },
  {
    id: "fade-through",
    name: "Fade Through",
    icon: LayersIcon,
    crossFaderValue: 0.6,
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
    <>
      {mixTemplates.map((template) => {
        const Icon = template.icon;
        const isActive = activeTemplate === template.id;

        return (
          <Card
            key={template.id}
            className={`cursor-pointer transition-all w-full hover:bg-accent/10 ${
              isActive ? "bg-accent/20 border-primary/50" : "border-border/50 hover:border-border"
            }`}
            onClick={() => onSelectTemplate(template)}
          >
            <div className="flex items-center justify-center gap-2 py-3 px-4">
              <Icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-sm font-[400] ${isActive ? "text-primary" : ""}`}>{template.name}</span>
            </div>
          </Card>
        );
      })}
    </>
  );
}