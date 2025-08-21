import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Home as HomeIcon, Calendar, CheckSquare, Users, TrendingUp, Menu } from 'lucide-react';
import { useFirestoreCollection } from '@/hooks/useFirestore';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/layout/sidebar';
import MobileSidebar from '@/components/layout/mobile-sidebar';

export default function HomePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const { data: tasks = [], loading } = useFirestoreCollection('tasks');

  // Calculate stats
  const completedTasks = tasks.filter(task => task.status === 'completed');
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;

  // Recent tasks (last 5)
  const recentTasks = tasks
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="flex h-screen overflow-hidden bg-secondary-bg">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <Sidebar
          onNewTask={() => {}}
          currentView="tasks"
          onViewChange={() => {}}
        />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onNewTask={() => {}}
        currentView="tasks"
        onViewChange={() => {}}
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
          <h1 className="text-lg font-semibold text-text-primary">Memento</h1>
          <div className="w-6"></div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-main-bg">
          <div className="p-6">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-text-primary mb-2" data-testid="text-welcome">
                Welcome back, {user?.displayName || 'User'}!
              </h1>
              <p className="text-text-muted">
                Here's what's happening with your tasks and projects today.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text-muted">Total Tasks</p>
                      <p className="text-2xl font-bold text-text-primary" data-testid="text-total-tasks">
                        {loading ? '-' : tasks.length}
                      </p>
                    </div>
                    <CheckSquare className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text-muted">Completed</p>
                      <p className="text-2xl font-bold text-green-600" data-testid="text-completed-tasks">
                        {loading ? '-' : completedTasks.length}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text-muted">In Progress</p>
                      <p className="text-2xl font-bold text-yellow-600" data-testid="text-progress-tasks">
                        {loading ? '-' : inProgressTasks.length}
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text-muted">Pending</p>
                      <p className="text-2xl font-bold text-red-600" data-testid="text-pending-tasks">
                        {loading ? '-' : pendingTasks.length}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Progress Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Progress Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-text-primary">Task Completion</span>
                        <span className="text-sm text-text-muted">{Math.round(completionRate)}%</span>
                      </div>
                      <Progress value={completionRate} className="h-2" />
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-600">{completedTasks.length}</div>
                        <div className="text-xs text-text-muted">Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-yellow-600">{inProgressTasks.length}</div>
                        <div className="text-xs text-text-muted">In Progress</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-red-600">{pendingTasks.length}</div>
                        <div className="text-xs text-text-muted">Pending</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Tasks */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckSquare className="mr-2 h-5 w-5" />
                    Recent Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentTasks.length > 0 ? (
                        recentTasks.map((task) => (
                          <div key={task.id} className="flex items-center justify-between p-3 border border-border-color rounded-lg" data-testid={`task-${task.id}`}>
                            <div className="flex-1">
                              <h4 className="font-medium text-text-primary text-sm">{task.title}</h4>
                              <p className="text-xs text-text-muted">{task.project}</p>
                            </div>
                            <Badge
                              variant={
                                task.status === 'completed' ? 'default' :
                                task.status === 'in-progress' ? 'secondary' : 'outline'
                              }
                              className={
                                task.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' :
                                task.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                'bg-red-100 text-red-800 border-red-200'
                              }
                            >
                              {task.status}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <CheckSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-text-muted">No tasks yet</p>
                          <p className="text-text-muted text-sm">Create your first task to get started</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}