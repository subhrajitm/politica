'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AutofillPoliticianInputSchema = z.object({
  name: z.string().min(2),
});
export type AutofillPoliticianInput = z.infer<typeof AutofillPoliticianInputSchema>;

const AutofillPoliticianOutputSchema = z.object({
  fullName: z.string().optional(),
  party: z.string().optional(),
  constituency: z.string().optional(),
  currentPosition: z.string().optional(),
  assumedOffice: z.string().optional(),
  dateOfBirth: z.string().optional(),
  placeOfBirth: z.string().optional(),
  gender: z.string().optional(),
  nationality: z.string().optional(),
  languages: z.array(z.string()).optional(),
  committees: z.array(z.string()).optional(),
  address: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  photoUrl: z.string().optional(),
  spouse: z.string().optional(),
  children: z.array(z.string()).optional(),
  twitter: z.string().optional(),
  facebook: z.string().optional(),
});
export type AutofillPoliticianOutput = z.infer<typeof AutofillPoliticianOutputSchema>;

// Prompt requiring strict JSON output
const prompt = ai.definePrompt({
  name: 'autofillPoliticianPrompt',
  input: { schema: AutofillPoliticianInputSchema },
  output: { schema: AutofillPoliticianOutputSchema },
  prompt: `You are a precise data assistant. Deeply research the named politician from reliable, neutral public sources.
Return a STRICT JSON object matching this TypeScript type (no prose):
{
  "fullName"?: string,
  "party"?: string,
  "constituency"?: string,
  "currentPosition"?: string,
  "assumedOffice"?: string,                  // Month or date string
  "dateOfBirth"?: string,                    // YYYY-MM-DD if known
  "placeOfBirth"?: string,
  "gender"?: string,
  "nationality"?: string,
  "languages"?: string[],
  "committees"?: string[],
  "address"?: string,
  "email"?: string,
  "phone"?: string,
  "website"?: string,
  "photoUrl"?: string,
  "spouse"?: string,
  "children"?: string[],
  "twitter"?: string,
  "facebook"?: string
}

If unknown, omit the field. Name: {{{name}}}`,
});

export async function autofillPoliticianByName(input: AutofillPoliticianInput): Promise<AutofillPoliticianOutput> {
  const { output } = await prompt(input);
  return output!;
}


