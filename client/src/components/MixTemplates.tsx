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
    <div className="grid grid-cols-2 gap-4 mb-8">
      {mixTemplates.map((template) => {
        const Icon = template.icon;
        const isActive = activeTemplate === template.id;

        return (
          <Card
            key={template.id}
            className={`p-4 cursor-pointer transition-all hover:bg-accent/10 ${
              isActive ? "bg-accent/20 border-primary/50" : "border-border/50 hover:border-border"
            }`}
            onClick={() => onSelectTemplate(template)}
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <Icon className={`h-6 w-6 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              <h3 className={`text-sm font-[400] ${isActive ? "text-primary" : ""}`}>{template.name}</h3>
            </div>
          </Card>
        );
      })}
    </div>
  );
}