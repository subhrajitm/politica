import Link from 'next/link';
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import { Button } from './ui/button';

export default function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <h3 className="text-lg font-bold mb-4">PolitiFind</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Borsower Strasse 41
              <br />
              10405 Berlin, Germany
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              mail@politifind.xyz
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Landing Pages</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Landing Page</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Landing Page Corporate</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Landing Page Minimal</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Coming Soon</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">404</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">About Pages</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-primary">About Us</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Our Team</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">User Profile Modern</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">User Profile Standard</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Contact Us</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">All Components</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Job Search</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Job List</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Job List Corporate</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Job List Minimal</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Job Overview</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Job Overview Centered</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Job Overview Sidebar</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Apply for a job</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground mb-4 sm:mb-0">
            © {new Date().getFullYear()} All rights reserved
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
              <Facebook className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
              <Twitter className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
              <Instagram className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
              <Linkedin className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
