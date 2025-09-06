'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Upload, Download, FileText, CheckCircle, XCircle, FileUp } from 'lucide-react';
import { PoliticalPartyService } from '@/lib/politicalPartyService';
import { PoliticalParty } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

interface ImportResult {
  success: boolean;
  message: string;
  data?: any;
}

export default function BulkImportPartiesPage() {
  const router = useRouter();
  const [csvData, setCsvData] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [previewData, setPreviewData] = useState<Partial<PoliticalParty>[]>([]);
  const [fileName, setFileName] = useState<string>('');

  const csvTemplate = `name,nameLocal,countryCode,countryName,ideology,politicalPosition,foundedYear,currentLeader,headquarters,website,logoUrl,description,membershipCount,isRulingParty,isParliamentary,isRegional,regionState
Democratic Party,,US,United States,Social Democratic,Centre-left,1828,Joe Biden,Washington D.C.,https://democrats.org,,,15000000,true,true,false,
Republican Party,,US,United States,Conservative,Centre-right,1854,Donald Trump,Washington D.C.,https://gop.com,,,14000000,false,true,false,
Labour Party,,GB,United Kingdom,Social Democratic,Centre-left,1900,Keir Starmer,London,https://labour.org.uk,,,500000,false,true,false,
Conservative Party,,GB,United Kingdom,Conservative,Centre-right,1834,Rishi Sunak,London,https://conservatives.com,,,200000,true,true,false,`;

  const parseCSV = (csv: string): Partial<PoliticalParty>[] => {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const data: Partial<PoliticalParty>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines

      // Simple CSV parsing - split by comma and handle empty values
      const values = line.split(',').map(v => v.trim());
      const row: any = {};

      headers.forEach((header, index) => {
        const value = values[index] || '';
        
        // Skip empty values
        if (!value) {
          row[header] = undefined;
          return;
        }
        
        // Convert boolean fields
        if (['isRulingParty', 'isParliamentary', 'isRegional'].includes(header)) {
          row[header] = value.toLowerCase() === 'true';
        }
        // Convert number fields
        else if (['foundedYear', 'membershipCount'].includes(header)) {
          const numValue = parseInt(value);
          row[header] = isNaN(numValue) ? undefined : numValue;
        }
        // Keep string fields as is
        else {
          row[header] = value;
        }
      });

      // Only add rows that have at least a name
      if (row.name) {
        data.push(row);
      }
    }

    return data;
  };

  const validateData = (data: Partial<PoliticalParty>[]): ImportResult[] => {
    const results: ImportResult[] = [];
    
    data.forEach((party, index) => {
      const errors: string[] = [];
      
      if (!party.name) errors.push('Name is required');
      if (!party.countryCode) errors.push('Country code is required');
      if (!party.countryName) errors.push('Country name is required');
      
      if (party.foundedYear && (party.foundedYear < 1000 || party.foundedYear > new Date().getFullYear())) {
        errors.push('Invalid founded year');
      }
      
      if (party.membershipCount && party.membershipCount < 0) {
        errors.push('Invalid membership count');
      }

      results.push({
        success: errors.length === 0,
        message: errors.length === 0 ? 'Valid' : errors.join(', '),
        data: party
      });
    });

    return results;
  };

  const handlePreview = () => {
    try {
      console.log('Parsing CSV data:', csvData);
      const parsed = parseCSV(csvData);
      console.log('Parsed data:', parsed);
      const validated = validateData(parsed);
      console.log('Validated data:', validated);
      setPreviewData(parsed);
      setResults(validated);
      
      toast({
        title: 'Preview Complete',
        description: `Parsed ${parsed.length} parties, ${validated.filter(r => r.success).length} valid`,
      });
    } catch (error) {
      console.error('Preview error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Invalid CSV format';
      toast({
        title: 'Preview Error',
        description: errorMessage,
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
      
      const validParties = results
        .filter(r => r.success)
        .map(r => r.data as Omit<PoliticalParty, 'id' | 'createdAt' | 'updatedAt'>);

      console.log('Starting import of', validParties.length, 'parties');
      console.log('Parties to import:', validParties);

      if (validParties.length === 0) {
        throw new Error('No valid parties to import');
      }

      // Import in batches to avoid overwhelming the database
      const batchSize = 5; // Reduced batch size for better error handling
      const batches = [];
      
      for (let i = 0; i < validParties.length; i += batchSize) {
        batches.push(validParties.slice(i, i + batchSize));
      }

      let totalImported = 0;
      let totalErrors = 0;
      
      for (const batch of batches) {
        console.log('Importing batch:', batch);
        try {
          const result = await PoliticalPartyService.bulkImportParties(batch);
          totalImported += result.length;
          setProgress((totalImported / validParties.length) * 100);
        } catch (error) {
          console.error('Batch import error:', error);
          totalErrors += batch.length;
        }
      }

      if (totalImported > 0) {
        toast({
          title: 'Import Complete',
          description: `Successfully processed ${totalImported} parties${totalErrors > 0 ? `, ${totalErrors} had errors` : ''}`,
        });
      } else {
        throw new Error('No parties were successfully imported');
      }

      router.push('/admin/parties');
    } catch (error) {
      console.error('Error importing parties:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: 'Import Error',
        description: `Failed to import political parties: ${errorMessage}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'political_parties_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if it's a CSV file
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload a CSV file',
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
        const parsed = parseCSV(content);
        const validated = validateData(parsed);
        setPreviewData(parsed);
        setResults(validated);
        
        toast({
          title: 'File Uploaded',
          description: `Successfully loaded ${parsed.length} parties from ${file.name}`,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Invalid CSV format in uploaded file',
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
          <h1 className="text-3xl font-bold">Bulk Import Political Parties</h1>
          <p className="text-muted-foreground">
            Import multiple political parties from CSV data
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CSV Input */}
        <Card>
          <CardHeader>
            <CardTitle>CSV Data</CardTitle>
            <CardDescription>
              Upload a CSV file or paste your CSV data below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={downloadTemplate}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Template
              </Button>
              <Button
                variant="outline"
                onClick={handlePreview}
                disabled={!csvData.trim()}
              >
                <FileText className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </div>

            {/* File Upload Section */}
            <div className="space-y-2">
              <Label htmlFor="fileUpload">Upload CSV File</Label>
              <div className="flex items-center space-x-2">
                <input
                  id="fileUpload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('fileUpload')?.click()}
                  className="flex-1"
                >
                  <FileUp className="w-4 h-4 mr-2" />
                  Choose CSV File
                </Button>
                {fileName && (
                  <span className="text-sm text-muted-foreground">
                    {fileName}
                  </span>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="csvData">CSV Data</Label>
              <Textarea
                id="csvData"
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                placeholder="Paste your CSV data here..."
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

                {loading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Importing...</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                )}

                <div className="max-h-96 overflow-y-auto space-y-2">
                  {results.map((result, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        result.success
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        {result.success ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span className="font-medium">
                          {result.data?.name || `Row ${index + 1}`}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {result.message}
                      </p>
                    </div>
                  ))}
                </div>

                {successCount > 0 && (
                  <Button
                    onClick={handleImport}
                    disabled={loading || errorCount > 0}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {loading ? 'Importing...' : `Import ${successCount} Parties`}
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <ol className="list-decimal list-inside space-y-2">
              <li>Download the CSV template to see the required format</li>
              <li>Fill in your political party data following the template structure</li>
              <li>Required fields: name, countryCode, countryName</li>
              <li>Boolean fields (isRulingParty, isParliamentary, isRegional) should be "true" or "false"</li>
              <li>Numeric fields (foundedYear, membershipCount) should be numbers only</li>
              <li>Upload your CSV file using "Choose CSV File" or paste your CSV data in the text area</li>
              <li>Click "Preview" to validate your data (automatic for file uploads)</li>
              <li>Fix any validation errors before importing</li>
              <li>Click "Import" to add all valid parties to the database</li>
              <li><strong>Note:</strong> If a party with the same name and country already exists, it will be updated instead of creating a duplicate</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}