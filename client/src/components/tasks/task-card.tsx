import { Button } from "@/components/ui/button";
import { Check, ExternalLink, Edit, Trash2, MoreHorizontal, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFirestoreUpdate, useFirestoreDelete } from "@/hooks/useFirestore";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface TaskCardProps {
  task: any;
}

export default function TaskCard({ task }: TaskCardProps) {
  const { toast } = useToast();
  const updateTask = useFirestoreUpdate('tasks');
  const deleteTask = useFirestoreDelete('tasks');

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
    try {
      await updateTask(task.id, { 
        status: 'completed',
        updatedAt: new Date()
      });
      toast({
        title: "Task completed",
        description: "Task marked as completed successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task status.",
        variant: "destructive",
      });
    }
  };

  const handleMarkPending = async () => {
    try {
      await updateTask(task.id, { 
        status: 'pending',
        updatedAt: new Date()
      });
      toast({
        title: "Task updated",
        description: "Task marked as pending successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task status.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask(task.id);
      toast({
        title: "Task deleted",
        description: "Task deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task.",
        variant: "destructive",
      });
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => {}}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleDelete}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="mb-4">
        <span className="text-sm text-text-muted" data-testid={`task-number-${task.id}`}>
          #{task.id ? task.id.slice(-6) : 'N/A'}
        </span>
      </div>
      
      <p className="text-sm text-text-secondary mb-6" data-testid={`task-description-${task.id}`}>
        {task.description || 'No description'}
      </p>
      
      {isCompleted ? (
        <div className="space-y-2">
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-md text-center">
            <Check className="inline mr-2 h-4 w-4" />
            Completed
          </div>
          <Button
            onClick={handleMarkPending}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Mark as Pending
          </Button>
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
