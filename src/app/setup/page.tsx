'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2, Database, Users, FileText } from 'lucide-react';

interface SetupStatus {
  database: boolean;
  tables: boolean;
  data: boolean;
}

export default function SetupPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<SetupStatus>({
    database: false,
    tables: false,
    data: false
  });
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const checkDatabase = async () => {
    try {
      addLog('Checking database connection...');
      const response = await fetch('/api/test-db');
      const result = await response.json();
      
      if (result.success) {
        setStatus(prev => ({ ...prev, database: true }));
        addLog('✅ Database connection successful');
        return true;
      } else {
        addLog(`❌ Database connection failed: ${result.error}`);
        setError(result.error);
        return false;
      }
    } catch (err) {
      addLog(`❌ Database check error: ${err}`);
      setError('Failed to connect to database');
      return false;
    }
  };

  const checkTables = async () => {
    try {
      addLog('Checking if tables exist...');
      const response = await fetch('/api/setup-tables');
      const result = await response.json();
      
      if (result.success) {
        const tablesExist = result.tables.political_parties.exists && result.tables.party_affiliations.exists;
        setStatus(prev => ({ ...prev, tables: tablesExist }));
        
        if (tablesExist) {
          addLog('✅ Tables exist');
          return true;
        } else {
          addLog('❌ Tables missing');
          return false;
        }
      } else {
        addLog(`❌ Table check failed: ${result.error}`);
        setError(result.error);
        return false;
      }
    } catch (err) {
      addLog(`❌ Table check error: ${err}`);
      setError('Failed to check tables');
      return false;
    }
  };

  const createTables = async () => {
    try {
      addLog('Creating tables...');
      const response = await fetch('/api/setup-tables', { method: 'POST' });
      const result = await response.json();
      
      if (result.success) {
        setStatus(prev => ({ ...prev, tables: true }));
        addLog('✅ Tables created successfully');
        return true;
      } else {
        addLog(`❌ Table creation failed: ${result.error}`);
        setError(result.error);
        return false;
      }
    } catch (err) {
      addLog(`❌ Table creation error: ${err}`);
      setError('Failed to create tables');
      return false;
    }
  };

  const importSampleData = async () => {
    try {
      addLog('Importing sample data...');
      
      // Sample data
      const sampleParties = [
        {
          name: "Democratic Party",
          countryCode: "US",
          countryName: "United States",
          ideology: "Social Democratic",
          politicalPosition: "Centre-left",
          foundedYear: 1828,
          currentLeader: "Joe Biden",
          headquarters: "Washington, D.C.",
          website: "https://democrats.org",
          isRulingParty: true,
          isParliamentary: true,
          isRegional: false
        },
        {
          name: "Republican Party",
          countryCode: "US",
          countryName: "United States",
          ideology: "Conservative",
          politicalPosition: "Centre-right",
          foundedYear: 1854,
          currentLeader: "Donald Trump",
          headquarters: "Washington, D.C.",
          website: "https://gop.com",
          isRulingParty: false,
          isParliamentary: true,
          isRegional: false
        },
        {
          name: "Labour Party",
          countryCode: "GB",
          countryName: "United Kingdom",
          ideology: "Social Democratic",
          politicalPosition: "Centre-left",
          foundedYear: 1900,
          currentLeader: "Keir Starmer",
          headquarters: "London",
          website: "https://labour.org.uk",
          isRulingParty: false,
          isParliamentary: true,
          isRegional: false
        }
      ];

      const response = await fetch('/api/parties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sampleParties)
      });

      if (response.ok) {
        setStatus(prev => ({ ...prev, data: true }));
        addLog('✅ Sample data imported successfully');
        return true;
      } else {
        const result = await response.json();
        addLog(`❌ Data import failed: ${result.error}`);
        setError(result.error);
        return false;
      }
    } catch (err) {
      addLog(`❌ Data import error: ${err}`);
      setError('Failed to import data');
      return false;
    }
  };

  const runFullSetup = async () => {
    setLoading(true);
    setError(null);
    setLogs([]);
    
    try {
      // Step 1: Check database
      const dbOk = await checkDatabase();
      if (!dbOk) return;

      // Step 2: Check tables
      const tablesOk = await checkTables();
      if (!tablesOk) {
        // Create tables if they don't exist
        const created = await createTables();
        if (!created) return;
      }

      // Step 3: Import sample data
      await importSampleData();

      addLog('🎉 Setup completed successfully!');
    } catch (err) {
      addLog(`❌ Setup failed: ${err}`);
      setError('Setup failed');
    } finally {
      setLoading(false);
    }
  };

  const StatusIcon = ({ status }: { status: boolean }) => 
    status ? <CheckCircle className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-600" />;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Political Parties Setup</h1>
        <p className="text-muted-foreground text-lg">
          Set up the political parties system for your application
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Connection</CardTitle>
            <StatusIcon status={status.database} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Database</div>
            <p className="text-xs text-muted-foreground">
              {status.database ? 'Connected' : 'Not connected'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tables</CardTitle>
            <StatusIcon status={status.tables} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Tables</div>
            <p className="text-xs text-muted-foreground">
              {status.tables ? 'Created' : 'Missing'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sample Data</CardTitle>
            <StatusIcon status={status.data} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Data</div>
            <p className="text-xs text-muted-foreground">
              {status.data ? 'Imported' : 'Not imported'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Setup Actions</CardTitle>
          <CardDescription>
            Run the full setup process or individual steps
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runFullSetup} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running Setup...
              </>
            ) : (
              <>
                <Database className="w-4 h-4 mr-2" />
                Run Full Setup
              </>
            )}
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Button 
              variant="outline" 
              onClick={checkDatabase}
              disabled={loading}
            >
              <Database className="w-4 h-4 mr-2" />
              Check Database
            </Button>
            <Button 
              variant="outline" 
              onClick={checkTables}
              disabled={loading}
            >
              <FileText className="w-4 h-4 mr-2" />
              Check Tables
            </Button>
            <Button 
              variant="outline" 
              onClick={importSampleData}
              disabled={loading}
            >
              <Users className="w-4 h-4 mr-2" />
              Import Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Setup Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg max-h-64 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="text-sm font-mono mb-1">
                  {log}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {status.database && status.tables && status.data && (
        <Alert className="mt-6">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            🎉 Setup completed successfully! You can now access the political parties system.
            <br />
            <a href="/admin/parties/bulk-simple" className="underline">Go to Bulk Import</a> | 
            <a href="/parties" className="underline ml-2">View Parties</a>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
