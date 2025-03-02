import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VideoFiltersProps {
  onFilterSelect: (filter: string) => void;
  activeFilter: string;
}

const filters = [
  { id: 'all', label: 'All' },
  { id: 'music', label: 'Music' },
  { id: 'gaming', label: 'Gaming' },
  { id: 'education', label: 'Education' },
  { id: 'entertainment', label: 'Entertainment' }
];

export default function VideoFilters({ onFilterSelect, activeFilter }: VideoFiltersProps) {
  return (
    <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
      {filters.map((filter) => (
        <Button
          key={filter.id}
          variant="ghost"
          size="sm"
          className={cn(
            "px-3 py-1 text-xs rounded-full whitespace-nowrap",
            "hover:bg-accent/50 transition-colors",
            activeFilter === filter.id && "bg-accent text-accent-foreground"
          )}
          onClick={() => onFilterSelect(filter.id)}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}
