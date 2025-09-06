'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Upload, Download, FileText, CheckCircle, XCircle } from 'lucide-react';
import { PoliticalPartyService } from '@/lib/politicalPartyService';
import { PoliticalParty } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

interface ImportResult {
  success: boolean;
  message: string;
  data?: any;
}

export default function SimpleBulkImportPartiesPage() {
  const router = useRouter();
  const [csvData, setCsvData] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [previewData, setPreviewData] = useState<Partial<PoliticalParty>[]>([]);

  const csvTemplate = `name,nameLocal,countryCode,countryName,ideology,politicalPosition,foundedYear,currentLeader,headquarters,website,logoUrl,description,membershipCount,isRulingParty,isParliamentary,isRegional,regionState
Democratic Party,,US,United States,Social Democratic,Centre-left,1828,Joe Biden,Washington D.C.,https://democrats.org,,,15000000,true,true,false,
Republican Party,,US,United States,Conservative,Centre-right,1854,Donald Trump,Washington D.C.,https://gop.com,,,14000000,false,true,false,
Labour Party,,GB,United Kingdom,Social Democratic,Centre-left,1900,Keir Starmer,London,https://labour.org.uk,,,500000,false,true,false,
Conservative Party,,GB,United Kingdom,Conservative,Centre-right,1834,Rishi Sunak,London,https://conservatives.com,,,200000,true,true,false,`;

  const parseCSV = (csv: string): Partial<PoliticalParty>[] => {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data: Partial<PoliticalParty>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: any = {};

      headers.forEach((header, index) => {
        const value = values[index] || '';
        
        // Convert boolean fields
        if (['isRulingParty', 'isParliamentary', 'isRegional'].includes(header)) {
          row[header] = value.toLowerCase() === 'true';
        }
        // Convert number fields
        else if (['foundedYear', 'membershipCount'].includes(header)) {
          row[header] = value ? parseInt(value) : undefined;
        }
        // Keep string fields as is
        else {
          row[header] = value || undefined;
        }
      });

      data.push(row);
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
      const parsed = parseCSV(csvData);
      const validated = validateData(parsed);
      setPreviewData(parsed);
      setResults(validated);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Invalid CSV format',
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

      // Import in batches to avoid overwhelming the database
      const batchSize = 10;
      const batches = [];
      
      for (let i = 0; i < validParties.length; i += batchSize) {
        batches.push(validParties.slice(i, i + batchSize));
      }

      let imported = 0;
      for (const batch of batches) {
        await PoliticalPartyService.bulkImportParties(batch);
        imported += batch.length;
        setProgress((imported / validParties.length) * 100);
      }

      toast({
        title: 'Success',
        description: `Successfully imported ${imported} political parties`,
      });

      router.push('/admin/parties');
    } catch (error) {
      console.error('Error importing parties:', error);
      toast({
        title: 'Error',
        description: 'Failed to import political parties',
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
          <h1 className="text-3xl font-bold">Bulk Import Political Parties (Simple)</h1>
          <p className="text-muted-foreground">
            Import multiple political parties from CSV data - No auth required for testing
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CSV Input */}
        <Card>
          <CardHeader>
            <CardTitle>CSV Data</CardTitle>
            <CardDescription>
              Paste your CSV data below or use the template
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
              <li>Paste your CSV data and click "Preview" to validate</li>
              <li>Fix any validation errors before importing</li>
              <li>Click "Import" to add all valid parties to the database</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
