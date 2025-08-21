import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus, Calendar, Filter, ChevronRight, FileText } from "lucide-react";
import { Event } from "@shared/schema";

export default function UpcomingSection() {
  const [selectedDate] = useState("2025-01-21"); // Today's date for demo

  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ['/api/events', `date=${selectedDate}`],
  });

  const getEventIcon = (iconClass?: string) => {
    if (!iconClass) return <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />;
    
    // Map icon classes to Lucide icons
    const iconMap: { [key: string]: JSX.Element } = {
      'fas fa-briefcase': <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />,
      'fas fa-users': <div className="w-6 h-6 flex items-center justify-center"><i className="fas fa-users text-text-muted"></i></div>,
      'fas fa-graduation-cap': <div className="w-6 h-6 flex items-center justify-center"><i className="fas fa-graduation-cap text-text-muted"></i></div>,
      'fas fa-paint-brush': <div className="w-6 h-6 flex items-center justify-center"><i className="fas fa-paint-brush text-text-muted"></i></div>,
    };

    return iconMap[iconClass] || <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />;
  };

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-text-primary">Upcoming</h2>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" data-testid="button-new-event">
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
          <Button variant="outline" size="sm" data-testid="button-calendar-filter">
            <Calendar className="mr-2 h-4 w-4" />
            January
            <ChevronRight className="ml-2 h-4 w-4 rotate-90" />
          </Button>
          <Button variant="outline" size="sm" data-testid="button-filters">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      <Card className="border border-border-color">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-text-primary">Upcoming</h3>
            <a href="#" className="text-sm text-blue-600 hover:text-blue-500" data-testid="link-view-all">
              View all
            </a>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center p-3 rounded-lg animate-pulse">
                  <div className="w-6 h-6 bg-gray-200 rounded-full mr-4"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                  data-testid={`event-${event.id}`}
                >
                  {getEventIcon(event.icon)}
                  <div className="flex-1 ml-4">
                    <h4 className="text-sm font-medium text-text-primary">
                      {event.title}
                    </h4>
                    <p className="text-sm text-text-muted">
                      Scheduled time {event.scheduledTime}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-text-muted" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-text-muted">No upcoming events for today.</p>
            </div>
          )}
        </CardContent>

        {/* Documentation Section */}
        <div className="border-t border-border-color">
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium text-text-primary mb-4">Documentation</h3>
            <div className="text-center py-12">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12">
                <div className="w-16 h-16 mx-auto mb-4 text-gray-400 flex items-center justify-center">
                  <FileText className="h-12 w-12" />
                </div>
                <p className="text-sm text-text-muted">
                  Click here to start creating notes and documenting your journey
                </p>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
