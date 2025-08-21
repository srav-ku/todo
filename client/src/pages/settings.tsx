import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Bell, Moon, Globe, Trash2, Download, Menu } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/layout/sidebar';
import MobileSidebar from '@/components/layout/mobile-sidebar';

export default function SettingsPage() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('UTC');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSaveSettings = () => {
    // Save settings to localStorage or Firebase
    localStorage.setItem('memento-settings', JSON.stringify({
      notifications,
      darkMode,
      language,
      timezone,
    }));
    
    toast({
      title: 'Settings saved',
      description: 'Your preferences have been saved successfully.',
    });
  };

  const handleExportData = () => {
    toast({
      title: 'Export started',
      description: 'Your data export will be ready shortly.',
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: 'Account deletion',
      description: 'Please contact support to delete your account.',
      variant: 'destructive',
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
          <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-text-primary">Settings</h1>
              <p className="text-text-muted">Manage your application preferences and account settings</p>
            </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications" className="text-base">
                  Notifications
                </Label>
                <p className="text-sm text-text-muted">
                  Receive notifications for task updates and events
                </p>
              </div>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
                data-testid="switch-notifications"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode" className="text-base">
                  Dark Mode
                </Label>
                <p className="text-sm text-text-muted">
                  Switch to dark theme
                </p>
              </div>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={setDarkMode}
                data-testid="switch-dark-mode"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language" className="text-base">
                Language
              </Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger data-testid="select-language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone" className="text-base">
                Timezone
              </Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger data-testid="select-timezone">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="EST">Eastern Time</SelectItem>
                  <SelectItem value="PST">Pacific Time</SelectItem>
                  <SelectItem value="GMT">Greenwich Mean Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleSaveSettings}
              className="w-full"
              data-testid="button-save-settings"
            >
              Save Settings
            </Button>
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="mr-2 h-5 w-5" />
              Data & Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border border-border-color rounded-lg">
              <div className="flex items-start space-x-3">
                <Download className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-text-primary">Export Data</h4>
                  <p className="text-sm text-text-muted mb-3">
                    Download a copy of your tasks, projects, and events
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleExportData}
                    data-testid="button-export-data"
                  >
                    Export Data
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <div className="flex items-start space-x-3">
                <Trash2 className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-red-900">Delete Account</h4>
                  <p className="text-sm text-red-700 mb-3">
                    Permanently delete your account and all associated data
                  </p>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleDeleteAccount}
                    data-testid="button-delete-account"
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-text-primary">Email Notifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-tasks" className="text-sm">Task updates</Label>
                    <Switch id="email-tasks" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-events" className="text-sm">Event reminders</Label>
                    <Switch id="email-events" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-weekly" className="text-sm">Weekly summary</Label>
                    <Switch id="email-weekly" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium text-text-primary">Push Notifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="push-tasks" className="text-sm">Task deadlines</Label>
                    <Switch id="push-tasks" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="push-events" className="text-sm">Upcoming events</Label>
                    <Switch id="push-events" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="push-mentions" className="text-sm">Mentions</Label>
                    <Switch id="push-mentions" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}