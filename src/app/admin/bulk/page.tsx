'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminBulkRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the correct bulk import page
    router.replace('/admin/parties/bulk-simple');
  }, [router]);

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Redirecting...</h2>
          <p className="text-muted-foreground">Taking you to the bulk import page</p>
        </div>
      </div>
    </div>
  );
}
