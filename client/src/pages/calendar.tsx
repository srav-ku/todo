import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirestoreCollection } from '@/hooks/useFirestore';
import { Plus, CalendarDays, Clock, Menu } from 'lucide-react';
import NewEventModal from '@/components/calendar/new-event-modal';
import Sidebar from '@/components/layout/sidebar';
import MobileSidebar from '@/components/layout/mobile-sidebar';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Value>(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { data: events, loading } = useFirestoreCollection('events');

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getEventsForDate = (date: Date) => {
    const dateString = formatDate(date);
    return events.filter(event => event.date === dateString);
  };

  const getSelectedDateEvents = () => {
    if (!selectedDate || Array.isArray(selectedDate)) return [];
    return getEventsForDate(selectedDate);
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
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
          <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-semibold text-text-primary">Calendar</h1>
              <div className="flex items-center space-x-4">
                <div className="flex bg-gray-100 rounded-md p-1">
                  {['day', 'week', 'month'].map((viewType) => (
                    <Button
                      key={viewType}
                      variant={view === viewType ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setView(viewType as 'month' | 'week' | 'day')}
                      className={view === viewType ? 'bg-text-primary text-white' : 'text-text-primary'}
                      data-testid={`button-view-${viewType}`}
                    >
                      {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
                    </Button>
                  ))}
                </div>
                <Button
                  onClick={() => setIsNewEventModalOpen(true)}
                  className="bg-text-primary text-white hover:bg-gray-800"
                  data-testid="button-new-event"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Event
                </Button>
              </div>
            </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarDays className="mr-2 h-5 w-5" />
              Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="calendar-container">
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                className="w-full border-none"
                tileContent={({ date, view }) => {
                  if (view === 'month') {
                    const dayEvents = getEventsForDate(date);
                    if (dayEvents.length > 0) {
                      return (
                        <div className="flex justify-center mt-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                      );
                    }
                  }
                  return null;
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Events for Selected Date */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Events
              {selectedDate && !Array.isArray(selectedDate) && (
                <span className="ml-2 text-sm font-normal text-text-muted">
                  {selectedDate.toLocaleDateString()}
                </span>
              )}
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
              <div className="space-y-4">
                {getSelectedDateEvents().length > 0 ? (
                  getSelectedDateEvents().map((event) => (
                    <div
                      key={event.id}
                      className="p-3 border border-border-color rounded-lg hover:bg-gray-50"
                      data-testid={`event-${event.id}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-text-primary">{event.title}</h4>
                          <p className="text-sm text-text-muted mt-1">
                            {formatTime(event.scheduledTime)}
                          </p>
                          {event.description && (
                            <p className="text-sm text-text-secondary mt-2">{event.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CalendarDays className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-text-muted">No events for this date</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

            <NewEventModal
              isOpen={isNewEventModalOpen}
              onClose={() => setIsNewEventModalOpen(false)}
              selectedDate={selectedDate && !Array.isArray(selectedDate) ? selectedDate : new Date()}
            />
          </div>
        </main>
      </div>
    </div>
  );
}