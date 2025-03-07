import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    name: "Fade",
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
    <Tabs
      value={activeTemplate}
      onValueChange={(value) => {
        const template = getTemplateById(value);
        if (template) {
          onSelectTemplate(template);
        }
      }}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-2">
        {mixTemplates.map((template) => {
          const Icon = template.icon;
          return (
            <TabsTrigger
              key={template.id}
              value={template.id}
              className={cn(
                "flex items-center gap-2",
                isMobile ? "px-3 py-2.5" : "px-4 py-2"
              )}
            >
              <Icon className={cn(
                "shrink-0",
                isMobile ? "h-4 w-4" : "h-5 w-5",
              )} />
              <span className="font-medium">
                {template.name}
              </span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}