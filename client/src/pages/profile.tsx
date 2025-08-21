
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { User, Settings, Mail, Calendar, Clock, Menu } from 'lucide-react';
import { logout } from '@/lib/firebase';
import Sidebar from '@/components/layout/sidebar';
import MobileSidebar from '@/components/layout/mobile-sidebar';

const profileSchema = z.object({
  displayName: z.string().min(1, 'Display name is required'),
  email: z.string().email('Invalid email address'),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function Profile() {
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName || user?.email?.split('@')[0] || '',
      email: user?.email || '',
    },
  });

  const onSubmit = async (data: ProfileForm) => {
    setLoading(true);
    try {
      // Update user profile logic would go here
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to log out.',
        variant: 'destructive',
      });
    }
  };

  const getUserInitials = () => {
    const name = user?.displayName || user?.email || '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-secondary-bg">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <Sidebar 
          onNewTask={() => {}}
          currentView="profile"
          onViewChange={() => {}}
        />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onNewTask={() => {}}
        currentView="profile"
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
              <h1 className="text-3xl font-bold text-text-primary">Profile Settings</h1>
              <p className="text-text-secondary mt-2">Manage your account settings and preferences</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Profile Card */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={user?.photoURL || ''} />
                      <AvatarFallback>
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold">{user?.displayName || user?.email?.split('@')[0] || 'User'}</h3>
                      <p className="text-text-secondary">{user?.email}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => setIsEditing(!isEditing)}
                        data-testid="button-edit-profile"
                      >
                        {isEditing ? 'Cancel' : 'Edit Profile'}
                      </Button>
                    </div>
                  </div>

                  {isEditing ? (
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="displayName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Display Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter your display name"
                                  {...field}
                                  data-testid="input-display-name"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="Enter your email"
                                  {...field}
                                  disabled
                                  data-testid="input-email"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsEditing(false)}
                            data-testid="button-cancel-edit"
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={loading} data-testid="button-save-profile">
                            {loading ? 'Saving...' : 'Save Changes'}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-text-secondary">Display Name</label>
                        <p className="text-text-primary">
                          {user?.displayName || user?.email?.split('@')[0] || 'Not set'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-text-secondary">Email</label>
                        <p className="text-text-primary">{user?.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-text-secondary">Member Since</label>
                        <p className="text-text-primary">
                          {user?.metadata?.creationTime ? 
                            new Date(user.metadata.creationTime).toLocaleDateString() : 
                            'Unknown'
                          }
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Account Information */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Account Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-secondary-bg rounded-lg">
                        <Mail className="h-5 w-5 text-accent-blue" />
                        <div>
                          <p className="text-sm text-text-secondary">Email</p>
                          <p className="font-medium">{user?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-secondary-bg rounded-lg">
                        <Calendar className="h-5 w-5 text-accent-green" />
                        <div>
                          <p className="text-sm text-text-secondary">Member Since</p>
                          <p className="font-medium">
                            {user?.metadata?.creationTime 
                              ? new Date(user.metadata.creationTime).toLocaleDateString()
                              : 'N/A'
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-secondary-bg rounded-lg">
                        <Clock className="h-5 w-5 text-accent-orange" />
                        <div>
                          <p className="text-sm text-text-secondary">Last Sign In</p>
                          <p className="font-medium">
                            {user?.metadata?.lastSignInTime 
                              ? new Date(user.metadata.lastSignInTime).toLocaleDateString()
                              : 'N/A'
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-secondary-bg rounded-lg">
                        <User className="h-5 w-5 text-accent-purple" />
                        <div>
                          <p className="text-sm text-text-secondary">User ID</p>
                          <p className="font-medium text-xs">{user?.uid}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Danger Zone Card */}
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-red-600">Danger Zone</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-text-secondary mb-4">
                      Once you log out, you'll need to sign in again to access your account.
                    </p>
                    <Button 
                      variant="destructive" 
                      onClick={handleLogout}
                      className="w-full bg-red-600 hover:bg-red-700"
                      data-testid="button-logout"
                    >
                      Log Out
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
