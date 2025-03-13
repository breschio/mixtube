import React from 'react';
import { SplitIcon, LayersIcon } from "lucide-react";
import { cn, componentStyles } from "@/lib/theme";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMobile } from "@/hooks/use-mobile";

export interface MixTemplate {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  crossFaderValue: number;
}

// Predefined mix templates
const mixTemplates: MixTemplate[] = [
  {
    id: "split",
    name: "Split",
    icon: SplitIcon,
    crossFaderValue: 0.5, // Center position for 50/50 split
  },
  {
    id: "fade-through",
    name: "Fade",
    icon: LayersIcon,
    crossFaderValue: 1, // Right position for full fade
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

  // Helper to get template by ID
  const getTemplateById = (id: string) => mixTemplates.find(t => t.id === id);

  const handleTemplateChange = (value: string) => {
    const template = getTemplateById(value);
    if (template) {
      onSelectTemplate(template);
    }
  };

  return (
    <div className="w-full">
      <Tabs 
        defaultValue={activeTemplate} 
        value={activeTemplate} 
        onValueChange={handleTemplateChange}
        className="w-full"
      >
        <TabsList className={cn(componentStyles.djControls.tabs)}>
          {mixTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <TabsTrigger 
                key={template.id} 
                value={template.id}
                className={cn(componentStyles.djControls.tabItem)}
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{template.name}</span>
                </div>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
    </div>
  );
}