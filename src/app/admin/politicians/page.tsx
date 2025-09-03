
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MoreHorizontal, PlusCircle } from 'lucide-react';

import { politicians } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { PartyLogo } from '@/components/PartyLogo';

export default function AdminPoliticiansPage() {
  // In a real app, you'd fetch this data and use server-side pagination/filtering
  const [allPoliticians] = useState(politicians);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Politician Profiles</h2>
            <p className="text-muted-foreground">
              Manage the politician database here.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New
            </Button>
          </div>
        </div>
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span className="sr-only">Image</span>
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Party</TableHead>
                <TableHead className="hidden md:table-cell">Position</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allPoliticians.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="hidden sm:table-cell">
                    <Image
                      alt={p.name.fullName}
                      className="aspect-square rounded-md object-cover"
                      height="64"
                      src={p.photoUrl}
                      width="64"
                      data-ai-hint="politician photo"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{p.name.fullName}</TableCell>
                  <TableCell>
                      <div className="flex items-center gap-2">
                        <PartyLogo party={p.party} className="w-5 h-5" />
                        <span className="hidden lg:inline">{p.party}</span>
                      </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{p.positions.current.position}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>View Public Page</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
