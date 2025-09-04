'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PoliticianService } from '@/lib/politicianService';
import type { Politician } from '@/lib/types';
import { normalizeDate, normalizeAssumedOffice } from '@/lib/dateUtils';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Loader2, Upload, Download, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface BulkPoliticianData {
  fullName: string;
  party: string;
  constituency: string;
  currentPosition: string;
  assumedOffice: string;
  dateOfBirth: string;
  placeOfBirth: string;
  gender: string;
  nationality: string;
  languages: string;
  committees: string;
  address: string;
  email: string;
  phone: string;
  website: string;
  photoUrl: string;
  spouse: string;
  children: string;
  twitter: string;
  facebook: string;
}

export default function BulkAddPoliticiansPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('csv');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  
  // CSV upload state
  const [csvData, setCsvData] = useState<string>('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  
  // Manual entry state
  const [manualEntries, setManualEntries] = useState<BulkPoliticianData[]>([
    {
      fullName: '',
      party: '',
      constituency: '',
      currentPosition: '',
      assumedOffice: '',
      dateOfBirth: '',
      placeOfBirth: '',
      gender: '',
      nationality: '',
      languages: '',
      committees: '',
      address: '',
      email: '',
      phone: '',
      website: '',
      photoUrl: '',
      spouse: '',
      children: '',
      twitter: '',
      facebook: '',
    }
  ]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setCsvData(e.target?.result as string);
      };
      reader.readAsText(file);
    } else {
      setError('Please select a valid CSV file');
    }
  };

  const addManualEntry = () => {
    setManualEntries([...manualEntries, {
      fullName: '',
      party: '',
      constituency: '',
      currentPosition: '',
      assumedOffice: '',
      dateOfBirth: '',
      placeOfBirth: '',
      gender: '',
      nationality: '',
      languages: '',
      committees: '',
      address: '',
      email: '',
      phone: '',
      website: '',
      photoUrl: '',
      spouse: '',
      children: '',
      twitter: '',
      facebook: '',
    }]);
  };

  const removeManualEntry = (index: number) => {
    if (manualEntries.length > 1) {
      setManualEntries(manualEntries.filter((_, i) => i !== index));
    }
  };

  const updateManualEntry = (index: number, field: keyof BulkPoliticianData, value: string) => {
    const updated = [...manualEntries];
    updated[index] = { ...updated[index], [field]: value };
    setManualEntries(updated);
  };

  const downloadTemplate = () => {
    const headers = [
      'fullName', 'party', 'constituency', 'currentPosition', 'assumedOffice',
      'dateOfBirth', 'placeOfBirth', 'gender', 'nationality', 'languages',
      'committees', 'address', 'email', 'phone', 'website',
      'photoUrl', 'spouse', 'children', 'twitter', 'facebook'
    ];
    
    const csvContent = `data:text/csv;charset=utf-8,${headers.join(',')}\n`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'politicians_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCSV = (csvText: string): BulkPoliticianData[] => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data: BulkPoliticianData[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const entry: any = {};
      
      headers.forEach((header, index) => {
        entry[header] = values[index] || '';
      });
      
      data.push(entry as BulkPoliticianData);
    }

    return data;
  };

  const validateData = (data: BulkPoliticianData[]): string[] => {
    const errors: string[] = [];
    
    data.forEach((entry, index) => {
      if (!entry.fullName.trim()) {
        errors.push(`Row ${index + 1}: Full Name is required`);
      }
      if (!entry.party.trim()) {
        errors.push(`Row ${index + 1}: Party is required`);
      }
      if (!entry.constituency.trim()) {
        errors.push(`Row ${index + 1}: Constituency is required`);
      }
      if (!entry.currentPosition.trim()) {
        errors.push(`Row ${index + 1}: Current Position is required`);
      }
    });

    return errors;
  };

  const convertToPolitician = (data: BulkPoliticianData): Omit<Politician, 'id'> => {
    return {
      name: {
        fullName: data.fullName,
        aliases: data.aliases ? data.aliases.split(',').map(a => a.trim()).filter(Boolean) : [],
      },
      personalDetails: {
        dateOfBirth: normalizeDate(data.dateOfBirth),
        placeOfBirth: data.placeOfBirth || '',
        gender: data.gender || 'Unknown',
        nationality: data.nationality || '',
        languages: data.languages ? data.languages.split(',').map(l => l.trim()).filter(Boolean) : [],
      },
      contact: {
        address: data.address || '',
        email: data.email || '',
        phone: data.phone || '',
        website: data.website || undefined,
      },
      photoUrl: data.photoUrl || '',
      family: {
        spouse: data.spouse || undefined,
        children: data.children ? data.children.split(',').map(c => c.trim()).filter(Boolean) : [],
      },
      education: [],
      party: data.party,
      constituency: data.constituency,
      positions: {
        current: {
          position: data.currentPosition,
          assumedOffice: normalizeAssumedOffice(data.assumedOffice),
          committees: data.committees ? data.committees.split(',').map(c => c.trim()).filter(Boolean) : [],
        },
        history: [],
      },
      electoralHistory: [],
      policyStances: [],
      votingRecords: [],
      socialMedia: {
        twitter: data.twitter || undefined,
        facebook: data.facebook || undefined,
      },
    };
  };

  const handleBulkSubmit = async (data: BulkPoliticianData[]) => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    setProgress({ current: 0, total: data.length });

    try {
      const validationErrors = validateData(data);
      if (validationErrors.length > 0) {
        setError(`Validation errors:\n${validationErrors.join('\n')}`);
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < data.length; i++) {
        const entry = data[i];
        setProgress({ current: i + 1, total: data.length });
        
        try {
          const politician = convertToPolitician(entry);
          await PoliticianService.createPolitician(politician);
          successCount++;
        } catch (err) {
          console.error(`Error creating politician ${entry.fullName}:`, err);
          errorCount++;
        }
      }

      if (successCount > 0) {
        setSuccess(`Successfully created ${successCount} politician(s)${errorCount > 0 ? `, ${errorCount} failed` : ''}`);
        setTimeout(() => {
          router.push('/admin/politicians');
        }, 2000);
      } else {
        setError('Failed to create any politicians. Please check your data and try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to process bulk creation');
    } finally {
      setSubmitting(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  const handleCSVSubmit = () => {
    if (!csvData.trim()) {
      setError('Please upload a CSV file first');
      return;
    }

    const parsedData = parseCSV(csvData);
    handleBulkSubmit(parsedData);
  };

  const handleManualSubmit = () => {
    const validEntries = manualEntries.filter(entry => 
      entry.fullName.trim() && entry.party.trim() && entry.constituency.trim() && entry.currentPosition.trim()
    );
    
    if (validEntries.length === 0) {
      setError('Please fill in at least one valid entry');
      return;
    }

    handleBulkSubmit(validEntries);
  };

  return (
    <div className="w-full px-6 py-8 h-full overflow-y-auto">
      <div className="mb-6">
        <Link href="/admin/politicians">
          <Button variant="outline" className="mb-4">
            ← Back to Politicians
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Bulk Add Politicians</h1>
        <p className="text-muted-foreground">Add multiple politicians at once using CSV upload or manual entry</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="csv">CSV Upload</TabsTrigger>
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
        </TabsList>

        <TabsContent value="csv" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>CSV Upload</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={downloadTemplate}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
                <p className="text-sm text-muted-foreground">
                  Download the CSV template and fill it with your data
                </p>
              </div>
              
              <div>
                <Label htmlFor="csvFile">Upload CSV File</Label>
                <Input
                  id="csvFile"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="mt-2"
                />
              </div>

              {csvData && (
                <div>
                  <Label>Preview (first 3 rows)</Label>
                  <Textarea
                    value={csvData.split('\n').slice(0, 4).join('\n')}
                    readOnly
                    rows={4}
                    className="mt-2 font-mono text-sm"
                  />
                </div>
              )}

              <Button 
                onClick={handleCSVSubmit} 
                disabled={submitting || !csvData}
                className="w-full"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing CSV...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Process CSV
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Manual Entry</CardTitle>
                <Button onClick={addManualEntry} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Entry
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {manualEntries.map((entry, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Entry {index + 1}</h3>
                    {manualEntries.length > 1 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeManualEntry(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`fullName-${index}`}>Full Name *</Label>
                      <Input
                        id={`fullName-${index}`}
                        value={entry.fullName}
                        onChange={(e) => updateManualEntry(index, 'fullName', e.target.value)}
                        placeholder="Enter full name"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`party-${index}`}>Party *</Label>
                      <Select value={entry.party} onValueChange={(value) => updateManualEntry(index, 'party', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select party" />
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
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor={`constituency-${index}`}>Constituency *</Label>
                      <Input
                        id={`constituency-${index}`}
                        value={entry.constituency}
                        onChange={(e) => updateManualEntry(index, 'constituency', e.target.value)}
                        placeholder="Enter constituency"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`currentPosition-${index}`}>Current Position *</Label>
                      <Input
                        id={`currentPosition-${index}`}
                        value={entry.currentPosition}
                        onChange={(e) => updateManualEntry(index, 'currentPosition', e.target.value)}
                        placeholder="Enter position"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`email-${index}`}>Email</Label>
                      <Input
                        id={`email-${index}`}
                        type="email"
                        value={entry.email}
                        onChange={(e) => updateManualEntry(index, 'email', e.target.value)}
                        placeholder="email@example.com"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`phone-${index}`}>Phone</Label>
                      <Input
                        id={`phone-${index}`}
                        type="tel"
                        value={entry.phone}
                        onChange={(e) => updateManualEntry(index, 'phone', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>
                </Card>
              ))}
              
              <Button 
                onClick={handleManualSubmit} 
                disabled={submitting}
                className="w-full"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Politicians...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create All Politicians
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {submitting && progress.total > 0 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <p className="text-blue-600 font-medium">Processing politicians...</p>
            <span className="text-blue-600 text-sm">{progress.current} / {progress.total}</span>
          </div>
          <Progress value={(progress.current / progress.total) * 100} className="w-full" />
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 whitespace-pre-line">{error}</p>
        </div>
      )}

      {success && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-600">{success}</p>
        </div>
      )}

      <div className="mt-6 text-sm text-muted-foreground">
        <p><strong>Required fields:</strong> Full Name, Party, Constituency, Current Position</p>
        <p><strong>CSV Format:</strong> Download the template and fill in your data, then upload</p>
        <p><strong>Manual Entry:</strong> Add entries one by one or use the "Add Entry" button</p>
      </div>
    </div>
  );
}
