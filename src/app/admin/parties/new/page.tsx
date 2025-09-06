'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save } from 'lucide-react';
import { PoliticalPartyService } from '@/lib/politicalPartyService';
import { PoliticalParty } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import countries from '../../../../../country_data/country_state.json';

const IDEOLOGIES = [
  'Social Democratic',
  'Conservative',
  'Liberal',
  'Socialist',
  'Communist',
  'Green',
  'Christian Democratic',
  'Nationalist',
  'Populist',
  'Centrist',
  'Progressive',
  'Reformist',
  'Traditionalist',
  'Other'
];

const POLITICAL_POSITIONS = [
  'Far-left',
  'Left',
  'Centre-left',
  'Centre',
  'Centre-right',
  'Right',
  'Far-right'
];

export default function NewPartyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<PoliticalParty>>({
    name: '',
    nameLocal: '',
    countryCode: '',
    countryName: '',
    ideology: '',
    politicalPosition: '',
    foundedYear: undefined,
    currentLeader: '',
    headquarters: '',
    website: '',
    logoUrl: '',
    description: '',
    membershipCount: undefined,
    isRulingParty: false,
    isParliamentary: false,
    isRegional: false,
    regionState: '',
    electoralPerformance: [],
    socialMedia: {}
  });

  const handleInputChange = (field: keyof PoliticalParty, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCountryChange = (countryCode: string) => {
    const country = countries.find(c => c.countryCode === countryCode);
    if (country) {
      setFormData(prev => ({
        ...prev,
        countryCode: country.countryCode,
        countryName: country.name
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.countryCode) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      await PoliticalPartyService.createParty(formData as Omit<PoliticalParty, 'id' | 'createdAt' | 'updatedAt'>);
      
      toast({
        title: 'Success',
        description: 'Political party created successfully',
      });
      
      router.push('/admin/parties');
    } catch (error) {
      console.error('Error creating party:', error);
      toast({
        title: 'Error',
        description: 'Failed to create political party',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center space-x-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add New Political Party</h1>
          <p className="text-muted-foreground">
            Create a new political party entry
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Essential details about the political party
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Party Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Democratic Party"
                  required
                />
              </div>

              <div>
                <Label htmlFor="nameLocal">Local Name</Label>
                <Input
                  id="nameLocal"
                  value={formData.nameLocal || ''}
                  onChange={(e) => handleInputChange('nameLocal', e.target.value)}
                  placeholder="Name in local language"
                />
              </div>

              <div>
                <Label htmlFor="country">Country *</Label>
                <Select onValueChange={handleCountryChange} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.countryCode} value={country.countryCode}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="ideology">Ideology</Label>
                <Select onValueChange={(value) => handleInputChange('ideology', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ideology" />
                  </SelectTrigger>
                  <SelectContent>
                    {IDEOLOGIES.map((ideology) => (
                      <SelectItem key={ideology} value={ideology}>
                        {ideology}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="politicalPosition">Political Position</Label>
                <Select onValueChange={(value) => handleInputChange('politicalPosition', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select political position" />
                  </SelectTrigger>
                  <SelectContent>
                    {POLITICAL_POSITIONS.map((position) => (
                      <SelectItem key={position} value={position}>
                        {position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="foundedYear">Founded Year</Label>
                <Input
                  id="foundedYear"
                  type="number"
                  value={formData.foundedYear || ''}
                  onChange={(e) => handleInputChange('foundedYear', parseInt(e.target.value) || undefined)}
                  placeholder="e.g., 1854"
                />
              </div>

              <div>
                <Label htmlFor="currentLeader">Current Leader</Label>
                <Input
                  id="currentLeader"
                  value={formData.currentLeader || ''}
                  onChange={(e) => handleInputChange('currentLeader', e.target.value)}
                  placeholder="e.g., Joe Biden"
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>
                Optional details and characteristics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="headquarters">Headquarters</Label>
                <Input
                  id="headquarters"
                  value={formData.headquarters || ''}
                  onChange={(e) => handleInputChange('headquarters', e.target.value)}
                  placeholder="e.g., Washington, D.C."
                />
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website || ''}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  type="url"
                  value={formData.logoUrl || ''}
                  onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div>
                <Label htmlFor="membershipCount">Membership Count</Label>
                <Input
                  id="membershipCount"
                  type="number"
                  value={formData.membershipCount || ''}
                  onChange={(e) => handleInputChange('membershipCount', parseInt(e.target.value) || undefined)}
                  placeholder="e.g., 1000000"
                />
              </div>

              <div>
                <Label htmlFor="regionState">Region/State (for regional parties)</Label>
                <Input
                  id="regionState"
                  value={formData.regionState || ''}
                  onChange={(e) => handleInputChange('regionState', e.target.value)}
                  placeholder="e.g., California"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of the party..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Party Characteristics */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Party Characteristics</CardTitle>
            <CardDescription>
              Define the party's current status and type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isRulingParty"
                  checked={formData.isRulingParty || false}
                  onCheckedChange={(checked) => handleInputChange('isRulingParty', checked)}
                />
                <Label htmlFor="isRulingParty">Ruling Party</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isParliamentary"
                  checked={formData.isParliamentary || false}
                  onCheckedChange={(checked) => handleInputChange('isParliamentary', checked)}
                />
                <Label htmlFor="isParliamentary">Parliamentary Party</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isRegional"
                  checked={formData.isRegional || false}
                  onCheckedChange={(checked) => handleInputChange('isRegional', checked)}
                />
                <Label htmlFor="isRegional">Regional Party</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Creating...' : 'Create Party'}
          </Button>
        </div>
      </form>
    </div>
  );
}
