'use client';

import { useState, useEffect } from 'react';
import { AdminAuthService } from '@/lib/adminAuthService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TestAuthPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testAuth = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Testing authentication...');
        const currentUser = await AdminAuthService.getCurrentUser();
        console.log('Auth result:', currentUser);
        
        setUser(currentUser);
      } catch (err) {
        console.error('Auth test error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    testAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await AdminAuthService.logout();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Testing Authentication</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <h3 className="font-medium text-red-800">Error:</h3>
              <p className="text-red-600">{error}</p>
            </div>
          )}
          
          {user ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <h3 className="font-medium text-green-800">Authenticated!</h3>
              <div className="text-green-600 space-y-1">
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Role:</strong> {user.role}</p>
              </div>
              <Button onClick={handleLogout} className="mt-4">
                Logout
              </Button>
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <h3 className="font-medium text-yellow-800">Not Authenticated</h3>
              <p className="text-yellow-600">No user found or authentication failed.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
