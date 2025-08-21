import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Folder, Plus, Search, Users, Calendar, CheckSquare, Menu } from 'lucide-react';
import { useFirestoreCollection } from '@/hooks/useFirestore';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/layout/sidebar';
import MobileSidebar from '@/components/layout/mobile-sidebar';

export default function ProjectsPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const { data: tasks = [], loading } = useFirestoreCollection('tasks');
  const { user } = useAuth();

  // Group tasks by project
  const projectStats = tasks.reduce((acc: Record<string, any>, task: any) => {
    const project = task.project || 'Uncategorized';
    if (!acc[project]) {
      acc[project] = {
        name: project,
        tasks: [],
        completed: 0,
        inProgress: 0,
        pending: 0,
        total: 0
      };
    }
    acc[project].tasks.push(task);
    acc[project].total++;
    
    if (task.status === 'completed') acc[project].completed++;
    else if (task.status === 'in-progress') acc[project].inProgress++;
    else if (task.status === 'pending') acc[project].pending++;
    
    return acc;
  }, {} as Record<string, any>);

  const projects = Object.values(projectStats);

  // Filter projects based on search and status
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'active' && project.inProgress > 0) ||
      (selectedStatus === 'completed' && project.completed === project.total && project.total > 0) ||
      (selectedStatus === 'pending' && project.pending > 0);
    
    return matchesSearch && matchesStatus;
  });

  const getProjectStatus = (project: any) => {
    if (project.total === 0) return 'empty';
    if (project.completed === project.total) return 'completed';
    if (project.inProgress > 0) return 'active';
    return 'pending';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

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
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-text-primary" data-testid="text-projects-title">Projects</h1>
                <p className="text-text-muted">Manage and track your project progress</p>
              </div>
              <div className="mt-4 sm:mt-0">
                <Dialog open={isNewProjectModalOpen} onOpenChange={setIsNewProjectModalOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-new-project">
                      <Plus className="mr-2 h-4 w-4" />
                      New Project
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Project</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="project-name">Project Name</Label>
                        <Input id="project-name" placeholder="Enter project name" />
                      </div>
                      <div>
                        <Label htmlFor="project-description">Description</Label>
                        <Textarea id="project-description" placeholder="Project description" />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsNewProjectModalOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={() => setIsNewProjectModalOpen(false)}>
                          Create Project
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-projects"
                />
              </div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full sm:w-48" data-testid="select-project-status">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Projects Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="h-2 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => {
                    const status = getProjectStatus(project);
                    const completionRate = project.total > 0 ? (project.completed / project.total) * 100 : 0;
                    
                    return (
                      <Card key={project.name} className="hover:shadow-md transition-shadow" data-testid={`project-${project.name}`}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <Folder className="h-8 w-8 text-blue-600 mt-1" />
                              <div>
                                <CardTitle className="text-lg">{project.name}</CardTitle>
                                <p className="text-sm text-text-muted">{project.total} tasks</p>
                              </div>
                            </div>
                            <Badge className={getStatusColor(status)}>
                              {status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {/* Progress */}
                            <div>
                              <div className="flex justify-between text-sm mb-2">
                                <span className="text-text-muted">Progress</span>
                                <span className="font-medium">{Math.round(completionRate)}%</span>
                              </div>
                              <Progress value={completionRate} className="h-2" />
                            </div>

                            {/* Task Stats */}
                            <div className="grid grid-cols-3 gap-2 text-center">
                              <div>
                                <div className="text-lg font-semibold text-green-600">{project.completed}</div>
                                <div className="text-xs text-text-muted">Done</div>
                              </div>
                              <div>
                                <div className="text-lg font-semibold text-blue-600">{project.inProgress}</div>
                                <div className="text-xs text-text-muted">Active</div>
                              </div>
                              <div>
                                <div className="text-lg font-semibold text-yellow-600">{project.pending}</div>
                                <div className="text-xs text-text-muted">Pending</div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex space-x-2 pt-2">
                              <Button variant="outline" size="sm" className="flex-1">
                                View Tasks
                              </Button>
                              <Button variant="outline" size="sm">
                                <Calendar className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <div className="col-span-full">
                    <Card className="p-12">
                      <div className="text-center">
                        <Folder className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-text-primary mb-2">No projects found</h3>
                        <p className="text-text-muted mb-4">
                          {searchTerm || selectedStatus !== 'all' 
                            ? 'Try adjusting your search or filters'
                            : 'Create your first project to get started'
                          }
                        </p>
                        {!searchTerm && selectedStatus === 'all' && (
                          <Button onClick={() => setIsNewProjectModalOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Project
                          </Button>
                        )}
                      </div>
                    </Card>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}