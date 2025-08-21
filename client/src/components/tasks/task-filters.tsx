import { Button } from "@/components/ui/button";
import { TaskStatus } from "@/lib/types";

interface TaskFiltersProps {
  activeFilter: TaskStatus;
  onFilterChange: (filter: TaskStatus) => void;
}

export default function TaskFilters({ activeFilter, onFilterChange }: TaskFiltersProps) {
  const filters: { key: TaskStatus; label: string }[] = [
    { key: 'all', label: 'All Tasks' },
    { key: 'completed', label: 'Completed' },
    { key: 'in-progress', label: 'In-Progress' },
    { key: 'pending', label: 'Pending' },
  ];

  return (
    <div className="flex flex-wrap gap-2 sm:gap-4">
      {filters.map((filter) => (
        <Button
          key={filter.key}
          onClick={() => onFilterChange(filter.key)}
          variant={activeFilter === filter.key ? "default" : "secondary"}
          size="sm"
          className={
            activeFilter === filter.key
              ? "bg-text-primary text-white hover:bg-gray-800"
              : "bg-gray-100 text-text-primary hover:bg-gray-200"
          }
          data-testid={`filter-${filter.key}`}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}
