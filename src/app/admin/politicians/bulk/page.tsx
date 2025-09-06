'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PoliticianService } from '@/lib/politicianService';
import type { Politician } from '@/lib/types';
import { normalizeDate, normalizeAssumedOffice } from '@/lib/dateUtils';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Upload, Download, FileText, CheckCircle, XCircle, FileUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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
  aliases?: string;
}

interface ImportResult {
  success: boolean;
  message: string;
  data?: any;
}

export default function BulkAddPoliticiansPage() {
  const router = useRouter();
  const [csvData, setCsvData] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [previewData, setPreviewData] = useState<Partial<BulkPoliticianData>[]>([]);
  const [fileName, setFileName] = useState<string>('');

  const csvTemplate = `fullName,party,constituency,currentPosition,assumedOffice,dateOfBirth,placeOfBirth,gender,nationality,languages,committees,address,email,phone,website,photoUrl,spouse,children,twitter,facebook,aliases
John Doe,Example Party,Example Constituency,Member of Parliament,2020-01-01,1980-01-01,Example City,Male,Indian,"English, Hindi","Finance Committee, Education Committee",123 Example Street,john.doe@example.com,+91-1234567890,https://johndoe.example.com,https://example.com/photo.jpg,Jane Doe,"Child 1, Child 2",@johndoe,johndoe.official,"J. Doe, Johnny"
Jane Smith,Another Party,Another Constituency,Minister of State,2019-05-15,1975-03-20,Another City,Female,Indian,"English, Tamil","Health Committee",456 Another Street,jane.smith@example.com,+91-9876543210,https://janesmith.example.com,https://example.com/jane.jpg,John Smith,"Son, Daughter",@janesmith,janesmith.official,"J. Smith"`;

  const jsonTemplate = [
    {
      "fullName": "John Doe",
      "party": "Example Party",
      "constituency": "Example Constituency, State",
      "currentPosition": "Member of Parliament",
      "assumedOffice": "2020-01-01",
      "dateOfBirth": "1980-01-01",
      "placeOfBirth": "Example City, State",
      "gender": "Male",
      "nationality": "Indian",
      "languages": "English, Hindi",
      "committees": "Finance Committee, Education Committee",
      "address": "123 Example Street, Example City, State",
      "email": "john.doe@example.com",
      "phone": "+91-1234567890",
      "website": "https://johndoe.example.com",
      "photoUrl": "https://example.com/photo.jpg",
      "spouse": "Jane Doe",
      "children": "Child 1, Child 2",
      "twitter": "@johndoe",
      "facebook": "johndoe.official",
      "aliases": "J. Doe, Johnny"
    }
  ];

  const parseCSV = (csv: string): Partial<BulkPoliticianData>[] => {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data: Partial<BulkPoliticianData>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const entry: any = {};
      
      headers.forEach((header, index) => {
        entry[header] = values[index] || '';
      });
      
      data.push(entry as Partial<BulkPoliticianData>);
    }

    return data;
  };

  const parseJSON = (jsonText: string): Partial<BulkPoliticianData>[] => {
    try {
      const parsed = JSON.parse(jsonText);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (error) {
      throw new Error('Invalid JSON format: ' + (error as Error).message);
    }
  };

  // Helper function to check if a value is effectively empty (handles placeholder text)
  const isEmptyValue = (value: string | undefined): boolean => {
    if (!value) return true;
    const trimmed = value.trim().toLowerCase();
    return trimmed === '' || 
           trimmed === 'not available' || 
           trimmed === 'not specified' || 
           trimmed === 'not specified in available data' ||
           trimmed === 'not available in current data';
  };

  const validateData = (data: Partial<BulkPoliticianData>[]): ImportResult[] => {
    const results: ImportResult[] = [];
    
    data.forEach((politician, index) => {
    const errors: string[] = [];
    
      if (isEmptyValue(politician.fullName)) {
        errors.push('Full Name is required');
      }
      if (isEmptyValue(politician.party)) {
        errors.push('Party is required');
      }
      // Make constituency optional - some politicians may not have specific constituency
      // if (isEmptyValue(politician.constituency)) {
      //   errors.push('Constituency is required');
      // }
      if (isEmptyValue(politician.currentPosition)) {
        errors.push('Current Position is required');
      }

      if (errors.length > 0) {
        results.push({
          success: false,
          message: `Row ${index + 1}: ${errors.join(', ')}`,
          data: politician
        });
      } else {
        results.push({
          success: true,
          message: `Row ${index + 1}: Valid`,
          data: politician
        });
      }
    });

    return results;
  };

  // Helper function to parse languages (handles both comma and semicolon separators)
  const parseLanguages = (languages: string | undefined): string[] => {
    if (!languages || isEmptyValue(languages)) return [];
    // Handle both comma and semicolon separators
    return languages.split(/[,;]/).map(l => l.trim()).filter(Boolean);
  };

  // Helper function to parse comma-separated values
  const parseCommaSeparated = (value: string | undefined): string[] => {
    if (!value || isEmptyValue(value)) return [];
    return value.split(',').map(v => v.trim()).filter(Boolean);
  };

  // Helper function to get clean value or undefined
  const getCleanValue = (value: string | undefined): string | undefined => {
    if (!value || isEmptyValue(value)) return undefined;
    return value.trim();
  };

  const convertToPolitician = (data: Partial<BulkPoliticianData>): Omit<Politician, 'id'> => {
    return {
      name: {
        fullName: data.fullName || '',
        aliases: parseCommaSeparated(data.aliases),
      },
      personalDetails: {
        dateOfBirth: normalizeDate(data.dateOfBirth),
        placeOfBirth: data.placeOfBirth || '',
        gender: data.gender || 'Unknown',
        nationality: data.nationality || '',
        languages: parseLanguages(data.languages),
      },
      contact: {
        address: data.address || '',
        email: getCleanValue(data.email) || '',
        phone: getCleanValue(data.phone) || '',
        website: getCleanValue(data.website),
      },
      photoUrl: data.photoUrl || '',
      family: {
        spouse: getCleanValue(data.spouse),
        children: parseCommaSeparated(data.children),
      },
      education: [],
      party: data.party || '',
      constituency: isEmptyValue(data.constituency) ? 'Not specified' : data.constituency || '',
      positions: {
        current: {
          position: data.currentPosition || '',
          assumedOffice: normalizeAssumedOffice(data.assumedOffice),
          committees: parseCommaSeparated(data.committees),
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
        topContributors: []
      },
      relationships: [],
      newsMentions: [],
      speeches: [],
      socialMedia: {
        twitter: getCleanValue(data.twitter),
        facebook: getCleanValue(data.facebook)
      }
    };
  };

  const handlePreview = () => {
    try {
      let parsed: Partial<BulkPoliticianData>[];
      
      // Try to parse as JSON first, then CSV
      try {
        parsed = parseJSON(csvData);
      } catch {
        parsed = parseCSV(csvData);
      }
      
      const validated = validateData(parsed);
      setPreviewData(parsed);
      setResults(validated);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Invalid data format',
        variant: 'destructive',
      });
    }
  };

  const handleImport = async () => {
    if (results.some(r => !r.success)) {
      toast({
        title: 'Validation Error',
        description: 'Please fix validation errors before importing',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      setProgress(0);
      
      const validPoliticians = results
        .filter(r => r.success)
        .map(r => convertToPolitician(r.data as Partial<BulkPoliticianData>));

      // Import in batches to avoid overwhelming the database
      const batchSize = 5;
      const batches = [];
      
      for (let i = 0; i < validPoliticians.length; i += batchSize) {
        batches.push(validPoliticians.slice(i, i + batchSize));
      }

      let imported = 0;
      for (const batch of batches) {
        for (const politician of batch) {
          await PoliticianService.createPolitician(politician);
          imported++;
          setProgress((imported / validPoliticians.length) * 100);
        }
      }

      toast({
        title: 'Success',
        description: `Successfully imported ${imported} politicians`,
      });

          router.push('/admin/politicians');
    } catch (error) {
      console.error('Error importing politicians:', error);
      toast({
        title: 'Error',
        description: 'Failed to import politicians',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadCSVTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'politicians_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadJSONTemplate = () => {
    const jsonString = JSON.stringify(jsonTemplate, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'politicians_template.json';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if it's a CSV or JSON file
    const isCSV = file.name.toLowerCase().endsWith('.csv');
    const isJSON = file.name.toLowerCase().endsWith('.json');
    
    if (!isCSV && !isJSON) {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload a CSV or JSON file',
        variant: 'destructive',
      });
      return;
    }

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCsvData(content);
      
      // Auto-preview after file upload
      try {
        let parsed: Partial<BulkPoliticianData>[];
        
        if (isCSV) {
          parsed = parseCSV(content);
          } else {
          parsed = parseJSON(content);
        }
        
        const validated = validateData(parsed);
        setPreviewData(parsed);
        setResults(validated);
        
        toast({
          title: 'File Uploaded',
          description: `Successfully loaded ${parsed.length} politicians from ${file.name}`,
        });
      } catch (error) {
        const fileType = isCSV ? 'CSV' : 'JSON';
        toast({
          title: 'Error',
          description: `Invalid ${fileType} format in uploaded file: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
  };

  const successCount = results.filter(r => r.success).length;
  const errorCount = results.filter(r => !r.success).length;

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
        <h1 className="text-3xl font-bold">Bulk Add Politicians</h1>
          <p className="text-muted-foreground">
            Import multiple politicians from CSV or JSON data
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Data Input */}
          <Card>
            <CardHeader>
            <CardTitle>Import Data</CardTitle>
            <CardDescription>
              Upload a CSV or JSON file, or paste your data below
            </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-2">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={downloadCSVTemplate}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download CSV Template
                </Button>
                <Button
                  variant="outline"
                  onClick={downloadJSONTemplate}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download JSON Template
                </Button>
              </div>
              <Button
                variant="outline"
                onClick={handlePreview}
                disabled={!csvData.trim()}
                className="w-full"
              >
                <FileText className="w-4 h-4 mr-2" />
                Preview
              </Button>
              </div>
              
            {/* File Upload Section */}
            <div className="space-y-2">
              <Label htmlFor="fileUpload">Upload CSV or JSON File</Label>
              <div className="flex items-center space-x-2">
                <input
                  id="fileUpload"
                  type="file"
                  accept=".csv,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              <Button 
                  variant="outline"
                  onClick={() => document.getElementById('fileUpload')?.click()}
                  className="flex-1"
                >
                  <FileUp className="w-4 h-4 mr-2" />
                  Choose CSV/JSON File
                </Button>
                {fileName && (
                  <span className="text-sm text-muted-foreground">
                    {fileName}
                  </span>
                )}
              </div>
                    </div>
                    
                    <div>
              <Label htmlFor="csvData">CSV or JSON Data</Label>
              <Textarea
                id="csvData"
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                placeholder="Paste your CSV or JSON data here..."
                rows={15}
                className="font-mono text-sm"
                      />
                    </div>
            </CardContent>
          </Card>

        {/* Preview and Results */}
        <Card>
          <CardHeader>
            <CardTitle>Preview & Validation</CardTitle>
            <CardDescription>
              Review your data before importing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.length > 0 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      {successCount} valid entries
                    </AlertDescription>
                  </Alert>
                  {errorCount > 0 && (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>
                        {errorCount} errors
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {errorCount > 0 && (
                  <div className="space-y-2">
                    <Label>Validation Errors</Label>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {results
                        .filter(r => !r.success)
                        .map((result, index) => (
                          <Alert key={index} variant="destructive" className="py-2">
                            <AlertDescription className="text-xs">
                              {result.message}
                            </AlertDescription>
                          </Alert>
                        ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Preview (first 3 entries)</Label>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {previewData.slice(0, 3).map((politician, index) => (
                      <div key={index} className="p-3 border rounded-lg text-sm">
                        <div className="font-semibold">{politician.fullName}</div>
                        <div className="text-muted-foreground">
                          {politician.party} • {politician.currentPosition}
                        </div>
                        <div className="text-muted-foreground">
                          {politician.constituency}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {loading && (
                  <div className="space-y-2">
                    <Label>Import Progress</Label>
                    <Progress value={progress} className="w-full" />
                    <p className="text-sm text-muted-foreground">
                      {Math.round(progress)}% complete
                    </p>
                  </div>
                )}

              <Button
                  onClick={handleImport}
                  disabled={loading || errorCount > 0 || successCount === 0}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {loading ? 'Importing...' : `Import ${successCount} Politicians`}
              </Button>
              </>
            )}

            {results.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Upload or paste your data to see a preview</p>
            </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}