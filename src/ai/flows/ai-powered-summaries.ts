'use server';
/**
 * @fileOverview Generates AI-powered summaries of politicians.
 *
 * - generatePoliticianSummary - A function that generates a summary of a politician.
 * - GeneratePoliticianSummaryInput - The input type for the generatePoliticianSummary function.
 * - GeneratePoliticianSummaryOutput - The return type for the generatePoliticianSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePoliticianSummaryInputSchema = z.object({
  name: z.string().describe('The name of the politician.'),
  constituency: z.string().describe('The constituency of the politician.'),
  party: z.string().describe('The party affiliation of the politician.'),
  currentPosition: z.string().describe('The current position of the politician.'),
  educationalBackground: z.string().describe('The educational background of the politician.'),
  workHistory: z.string().describe('The work history of the politician, including previous positions held, tenure details, major policy initiatives, legislative contributions'),
});
export type GeneratePoliticianSummaryInput = z.infer<typeof GeneratePoliticianSummaryInputSchema>;

const GeneratePoliticianSummaryOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the politician, including their background, stances, and key actions.'),
});
export type GeneratePoliticianSummaryOutput = z.infer<typeof GeneratePoliticianSummaryOutputSchema>;

export async function generatePoliticianSummary(input: GeneratePoliticianSummaryInput): Promise<GeneratePoliticianSummaryOutput> {
  return generatePoliticianSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePoliticianSummaryPrompt',
  input: {schema: GeneratePoliticianSummaryInputSchema},
  output: {schema: GeneratePoliticianSummaryOutputSchema},
  prompt: `You are an AI assistant that provides concise summaries of politicians in India.

  Given the following information about a politician, generate a summary of their background, stances, and key actions.

  Name: {{{name}}}
  Constituency: {{{constituency}}}
  Party: {{{party}}}
  Current Position: {{{currentPosition}}}
  Educational Background: {{{educationalBackground}}}
  Work History: {{{workHistory}}}
  `,
});

const generatePoliticianSummaryFlow = ai.defineFlow(
  {
    name: 'generatePoliticianSummaryFlow',
    inputSchema: GeneratePoliticianSummaryInputSchema,
    outputSchema: GeneratePoliticianSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
