import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Calendar, Search, Filter, CheckSquare, AlertCircle, Menu } from 'lucide-react';
import { useFirestoreCollection } from '@/hooks/useFirestore';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/layout/sidebar';
import MobileSidebar from '@/components/layout/mobile-sidebar';
import { format, isToday, isTomorrow, isThisWeek, parseISO, isBefore } from 'date-fns';

export default function UpcomingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const { data: tasks = [], loading } = useFirestoreCollection('tasks');
  const { data: events = [] } = useFirestoreCollection('events');
  const { user } = useAuth();

  // Combine tasks and events for upcoming view
  const upcomingItems = useMemo(() => {
    const items: any[] = [];

    // Add tasks with due dates
    tasks.forEach(task => {
      if (task.dueDate) {
        items.push({
          ...task,
          type: 'task',
          date: parseISO(task.dueDate),
          title: task.title,
          description: task.description,
          status: task.status,
          project: task.project
        });
      }
    });

    // Add events
    events.forEach(event => {
      items.push({
        ...event,
        type: 'event',
        date: parseISO(event.scheduledTime),
        title: event.title,
        description: event.description
      });
    });

    // Sort by date
    return items.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [tasks, events]);

  // Filter items
  const filteredItems = upcomingItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesFilter = true;
    if (filterBy === 'today') {
      matchesFilter = isToday(item.date);
    } else if (filterBy === 'tomorrow') {
      matchesFilter = isTomorrow(item.date);
    } else if (filterBy === 'this-week') {
      matchesFilter = isThisWeek(item.date);
    } else if (filterBy === 'overdue') {
      matchesFilter = isBefore(item.date, new Date()) && item.type === 'task' && item.status !== 'completed';
    } else if (filterBy === 'tasks') {
      matchesFilter = item.type === 'task';
    } else if (filterBy === 'events') {
      matchesFilter = item.type === 'event';
    }

    return matchesSearch && matchesFilter;
  });

  // Group items by date
  const groupedItems = filteredItems.reduce((acc, item) => {
    const dateKey = format(item.date, 'yyyy-MM-dd');
    const dateLabel = isToday(item.date) 
      ? 'Today' 
      : isTomorrow(item.date) 
        ? 'Tomorrow' 
        : format(item.date, 'EEEE, MMMM d');

    if (!acc[dateKey]) {
      acc[dateKey] = {
        label: dateLabel,
        date: item.date,
        items: []
      };
    }
    acc[dateKey].items.push(item);
    return acc;
  }, {} as Record<string, any>);

  const sortedGroups = Object.values(groupedItems).sort((a: any, b: any) => 
    a.date.getTime() - b.date.getTime()
  );

  const getItemPriority = (item: any) => {
    if (item.type === 'task' && isBefore(item.date, new Date()) && item.status !== 'completed') {
      return 'overdue';
    }
    if (isToday(item.date)) return 'today';
    if (isTomorrow(item.date)) return 'tomorrow';
    return 'upcoming';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'today': return 'bg-green-100 text-green-800 border-green-200';
      case 'tomorrow': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-secondary-bg">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <Sidebar 
          onNewTask={() => {}}
          currentView="upcoming"
          onViewChange={() => {}}
        />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onNewTask={() => {}}
        currentView="upcoming"
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
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-text-primary" data-testid="text-upcoming-title">Upcoming</h1>
              <p className="text-text-muted">Your upcoming tasks and events</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search upcoming items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-upcoming"
                />
              </div>
              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-full sm:w-48" data-testid="select-upcoming-filter">
                  <SelectValue placeholder="Filter by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="tomorrow">Tomorrow</SelectItem>
                  <SelectItem value="this-week">This Week</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="tasks">Tasks Only</SelectItem>
                  <SelectItem value="events">Events Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Upcoming Items */}
            {loading ? (
              <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Array.from({ length: 2 }).map((_, j) => (
                          <div key={j} className="flex items-center space-x-3">
                            <div className="h-4 w-4 bg-gray-200 rounded"></div>
                            <div className="flex-1">
                              <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {sortedGroups.length > 0 ? (
                  sortedGroups.map((group: any) => (
                    <Card key={group.label}>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Calendar className="mr-2 h-5 w-5" />
                          {group.label}
                          <span className="ml-2 text-sm font-normal text-text-muted">
                            ({group.items.length} items)
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {group.items.map((item: any) => {
                            const priority = getItemPriority(item);

                            return (
                              <div 
                                key={`${item.type}-${item.id}`} 
                                className="flex items-start justify-between p-3 border border-border-color rounded-lg hover:bg-gray-50"
                                data-testid={`${item.type}-${item.id}`}
                              >
                                <div className="flex items-start space-x-3">
                                  {item.type === 'task' ? (
                                    <CheckSquare className="h-5 w-5 text-blue-600 mt-0.5" />
                                  ) : (
                                    <Clock className="h-5 w-5 text-green-600 mt-0.5" />
                                  )}
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                      <h4 className="font-medium text-text-primary">{item.title}</h4>
                                      <Badge 
                                        variant="outline" 
                                        className={`text-xs ${item.type === 'task' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}
                                      >
                                        {item.type}
                                      </Badge>
                                      {priority === 'overdue' && (
                                        <Badge variant="outline" className="text-xs bg-red-50 text-red-700">
                                          <AlertCircle className="h-3 w-3 mr-1" />
                                          Overdue
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-text-muted mt-1">
                                      {format(item.date, 'h:mm a')}
                                      {item.project && (
                                        <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                          {item.project}
                                        </span>
                                      )}
                                    </p>
                                    {item.description && (
                                      <p className="text-sm text-text-secondary mt-2">{item.description}</p>
                                    )}
                                  </div>
                                </div>
                                {item.type === 'task' && (
                                  <Badge 
                                    variant="outline"
                                    className={
                                      item.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' :
                                      item.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 
                                      'bg-red-100 text-red-800 border-red-200'
                                    }
                                  >
                                    {item.status}
                                  </Badge>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="p-12">
                    <div className="text-center">
                      <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-text-primary mb-2">No upcoming items</h3>
                      <p className="text-text-muted">
                        {searchTerm || filterBy !== 'all' 
                          ? 'Try adjusting your search or filters'
                          : 'You\'re all caught up! Create tasks with due dates or schedule events to see them here.'
                        }
                      </p>
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}