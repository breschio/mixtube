import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
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

  // Helper function to find template by id
  const getTemplateById = (id: string) => mixTemplates.find(t => t.id === id);

  return (
    <ToggleGroup
      type="single"
      value={activeTemplate}
      onValueChange={(value) => {
        if (value) {
          const template = getTemplateById(value);
          if (template) {
            onSelectTemplate(template);
          }
        }
      }}
      className="grid grid-cols-2 gap-2 w-full"
    >
      {mixTemplates.map((template) => {
        const Icon = template.icon;
        const isActive = activeTemplate === template.id;

        return (
          <ToggleGroupItem
            key={template.id}
            value={template.id}
            className={cn(
              "flex items-center gap-2 data-[state=on]:bg-blue-600 data-[state=on]:text-white",
              isMobile ? "justify-center px-3 py-2.5" : "flex-col text-center p-4"
            )}
          >
            <Icon className={cn(
              "shrink-0",
              isMobile ? "h-5 w-5" : "h-6 w-6",
            )} />
            <span className={cn(
              "font-medium whitespace-nowrap",
              isMobile ? "text-sm" : "text-sm mt-1"
            )}>
              {template.name}
            </span>
          </ToggleGroupItem>
        );
      })}
    </ToggleGroup>
  );
}