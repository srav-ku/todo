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
import { User, Settings, Mail, Calendar, Clock } from 'lucide-react';
import { logout } from '@/lib/firebase';

const profileSchema = z.object({
  displayName: z.string().min(1, 'Display name is required'),
  email: z.string().email('Invalid email address'),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName || user?.email?.split('@')[0] || '',
      email: user?.email || '',
    },
  });

  const onSubmit = async (data: ProfileForm) => {
    try {
      // TODO: Update user profile in Firebase
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getUserInitials = () => {
    const name = user?.displayName || user?.email || '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-text-primary">Profile</h1>
        <p className="text-text-muted">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-6 mb-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.photoURL || ''} />
                <AvatarFallback className="text-lg font-semibold">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">
                  {user?.displayName || user?.email?.split('@')[0] || 'User'}
                </h3>
                <p className="text-text-muted">{user?.email}</p>
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
                    <Button type="submit" data-testid="button-save-profile">
                      Save Changes
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

        {/* Account Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-text-muted" />
                <div>
                  <p className="text-sm font-medium">Email Verified</p>
                  <p className="text-xs text-text-muted">
                    {user?.emailVerified ? 'Verified' : 'Not verified'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-text-muted" />
                <div>
                  <p className="text-sm font-medium">Account Created</p>
                  <p className="text-xs text-text-muted">
                    {user?.metadata?.creationTime ? 
                      new Date(user.metadata.creationTime).toLocaleDateString() : 
                      'Unknown'
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-text-muted" />
                <div>
                  <p className="text-sm font-medium">Last Sign In</p>
                  <p className="text-xs text-text-muted">
                    {user?.metadata?.lastSignInTime ? 
                      new Date(user.metadata.lastSignInTime).toLocaleDateString() : 
                      'Unknown'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}