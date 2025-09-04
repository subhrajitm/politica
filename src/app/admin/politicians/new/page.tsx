'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PoliticianService } from '@/lib/politicianService';
import type { Politician } from '@/lib/types';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles } from 'lucide-react';
import PhotoUpload from '@/components/PhotoUpload';

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
  const [customParty, setCustomParty] = useState('');
  const [customNationality, setCustomNationality] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAutofillName, setAiAutofillName] = useState('');



  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (!fullName || !party || !constituency || !currentPosition) {
        throw new Error('Please fill in full name, party, constituency, and current position.');
      }
      
      // Validate required fields
      if (party === 'Other' && !customParty) {
        throw new Error('Please enter a custom party name when selecting "Other".');
      }
      
      if (nationality === 'Other' && !customNationality) {
        throw new Error('Please enter a custom nationality when selecting "Other".');
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
          placeOfBirth: placeOfBirth || 'Unknown',
          gender: gender || 'Unknown',
          nationality: nationality === 'Other' ? customNationality : nationality || 'Unknown',
          languages: languages
            .split(',')
            .map(l => l.trim())
            .filter(Boolean) || ['English'],
        },
        contact: {
          address: address || 'Unknown',
          email: email || 'unknown@example.com',
          phone: phone || 'Unknown',
          website: website || undefined,
        },
        photoUrl: photoUrl || 'https://via.placeholder.com/400x400?text=No+Photo',
        family: {
          spouse: spouse || undefined,
          children: children
            .split(',')
            .map(c => c.trim())
            .filter(Boolean),
        },
        education: [],
        party: party === 'Other' ? customParty : party,
        constituency,
        positions: {
          current: {
            position: currentPosition,
            assumedOffice: assumedOffice ? `${assumedOffice}-01` : '1970-01-01',
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

      console.log('Submitting politician data:', newPolitician);
      const politicianId = await PoliticianService.createPolitician(newPolitician);
      console.log('Politician created successfully with ID:', politicianId);
      router.push('/admin/politicians');
    } catch (err: any) {
      console.error('Error creating politician:', err);
      setError(err?.message || 'Failed to create politician');
    } finally {
      setSubmitting(false);
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
      // Always set the full name from AI response or use the autofill name
      setFullName(d.fullName || aiAutofillName);
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

  return (
    <div className="w-full px-6 py-8 h-full overflow-y-auto">
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
              <Label htmlFor="party">Party</Label>

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
                placeholder="Enter constituency name"
              />
            </div>
            <div>
              <Label htmlFor="currentPosition">Current Position *</Label>
              <Input
                id="currentPosition"
                value={currentPosition}
                onChange={(e) => setCurrentPosition(e.target.value)}
                required
                placeholder="e.g., Member of Parliament"
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
                placeholder="e.g., New York, USA"
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
            <div className="md:col-span-2">
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
                placeholder="email@example.com"
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
                placeholder="Spouse name"
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
            <div>
              <Label htmlFor="twitter">Twitter Handle</Label>
              <Input id="twitter" value={twitter} onChange={(e) => setTwitter(e.target.value)} />
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

            {error && (
              <div className="md:col-span-2 text-sm text-destructive">{error}</div>
            )}

            <div className="md:col-span-2 flex gap-2 mt-2">
              <Button type="submit" disabled={submitting} className="min-w-[140px]">
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Politician'
                )}
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


