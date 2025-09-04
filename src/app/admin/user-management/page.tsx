'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { User, Shield, UserPlus, Trash2 } from 'lucide-react';

interface AuthUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
}

interface AdminProfile {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin';
  created_at: string;
  last_login?: string;
}

export default function UserManagementPage() {
  const [authUsers, setAuthUsers] = useState<AuthUser[]>([]);
  const [adminProfiles, setAdminProfiles] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoting, setPromoting] = useState<string | null>(null);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'admin' | 'super_admin'>('admin');
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // We can't directly access auth.users from the client
      // So we'll only load admin profiles and provide a way to add admins by email
      const { data: adminData, error: adminError } = await supabase
        .from('admin_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!adminError && adminData) {
        setAdminProfiles(adminData);
      }

      // Set empty array for auth users since we can't access them directly
      setAuthUsers([]);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error",
        description: "Failed to load admin profiles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const promoteToAdmin = async (userId: string, email: string, role: 'admin' | 'super_admin') => {
    try {
      setPromoting(userId);
      
      const { error } = await supabase
        .from('admin_profiles')
        .insert([{
          id: userId,
          email: email.toLowerCase(),
          name: email.split('@')[0],
          role: role,
        }])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Success",
        description: `${email} has been promoted to ${role}`,
      });

      await loadUsers();
    } catch (error: any) {
      console.error('Error promoting user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to promote user",
        variant: "destructive",
      });
    } finally {
      setPromoting(null);
    }
  };

  const removeAdmin = async (userId: string, email: string) => {
    try {
      const { error } = await supabase
        .from('admin_profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Success",
        description: `${email} has been removed from admin privileges`,
      });

      await loadUsers();
    } catch (error: any) {
      console.error('Error removing admin:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove admin privileges",
        variant: "destructive",
      });
    }
  };

  const addAdminByEmail = async () => {
    if (!newAdminEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    try {
      // Since we can't access auth.users directly, we'll create a placeholder entry
      // The actual user ID will be set when they first log in
      const placeholderId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const { error } = await supabase
        .from('admin_profiles')
        .insert([{
          id: placeholderId,
          email: newAdminEmail.toLowerCase(),
          name: newAdminEmail.split('@')[0],
          role: newAdminRole,
        }])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Success",
        description: `${newAdminEmail} has been added as ${newAdminRole}. They will be able to log in once they exist in the auth system.`,
      });

      setNewAdminEmail('');
      setNewAdminRole('admin');
      await loadUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add admin",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading users...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
      
      <div className="grid gap-6">
        {/* Add Admin Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add Admin User
            </CardTitle>
            <CardDescription>
              Promote an existing user to admin status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">User Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={newAdminRole} onValueChange={(value: 'admin' | 'super_admin') => setNewAdminRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={addAdminByEmail} className="w-full">
                  Add Admin
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Admins */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Current Admins ({adminProfiles.length})
            </CardTitle>
            <CardDescription>
              Users with admin privileges
            </CardDescription>
          </CardHeader>
          <CardContent>
            {adminProfiles.length === 0 ? (
              <Alert>
                <AlertDescription>
                  No admin users found. Add users to the admin_profiles table or use the form above.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {adminProfiles.map((admin) => (
                  <div key={admin.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{admin.email}</p>
                        <p className="text-sm text-muted-foreground">
                          {admin.role} • Created {new Date(admin.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeAdmin(admin.id, admin.email)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              How to Add Admin Users
            </CardTitle>
            <CardDescription>
              Instructions for adding admin users to your system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  <strong>Method 1: Use the form above</strong><br />
                  Enter an email address and role, then click "Add Admin". The user will be able to log in once they exist in your Supabase Auth system.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <AlertDescription>
                  <strong>Method 2: Create users in Supabase Dashboard</strong><br />
                  1. Go to your Supabase Dashboard → Authentication → Users<br />
                  2. Click "Add user" and create users with the emails you want as admins<br />
                  3. Use the form above to add them as admins, or they'll be automatically added when they first log in
                </AlertDescription>
              </Alert>
              
              <Alert>
                <AlertDescription>
                  <strong>Method 3: Use SQL scripts</strong><br />
                  Use the scripts in the <code>scripts/</code> folder to add existing users as admins via SQL.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
