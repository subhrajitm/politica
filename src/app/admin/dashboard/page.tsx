
'use client';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, PlusCircle, Activity, FileText, Eye, Edit } from 'lucide-react';
import { PoliticianService } from '@/lib/politicianService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PartyLogo } from '@/components/PartyLogo';
import { useEffect, useState } from 'react';
import type { Politician } from '@/lib/types';

export default function DashboardPage() {
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPoliticians = async () => {
      try {
        const data = await PoliticianService.getAllPoliticians();
        setPoliticians(data);
      } catch (error) {
        console.error('Error fetching politicians:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPoliticians();
  }, []);

  const recentPoliticians = politicians.slice(0, 5);

  if (loading) {
    return (
      <div className="w-full px-6 py-8 h-full overflow-y-auto">
        <div className="text-center">
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-6 py-8 h-full overflow-y-auto">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Link href="/admin/politicians/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Politician
            </Button>
          </Link>
          <Link href="/admin/politicians/bulk">
            <Button variant="outline">
              <PlusCircle className="mr-2 h-4 w-4" /> Bulk Add
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Politicians</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{politicians.length}</div>
            <p className="text-xs text-muted-foreground">profiles in the database</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parties Represented</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(politicians.map(p => p.party)).size}</div>
            <p className="text-xs text-muted-foreground">unique political parties</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">no pending changes</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Recently Added Politicians</CardTitle>
            <CardDescription>The 5 most recently added profiles.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Party</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Constituency</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPoliticians.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name.fullName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <PartyLogo party={p.party} className="w-5 h-5" />
                        <span>{p.party}</span>
                      </div>
                    </TableCell>
                    <TableCell>{p.positions.current.position}</TableCell>
                    <TableCell>{p.constituency}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link href={`/politicians/${p.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </Link>
                        <Link href={`/admin/politicians/${p.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
