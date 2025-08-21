import { Button } from "@/components/ui/button";
import { Check, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFirestoreUpdate } from "@/hooks/useFirestore";

interface TaskCardProps {
  task: any;
}

export default function TaskCard({ task }: TaskCardProps) {
  const { toast } = useToast();
  const updateTask = useFirestoreUpdate('tasks');

  const getProjectColor = (color?: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-500';
      case 'green': return 'bg-green-500';
      case 'red': return 'bg-red-500';
      case 'yellow': return 'bg-yellow-500';
      case 'purple': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const handleMarkCompleted = async () => {
    if (task.status !== 'completed') {
      try {
        await updateTask(task.id, { 
          status: 'completed',
          updatedAt: new Date()
        });
        toast({
          title: "Task updated",
          description: "Task status has been updated successfully.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update task status.",
          variant: "destructive",
        });
      }
    }
  };

  const isCompleted = task.status === 'completed';

  return (
    <div 
      className="bg-white rounded-lg border border-border-color p-6 hover:shadow-md transition-shadow"
      data-testid={`task-card-${task.id}`}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary" data-testid={`task-title-${task.id}`}>
          {task.title}
        </h3>
        <div className={`w-3 h-3 ${getProjectColor(task.project?.color)} rounded-full`}></div>
      </div>
      
      <div className="mb-4">
        <span className="text-sm text-text-muted" data-testid={`task-number-${task.id}`}>
          #{task.id ? task.id.slice(-6) : 'N/A'}
        </span>
        <Button variant="ghost" size="sm" className="ml-2 h-auto p-0">
          <ExternalLink className="h-3 w-3 text-text-muted" />
        </Button>
      </div>
      
      <p className="text-sm text-text-secondary mb-6" data-testid={`task-description-${task.id}`}>
        {task.description}
      </p>
      
      {isCompleted ? (
        <div className="bg-text-primary text-white px-4 py-2 rounded-md text-center">
          <Check className="inline mr-2 h-4 w-4" />
          Completed
        </div>
      ) : (
        <Button
          onClick={handleMarkCompleted}
          variant="outline"
          className="w-full border-border-color text-text-primary hover:bg-gray-50"
          data-testid={`button-complete-${task.id}`}
        >
          <Check className="mr-2 h-4 w-4" />
          Mark as Completed
        </Button>
      )}
    </div>
  );
}
