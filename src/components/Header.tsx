import Link from 'next/link';
import { Landmark } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-card/95 backdrop-blur-sm border-b sticky top-0 z-20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-headline font-bold"
          >
            <div className="p-2 bg-primary text-primary-foreground rounded-lg">
              <Landmark className="h-5 w-5" />
            </div>
            <span className="text-primary">Netaneta</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
