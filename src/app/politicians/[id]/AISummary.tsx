'use client';

import { useState } from 'react';
import type { Politician } from '@/lib/data';
import { generatePoliticianSummary } from '@/ai/flows/ai-powered-summaries';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

type AISummaryProps = {
  politician: Politician;
};

export default function AISummary({ politician }: AISummaryProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateSummary = async () => {
    setLoading(true);
    setError(null);
    setSummary(null);

    try {
      const workHistoryString =
        politician.positions.history && politician.positions.history.length > 0
          ? politician.positions.history
              .map(
                (job) =>
                  `${job.position} (${job.tenure}): ${job.contributions}`
              )
              .join('\n')
          : 'No work history available.';

      const result = await generatePoliticianSummary({
        name: politician.name.fullName,
        constituency: politician.constituency,
        party: politician.party,
        currentPosition: politician.positions.current.position,
        educationalBackground: politician.education.map(e => `${e.degree} from ${e.institution}`).join(', '),
        workHistory: workHistoryString,
      });

      if (result.summary) {
        setSummary(result.summary);
      } else {
        setError('The AI could not generate a summary. Please try again.');
      }
    } catch (e) {
      console.error(e);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        Get a concise, AI-generated overview of the politician's career,
        stances, and key actions.
      </p>
      <Button onClick={handleGenerateSummary} disabled={loading} size="sm">
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Wand2 className="mr-2 h-4 w-4" />
        )}
        {loading ? 'Generating...' : 'Generate Summary'}
      </Button>

      {error && (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {summary && (
        <div className="p-4 border rounded-lg bg-secondary/30 text-sm">
          <p className="whitespace-pre-wrap">{summary}</p>
        </div>
      )}
    </div>
  );
}
