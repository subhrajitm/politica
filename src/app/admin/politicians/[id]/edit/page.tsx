'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PoliticianService } from '@/lib/politicianService';
import type { Politician } from '@/lib/types';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditPoliticianPage() {
  const router = useRouter();
  const params = useParams();
  const politicianId = String(params?.id || '');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [politician, setPolitician] = useState<Politician | null>(null);

  // Form state
  const [fullName, setFullName] = useState('');
  const [aliases, setAliases] = useState('');
  const [party, setParty] = useState('');
  const [constituency, setConstituency] = useState('');
  const [currentPosition, setCurrentPosition] = useState('');
  const [assumedOffice, setAssumedOffice] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [placeOfBirth, setPlaceOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [nationality, setNationality] = useState('');
  const [languages, setLanguages] = useState('');
  const [committees, setCommittees] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [spouse, setSpouse] = useState('');
  const [children, setChildren] = useState('');
  const [twitter, setTwitter] = useState('');
  const [facebook, setFacebook] = useState('');

  useEffect(() => {
    if (politicianId) {
      loadPolitician();
    }
  }, [politicianId]);

  async function loadPolitician() {
    try {
      setLoading(true);
      const data = await PoliticianService.getPoliticianById(politicianId);
      if (data) {
        setPolitician(data);
        // Populate form fields
        setFullName(data.name.fullName || '');
        setAliases(data.name.aliases?.join(', ') || '');
        setParty(data.party || '');
        setConstituency(data.constituency || '');
        setCurrentPosition(data.positions.current.position || '');
        setAssumedOffice(data.positions.current.assumedOffice || '');
        setDateOfBirth(data.personalDetails.dateOfBirth || '');
        setPlaceOfBirth(data.personalDetails.placeOfBirth || '');
        setGender(data.personalDetails.gender || '');
        setNationality(data.personalDetails.nationality || '');
        setLanguages(data.personalDetails.languages?.join(', ') || '');
        setCommittees(data.positions.current.committees?.join(', ') || '');
        setAddress(data.contact.address || '');
        setEmail(data.contact.email || '');
        setPhone(data.contact.phone || '');
        setWebsite(data.contact.website || '');
        setPhotoUrl(data.photoUrl || '');
        setSpouse(data.personalDetails.spouse || '');
        setChildren(data.personalDetails.children?.join(', ') || '');
        setTwitter(data.socialMedia?.twitter || '');
        setFacebook(data.socialMedia?.facebook || '');
      }
    } catch (error) {
      console.error('Error loading politician:', error);
      setError('Failed to load politician data');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!politician) return;

    setSubmitting(true);
    setError(null);

    try {
      const updatedPolitician: Politician = {
        ...politician,
        name: {
          ...politician.name,
          fullName,
          aliases: aliases ? aliases.split(',').map(s => s.trim()).filter(Boolean) : [],
        },
        party,
        constituency,
        positions: {
          ...politician.positions,
          current: {
            ...politician.positions.current,
            position: currentPosition,
            assumedOffice,
            committees: committees ? committees.split(',').map(s => s.trim()).filter(Boolean) : [],
          },
        },
        personalDetails: {
          ...politician.personalDetails,
          dateOfBirth,
          placeOfBirth,
          gender,
          nationality,
          languages: languages ? languages.split(',').map(s => s.trim()).filter(Boolean) : [],
          spouse,
          children: children ? children.split(',').map(s => s.trim()).filter(Boolean) : [],
        },
        contact: {
          ...politician.contact,
          address,
          email,
          phone,
          website,
        },
        photoUrl,
        socialMedia: {
          ...politician.socialMedia,
          twitter,
          facebook,
        },
      };

      await PoliticianService.updatePolitician(politicianId, updatedPolitician);
      router.push('/admin/politicians');
    } catch (error) {
      console.error('Error updating politician:', error);
      setError('Failed to update politician. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading politician...</span>
        </div>
      </div>
    );
  }

  if (!politician) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-red-600">Politician not found</h1>
          <p className="text-muted-foreground mt-2">The politician you're looking for doesn't exist.</p>
          <Link href="/admin/politicians">
            <Button className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Politicians
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/admin/politicians">
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Politicians
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit Politician</h1>
        <p className="text-muted-foreground">Update politician profile information</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="aliases">Aliases (comma-separated)</Label>
                <Input
                  id="aliases"
                  value={aliases}
                  onChange={(e) => setAliases(e.target.value)}
                  placeholder="e.g., John Doe, J. Doe"
                />
              </div>
              <div>
                <Label htmlFor="party">Party *</Label>
                <Input
                  id="party"
                  value={party}
                  onChange={(e) => setParty(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="constituency">Constituency *</Label>
                <Input
                  id="constituency"
                  value={constituency}
                  onChange={(e) => setConstituency(e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Position Information */}
          <Card>
            <CardHeader>
              <CardTitle>Current Position</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPosition">Position Title *</Label>
                <Input
                  id="currentPosition"
                  value={currentPosition}
                  onChange={(e) => setCurrentPosition(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="assumedOffice">Assumed Office</Label>
                <Input
                  id="assumedOffice"
                  value={assumedOffice}
                  onChange={(e) => setAssumedOffice(e.target.value)}
                  placeholder="e.g., January 2020"
                />
              </div>
              <div>
                <Label htmlFor="committees">Committees (comma-separated)</Label>
                <Input
                  id="committees"
                  value={committees}
                  onChange={(e) => setCommittees(e.target.value)}
                  placeholder="e.g., Finance, Education"
                />
              </div>
            </CardContent>
          </Card>

          {/* Personal Details */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="placeOfBirth">Place of Birth</Label>
                <Input
                  id="placeOfBirth"
                  value={placeOfBirth}
                  onChange={(e) => setPlaceOfBirth(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Input
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  placeholder="e.g., Male, Female, Other"
                />
              </div>
              <div>
                <Label htmlFor="nationality">Nationality</Label>
                <Input
                  id="nationality"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="languages">Languages (comma-separated)</Label>
                <Input
                  id="languages"
                  value={languages}
                  onChange={(e) => setLanguages(e.target.value)}
                  placeholder="e.g., English, Spanish"
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="photoUrl">Photo URL</Label>
                <Input
                  id="photoUrl"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                />
              </div>
              <div>
                <Label htmlFor="spouse">Spouse</Label>
                <Input
                  id="spouse"
                  value={spouse}
                  onChange={(e) => setSpouse(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="children">Children (comma-separated)</Label>
                <Input
                  id="children"
                  value={children}
                  onChange={(e) => setChildren(e.target.value)}
                  placeholder="e.g., John Jr, Jane"
                />
              </div>
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card>
            <CardHeader>
              <CardTitle>Social Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="twitter">Twitter Handle</Label>
                <Input
                  id="twitter"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="@username"
                />
              </div>
              <div>
                <Label htmlFor="facebook">Facebook Page</Label>
                <Input
                  id="facebook"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="https://facebook.com/username"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="mt-6 flex gap-4">
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Politician'
            )}
          </Button>
          <Link href="/admin/politicians">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
