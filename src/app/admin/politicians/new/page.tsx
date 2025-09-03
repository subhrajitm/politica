'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PoliticianService } from '@/lib/politicianService';
import type { Politician } from '@/lib/types';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export default function NewPoliticianPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Minimal required fields for a politician; the service will accept the full shape
  const [fullName, setFullName] = useState('');
  const [aliases, setAliases] = useState(''); // comma-separated
  const [party, setParty] = useState('');
  const [constituency, setConstituency] = useState('');
  const [currentPosition, setCurrentPosition] = useState('');
  const [assumedOffice, setAssumedOffice] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [placeOfBirth, setPlaceOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [nationality, setNationality] = useState('');
  const [languages, setLanguages] = useState(''); // comma-separated
  const [committees, setCommittees] = useState(''); // comma-separated
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [spouse, setSpouse] = useState('');
  const [children, setChildren] = useState(''); // comma-separated
  const [twitter, setTwitter] = useState('');
  const [facebook, setFacebook] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (!fullName || !party || !constituency || !currentPosition) {
        throw new Error('Please fill in full name, party, constituency, and current position.');
      }

      const newPolitician: Omit<Politician, 'id'> = {
        name: {
          fullName,
          aliases: aliases
            .split(',')
            .map(a => a.trim())
            .filter(Boolean),
        },
        personalDetails: {
          dateOfBirth: dateOfBirth || '1970-01-01',
          placeOfBirth: placeOfBirth || '',
          gender: gender || 'Unknown',
          nationality: nationality || '',
          languages: languages
            .split(',')
            .map(l => l.trim())
            .filter(Boolean),
        },
        contact: {
          address: address || '',
          email: email || '',
          phone: phone || '',
          website: website || undefined,
        },
        photoUrl: photoUrl || '',
        family: {
          spouse: spouse || undefined,
          children: children
            .split(',')
            .map(c => c.trim())
            .filter(Boolean),
        },
        education: [],
        party,
        constituency,
        positions: {
          current: {
            position: currentPosition,
            assumedOffice: assumedOffice || '',
            committees: committees
              .split(',')
              .map(c => c.trim())
              .filter(Boolean),
          },
          history: [],
        },
        electoralHistory: [],
        policyStances: [],
        votingRecords: [],
        legislativeAchievements: [],
        ratings: [],
        campaignFinance: {
          totalReceipts: '0',
          totalDisbursements: '0',
          cashOnHand: '0',
          debt: '0',
          topContributors: [],
        },
        relationships: [],
        newsMentions: [],
        speeches: [],
        socialMedia: {
          twitter: twitter || undefined,
          facebook: facebook || undefined,
        },
      };

      await PoliticianService.createPolitician(newPolitician);
      router.push('/admin/politicians');
    } catch (err: any) {
      setError(err?.message || 'Failed to create politician');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Add Politician</h1>
        <p className="text-muted-foreground">Create a new politician profile</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="aliases">Aliases (comma-separated)</Label>
              <Input id="aliases" value={aliases} onChange={(e) => setAliases(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="party">Party</Label>
              <Input id="party" value={party} onChange={(e) => setParty(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="constituency">Constituency</Label>
              <Input id="constituency" value={constituency} onChange={(e) => setConstituency(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="currentPosition">Current Position</Label>
              <Input id="currentPosition" value={currentPosition} onChange={(e) => setCurrentPosition(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="assumedOffice">Assumed Office (YYYY-MM-DD)</Label>
              <Input id="assumedOffice" value={assumedOffice} onChange={(e) => setAssumedOffice(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth (YYYY-MM-DD)</Label>
              <Input id="dateOfBirth" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="placeOfBirth">Place of Birth</Label>
              <Input id="placeOfBirth" value={placeOfBirth} onChange={(e) => setPlaceOfBirth(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Input id="gender" value={gender} onChange={(e) => setGender(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="nationality">Nationality</Label>
              <Input id="nationality" value={nationality} onChange={(e) => setNationality(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="languages">Languages (comma-separated)</Label>
              <Input id="languages" value={languages} onChange={(e) => setLanguages(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="committees">Committees (comma-separated)</Label>
              <Input id="committees" value={committees} onChange={(e) => setCommittees(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="photoUrl">Photo URL</Label>
              <Input id="photoUrl" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="spouse">Spouse</Label>
              <Input id="spouse" value={spouse} onChange={(e) => setSpouse(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="children">Children (comma-separated)</Label>
              <Input id="children" value={children} onChange={(e) => setChildren(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="twitter">Twitter Handle</Label>
              <Input id="twitter" value={twitter} onChange={(e) => setTwitter(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="facebook">Facebook URL</Label>
              <Input id="facebook" value={facebook} onChange={(e) => setFacebook(e.target.value)} />
            </div>

            {error && (
              <div className="md:col-span-2 text-sm text-destructive">{error}</div>
            )}

            <div className="md:col-span-2 flex gap-2 mt-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Create
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push('/admin/politicians')} disabled={submitting}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


