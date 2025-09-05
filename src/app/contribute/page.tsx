"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function ContributePage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Contribute to OurNation</h1>
        <p className="mt-2 text-muted-foreground">
          Help us make political information more accessible and trustworthy. You can support us
          financially, share data, send suggestions, report issues, or get in touch about
          partnerships and media.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FinancialSupportCard />
        <DataContributionCard />
        <SuggestionsCard />
        <ReportIssueCard />
        <ContactPartnerCard />
      </div>
    </div>
  );
}

function FinancialSupportCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Support</CardTitle>
        <CardDescription>
          Keep the project running and independent. Your support covers hosting, data sourcing, and
          development.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        {/* Replace these placeholder links with your real funding links */}
        <Button asChild>
          <Link href="https://github.com/sponsors" target="_blank" rel="noopener noreferrer">
            Sponsor on GitHub
          </Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href="https://www.buymeacoffee.com" target="_blank" rel="noopener noreferrer">
            Buy Me a Coffee
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/contact">Other ways to support</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function DataContributionCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contribute Data</CardTitle>
        <CardDescription>
          Share datasets, corrections, or missing information on politicians, parties, or elections.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Button asChild>
          <Link href="https://github.com/" target="_blank" rel="noopener noreferrer">
            Open a PR on GitHub
          </Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/contact">Send a dataset or link</Link>
        </Button>
        <p className="text-sm text-muted-foreground">
          Tip: Please prefer open formats (CSV/JSON) and include a short data dictionary.
        </p>
      </CardContent>
    </Card>
  );
}

function SuggestionsCard() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mailtoHref = useMemo(() => {
    const to = "hello@example.com"; // Replace with your project email
    const subject = encodeURIComponent("OurNation Suggestion / Feedback");
    const bodyLines = [
      name ? `Name: ${name}` : undefined,
      email ? `Email: ${email}` : undefined,
      message ? "" : undefined,
      message,
    ].filter(Boolean);
    const body = encodeURIComponent(bodyLines.join("\n"));
    return `mailto:${to}?subject=${subject}&body=${body}`;
  }, [name, email, message]);

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
        window.location.href = mailtoHref;
        toast({ title: "Opening your email app…", description: "Send the prefilled email to submit." });
      } finally {
        setTimeout(() => setIsSubmitting(false), 600);
      }
    },
    [mailtoHref, toast]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Suggestions & Feedback</CardTitle>
        <CardDescription>
          Share feature ideas, corrections, and general feedback. We read every note.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-3">
          <Input placeholder="Your name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
          <Input type="email" placeholder="Your email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Textarea
            placeholder="Your suggestion or feedback"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            className="min-h-[120px]"
          />
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isSubmitting || !message.trim()}>
              {isSubmitting ? "Preparing…" : "Send via Email"}
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/contact">Use contact form</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function ReportIssueCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Report an Issue</CardTitle>
        <CardDescription>
          Spotted a bug, inaccurate info, or UX problem? Let us know.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="https://github.com/issues" target="_blank" rel="noopener noreferrer">
            Create a GitHub Issue
          </Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/contact">Report without GitHub</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function ContactPartnerCard() {
  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Contact & Partnerships</CardTitle>
        <CardDescription>
          For collaborations, media, research requests, or any other inquiry, reach out here.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/contact">Go to Contact</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="mailto:hello@example.com">Email us</Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href="https://github.com/" target="_blank" rel="noopener noreferrer">
            View the codebase
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}


