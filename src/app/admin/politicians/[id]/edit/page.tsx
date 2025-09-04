'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PoliticianService } from '@/lib/politicianService';
import type { Politician } from '@/lib/types';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import PhotoUpload from '@/components/PhotoUpload';

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
  const [customParty, setCustomParty] = useState('');
  const [customNationality, setCustomNationality] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAutofillName, setAiAutofillName] = useState('');



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
        setConstituency(data.constituency || '');
        setCurrentPosition(data.positions.current.position || '');
        setAssumedOffice(data.positions.current.assumedOffice || '');
        setDateOfBirth(data.personalDetails.dateOfBirth || '');
        setPlaceOfBirth(data.personalDetails.placeOfBirth || '');
        setGender(data.personalDetails.gender || '');
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
        // Handle custom party logic
        const predefinedParties = ['Democratic Party', 'Republican Party', 'Independent', 'Green Party', 'Libertarian Party', 'Conservative Party', 'Labour Party', 'Liberal Democrats', 'Scottish National Party', 'Plaid Cymru', 'Sinn Féin', 'Democratic Unionist Party', 'Alliance Party', 'Social Democratic and Labour Party', 'Ulster Unionist Party'];
        if (data.party && !predefinedParties.includes(data.party)) {
          setCustomParty(data.party);
          setParty('Other');
        } else {
          setParty(data.party || '');
        }
        // Handle custom nationality logic
        const predefinedNationalities = ['American', 'British', 'Canadian', 'Australian', 'Indian', 'Chinese', 'Japanese', 'German', 'French', 'Italian', 'Spanish', 'Russian', 'Brazilian', 'Mexican', 'South African'];
        if (data.personalDetails.nationality && !predefinedNationalities.includes(data.personalDetails.nationality)) {
          setCustomNationality(data.personalDetails.nationality);
          setNationality('Other');
        } else {
          setNationality(data.personalDetails.nationality || '');
        }
      }
    } catch (error) {
      console.error('Error loading politician:', error);
      setError('Failed to load politician data');
    } finally {
      setLoading(false);
    }
  }

  async function handleAIAutofill() {
    if (!aiAutofillName || aiAutofillName.trim().length < 2) {
      setError('Please enter a valid name in the AI Autofill field.');
      return;
    }
    try {
      setAiLoading(true);
      setError(null);
      const res = await fetch('/api/ai/autofill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: aiAutofillName }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'AI autofill failed');
      const d = json.data || {};
      
      // Update form fields with AI data
      if (d.fullName) setFullName(d.fullName);
      // Handle party selection - check if it's a predefined party or custom
      if (d.party) {
        const predefinedParties = ['Democratic Party', 'Republican Party', 'Independent', 'Green Party', 'Libertarian Party', 'Conservative Party', 'Labour Party', 'Liberal Democrats', 'Scottish National Party', 'Plaid Cymru', 'Sinn Féin', 'Democratic Unionist Party', 'Alliance Party', 'Social Democratic and Labour Party', 'Ulster Unionist Party'];
        if (predefinedParties.includes(d.party)) {
          setParty(d.party);
          setCustomParty('');
        } else {
          setParty('Other');
          setCustomParty(d.party);
        }
      }
      if (d.constituency) setConstituency(d.constituency);
      if (d.currentPosition) setCurrentPosition(d.currentPosition);
      if (d.assumedOffice) setAssumedOffice(d.assumedOffice);
      if (d.dateOfBirth) setDateOfBirth(d.dateOfBirth);
      if (d.placeOfBirth) setPlaceOfBirth(d.placeOfBirth);
      if (d.gender) setGender(d.gender);
      // Handle nationality selection - check if it's a predefined nationality or custom
      if (d.nationality) {
        const predefinedNationalities = ['American', 'British', 'Canadian', 'Australian', 'Indian', 'Chinese', 'Japanese', 'German', 'French', 'Italian', 'Spanish', 'Russian', 'Brazilian', 'Mexican', 'South African'];
        if (predefinedNationalities.includes(d.nationality)) {
          setNationality(d.nationality);
          setCustomNationality('');
        } else {
          setNationality('Other');
          setCustomNationality(d.nationality);
        }
      }
      if (Array.isArray(d.languages)) setLanguages(d.languages.join(', '));
      if (Array.isArray(d.committees)) setCommittees(d.committees.join(', '));
      if (d.address) setAddress(d.address);
      if (d.email) setEmail(d.email);
      if (d.phone) setPhone(d.phone);
      if (d.website) setWebsite(d.website);
      if (d.photoUrl) setPhotoUrl(d.photoUrl);
      if (d.spouse) setSpouse(d.spouse);
      if (Array.isArray(d.children)) setChildren(d.children.join(', '));
      if (d.twitter) setTwitter(d.twitter);
      if (d.facebook) setFacebook(d.facebook);
      
      // Clear the AI autofill field after successful autofill
      setAiAutofillName('');
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'AI autofill failed');
    } finally {
      setAiLoading(false);
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
        party: party === 'Other' ? customParty : party,
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
          nationality: nationality === 'Other' ? customNationality : nationality,
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
          <div className="w-full px-6 py-8 h-full overflow-y-auto">
      <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading politician...</span>
        </div>
      </div>
    );
  }

  if (!politician) {
    return (
          <div className="w-full px-6 py-8 h-full overflow-y-auto">
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
    <div className="w-full px-6 py-8 h-full overflow-y-auto">
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
                  minLength={2}
                  maxLength={100}
                  placeholder="Enter full legal name"
                />
                <p className="text-xs text-muted-foreground">{fullName.length}/100 characters</p>
              </div>
              <div>
                <Label htmlFor="aliases">Aliases (comma-separated)</Label>
                <Textarea
                  id="aliases"
                  value={aliases}
                  onChange={(e) => setAliases(e.target.value)}
                  placeholder="e.g., John Doe, J. Doe"
                  rows={2}
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground">{aliases.length}/200 characters</p>
              </div>
              <div>
                <Label htmlFor="aiAutofill">AI Autofill</Label>
                <div className="flex gap-2">
                  <Input
                    id="aiAutofill"
                    value={aiAutofillName}
                    onChange={(e) => setAiAutofillName(e.target.value)}
                    placeholder="Enter politician name for AI autofill"
                    disabled={aiLoading}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleAIAutofill} 
                    disabled={aiLoading}
                    className="min-w-[120px]"
                  >
                    {aiLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Autofilling...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Autofill
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Enter a politician's name and click Autofill to populate fields with AI research
                </p>
              </div>
              <div>
                <Label htmlFor="party">Party *</Label>

                <Select value={party} onValueChange={setParty} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select political party" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Democratic Party">Democratic Party</SelectItem>
                    <SelectItem value="Republican Party">Republican Party</SelectItem>
                    <SelectItem value="Independent">Independent</SelectItem>
                    <SelectItem value="Green Party">Green Party</SelectItem>
                    <SelectItem value="Libertarian Party">Libertarian Party</SelectItem>
                    <SelectItem value="Conservative Party">Conservative Party</SelectItem>
                    <SelectItem value="Labour Party">Labour Party</SelectItem>
                    <SelectItem value="Liberal Democrats">Liberal Democrats</SelectItem>
                    <SelectItem value="Scottish National Party">Scottish National Party</SelectItem>
                    <SelectItem value="Plaid Cymru">Plaid Cymru</SelectItem>
                    <SelectItem value="Sinn Féin">Sinn Féin</SelectItem>
                    <SelectItem value="Democratic Unionist Party">Democratic Unionist Party</SelectItem>
                    <SelectItem value="Alliance Party">Alliance Party</SelectItem>
                    <SelectItem value="Social Democratic and Labour Party">Social Democratic and Labour Party</SelectItem>
                    <SelectItem value="Ulster Unionist Party">Ulster Unionist Party</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {party === 'Other' && (
                <div>
                  <Label htmlFor="customParty">Custom Party Name *</Label>
                  <Input
                    id="customParty"
                    value={customParty}
                    onChange={(e) => setCustomParty(e.target.value)}
                    placeholder="Enter party name"
                    required
                  />
                </div>
              )}
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
                  type="month"
                  value={assumedOffice}
                  onChange={(e) => setAssumedOffice(e.target.value)}
                  placeholder="e.g., 2020-01"
                />
              </div>
              <div>
                <Label htmlFor="committees">Committees (comma-separated)</Label>
                <Textarea
                  id="committees"
                  value={committees}
                  onChange={(e) => setCommittees(e.target.value)}
                  placeholder="e.g., Finance, Education"
                  rows={2}
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
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                    <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="nationality">Nationality</Label>
                <Select value={nationality} onValueChange={setNationality}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select nationality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="American">American</SelectItem>
                    <SelectItem value="British">British</SelectItem>
                    <SelectItem value="Canadian">Canadian</SelectItem>
                    <SelectItem value="Australian">Australian</SelectItem>
                    <SelectItem value="Indian">Indian</SelectItem>
                    <SelectItem value="Chinese">Chinese</SelectItem>
                    <SelectItem value="Japanese">Japanese</SelectItem>
                    <SelectItem value="German">German</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="Italian">Italian</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                    <SelectItem value="Russian">Russian</SelectItem>
                    <SelectItem value="Brazilian">Brazilian</SelectItem>
                    <SelectItem value="Mexican">Mexican</SelectItem>
                    <SelectItem value="South African">South African</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {nationality === 'Other' && (
                <div>
                  <Label htmlFor="customNationality">Custom Nationality *</Label>
                  <Input
                    id="customNationality"
                    value={customNationality}
                    onChange={(e) => setCustomNationality(e.target.value)}
                    placeholder="Enter nationality"
                    required
                  />
                </div>
              )}
              <div>
                <Label htmlFor="languages">Languages (comma-separated)</Label>
                <Textarea
                  id="languages"
                  value={languages}
                  onChange={(e) => setLanguages(e.target.value)}
                  placeholder="e.g., English, Spanish"
                  rows={2}
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
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  placeholder="Enter full address"
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
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
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
                <PhotoUpload
                  value={photoUrl}
                  onChange={setPhotoUrl}
                  politicianName={fullName}
                  disabled={submitting}
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
                <Textarea
                  id="children"
                  value={children}
                  onChange={(e) => setChildren(e.target.value)}
                  placeholder="e.g., John Jr, Jane"
                  rows={2}
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
                  type="url"
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
          <Button type="submit" disabled={submitting} className="min-w-[140px]">
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
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p>* Required fields</p>
          <p>All changes will be saved immediately when you click Update Politician</p>
        </div>
      </form>
    </div>
  );
}
