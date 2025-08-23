import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import MobileSidebar from "@/components/layout/mobile-sidebar";
import TaskFilters from "@/components/tasks/task-filters";
import TaskCard from "@/components/tasks/task-card";
import NewTaskModal from "@/components/tasks/new-task-modal";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { TaskStatus } from "@/lib/types";
import { useFirestoreCollection } from "@/hooks/useFirestore";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<TaskStatus>('all');
  const [currentView, setCurrentView] = useState<'tasks' | 'upcoming'>('tasks');

  const { user } = useAuth();
  const { data: tasks = [], loading: isLoadingTasks } = useFirestoreCollection('tasks');
  const { data: projects = [] } = useFirestoreCollection('projects');

  const filteredTasks = activeFilter === 'all'
    ? tasks
    : tasks.filter(task => task.status === activeFilter);

  return (
    <div className="flex h-screen overflow-hidden bg-secondary-bg">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <Sidebar
          onNewTask={() => setIsNewTaskModalOpen(true)}
          currentView={currentView}
          onViewChange={setCurrentView}
        />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onNewTask={() => setIsNewTaskModalOpen(true)}
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      {/* Main Content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden bg-sidebar border-b border-border-color px-4 py-2 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(true)}
            data-testid="button-mobile-menu"
          >
            <Menu className="h-5 w-5 text-text-secondary" />
          </Button>
          <div className="flex items-center">
            <h1 className="text-lg font-semibold text-text-primary">Memento</h1>
          </div>
          <div className="w-6"></div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-main-bg">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {/* Welcome Header */}
              <div className="mb-8">
                <h1 className="text-2xl font-semibold text-text-primary" data-testid="text-welcome">
                  Welcome back, {user?.displayName || user?.email?.split('@')[0] || 'User'}!
                </h1>
              </div>

              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-text-primary mb-2">Tasks</h1>
                    <p className="text-text-muted">Manage your daily tasks efficiently</p>
                  </div>
                </div>

                <TaskFilters
                  activeFilter={activeFilter}
                  onFilterChange={setActiveFilter}
                />

                {/* Tasks Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {isLoadingTasks ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="bg-white rounded-lg border border-border-color p-6 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-6"></div>
                        <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3 mb-6"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                      </div>
                    ))
                  ) : filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <p className="text-text-muted">No tasks found for the selected filter.</p>
                    </div>
                  )}
                </div>
              </>
            </div>
          </div>
        </main>
      </div>

      {/* New Task Modal */}
      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
      />
    </div>
  );
}