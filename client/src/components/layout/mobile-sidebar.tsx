import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Home, CheckSquare, Layers, Clock, Users, Plus, MoreHorizontal, ChevronRight, X, Calendar, User as UserIcon, Settings } from "lucide-react";
import { useLocation } from "wouter";
import { useFirestoreCollection } from "@/hooks/useFirestore";
import { useAuth } from "@/contexts/AuthContext";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewTask: () => void;
  currentView?: string;
  onViewChange?: (view: string) => void;
}

export default function MobileSidebar({ isOpen, onClose, onNewTask, currentView, onViewChange }: MobileSidebarProps) {
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
    { name: 'Home', icon: Home, active: false, onClick: () => { navigate('/'); onClose(); } },
    { name: 'Tasks', icon: CheckSquare, active: currentView === 'tasks', onClick: () => { onViewChange('tasks'); navigate('/tasks'); onClose(); } },
    { name: 'Projects', icon: Layers, active: false, onClick: () => { navigate('/projects'); onClose(); } },
    { name: 'Upcoming', icon: Clock, active: currentView === 'upcoming', onClick: () => { onViewChange('upcoming'); navigate('/upcoming'); onClose(); } },
    { name: 'Calendar', icon: Calendar, active: false, onClick: () => { navigate('/calendar'); onClose(); } },
    { name: 'Profile', icon: UserIcon, active: false, onClick: () => { navigate('/profile'); onClose(); } },
    { name: 'Settings', icon: Settings, active: false, onClick: () => { navigate('/settings'); onClose(); } },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-80 p-0 bg-sidebar">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="px-6 pt-5 pb-4 border-b border-border-color">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-semibold text-text-primary">Memento</SheetTitle>
              <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-sidebar">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

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
                  data-testid={`nav-mobile-${item.name.toLowerCase()}`}
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
                  data-testid={`project-mobile-${project.id}`}
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
              onClick={() => {
                onNewTask();
                onClose();
              }}
              className="w-full bg-text-primary text-white hover:bg-gray-800"
              data-testid="button-add-task-mobile"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Task
            </Button>
          </div>


        </div>
      </SheetContent>
    </Sheet>
  );
}