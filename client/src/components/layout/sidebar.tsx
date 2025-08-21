import { Button } from "@/components/ui/button";
import { Home, CheckSquare, Layers, Clock, Users, Plus, MoreHorizontal, ChevronRight, Calendar, User as UserIcon, Settings, X } from "lucide-react";
import { useLocation } from "wouter";
import { useFirestoreCollection } from "@/hooks/useFirestore";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  onNewTask: () => void;
  currentView: 'tasks' | 'upcoming';
  onViewChange: (view: 'tasks' | 'upcoming') => void;
  onClose?: () => void;
}

export default function Sidebar({ onNewTask, currentView, onViewChange, onClose }: SidebarProps) {
  const [, navigate] = useLocation();
  const { data: projects = [] } = useFirestoreCollection('projects');
  const { user } = useAuth();

  const getProjectColor = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-500';
      case 'green': return 'bg-green-500';
      case 'red': return 'bg-red-500';
      case 'yellow': return 'bg-yellow-500';
      case 'purple': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const navigationItems = [
    { name: 'Home', icon: Home, active: false, onClick: () => navigate('/') },
    { name: 'Tasks', icon: CheckSquare, active: currentView === 'tasks', onClick: () => { onViewChange('tasks'); navigate('/tasks'); } },
    { name: 'Projects', icon: Layers, active: false, onClick: () => navigate('/projects') },
    { name: 'Upcoming', icon: Clock, active: currentView === 'upcoming', onClick: () => onViewChange('upcoming') },
    { name: 'Calendar', icon: Calendar, active: false, onClick: () => navigate('/calendar') },
    { name: 'Profile', icon: UserIcon, active: false, onClick: () => navigate('/profile') },
    { name: 'Settings', icon: Settings, active: false, onClick: () => navigate('/settings') },
  ];

  return (
    <div className="flex flex-col w-80">
      <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-sidebar border-r border-border-color">
        {/* Logo Section */}
        <div className="flex items-center flex-shrink-0 px-6 mb-8">
          <div className="flex items-center justify-between w-full">
            <h1 className="text-xl font-semibold text-text-primary">Memento</h1>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-sidebar">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="mt-5 flex-1 px-6 space-y-1">
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <button
                key={item.name}
                onClick={item.onClick}
                className={`w-full text-left group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  item.active
                    ? 'text-text-primary bg-gray-100'
                    : 'text-text-primary hover:bg-gray-50'
                }`}
                data-testid={`nav-${item.name.toLowerCase()}`}
              >
                <item.icon className="text-text-secondary mr-3 h-4 w-4" />
                {item.name}
              </button>
            ))}
          </div>
        </nav>

        {/* Projects Section */}
        <div className="mt-8 px-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide">
              Projects
            </h3>
            <Button variant="ghost" size="sm" className="h-auto p-1">
              <Plus className="h-3 w-3 text-text-muted" />
            </Button>
          </div>
          <div className="space-y-2">
            {projects.map((project) => (
              <div
                key={project.id}
                className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-50 cursor-pointer"
                data-testid={`project-${project.id}`}
              >
                <div className={`w-2 h-2 ${getProjectColor(project.color)} rounded-full mr-3`}></div>
                <span className="text-text-primary flex-1">{project.name}</span>
                <ChevronRight className="h-3 w-3 text-text-muted" />
              </div>
            ))}
          </div>
        </div>

        {/* Add New Task Button */}
        <div className="mt-8 px-6">
          <Button
            onClick={onNewTask}
            className="w-full bg-text-primary text-white hover:bg-gray-800"
            data-testid="button-add-task"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Task
          </Button>
        </div>


      </div>
    </div>
  );
}
