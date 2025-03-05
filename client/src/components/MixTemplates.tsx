import { Card } from "@/components/ui/card";
import { SplitSquareHorizontalIcon, LayersIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMobile } from "@/hooks/use-mobile";

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
  const isMobile = useMobile();

  return (
    <div className="grid grid-cols-2 gap-2">
      {mixTemplates.map((template) => {
        const Icon = template.icon;
        const isActive = activeTemplate === template.id;

        return (
          <Card
            key={template.id}
            className={cn(
              "cursor-pointer transition-all",
              isActive ? "bg-accent/20 border-primary/50" : "border-border/50 hover:border-border"
            )}
            onClick={() => onSelectTemplate(template)}
          >
            <div className={cn(
              "flex items-center gap-2 p-3",
              isMobile ? "justify-center" : "flex-col text-center"
            )}>
              <Icon className={cn(
                "shrink-0",
                isMobile ? "h-4 w-4" : "h-6 w-6",
                isActive ? "text-primary" : "text-muted-foreground"
              )} />
              <span className={cn(
                "text-sm",
                isActive && "text-primary"
              )}>
                {template.name}
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}