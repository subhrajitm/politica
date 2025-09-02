import Link from 'next/link';
import { Facebook, Twitter, Github, Dribbble } from 'lucide-react';
import { Button } from './ui/button';
import { LogoIcon } from '@/lib/icons';

export default function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-8">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-3 text-lg font-bold">
              <LogoIcon className="w-6 h-6 text-primary" />
              PolitiFind
            </Link>
            <p className="text-xs text-muted-foreground max-w-xs">
              Borsower Strasse 41 <br />
              10405 Berlin, Germany
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              mail@politifind.xyz
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-foreground text-sm">Company</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="#" className="text-muted-foreground hover:text-primary">About Us</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Our Team</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Blog</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Contact Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3 text-foreground text-sm">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/politicians" className="text-muted-foreground hover:text-primary">Find Politicians</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Contribute</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">User Profiles</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">API Access</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-foreground text-sm">Resources</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Help Center</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
               <li><Link href="#" className="text-muted-foreground hover:text-primary">Data Sources</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-foreground text-sm">Legal</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Impressum</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Disclaimer</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t flex flex-col sm:flex-row justify-between items-center">
          <p className="text-xs text-muted-foreground mb-4 sm:mb-0">
            © {new Date().getFullYear()} PolitiFind. All rights reserved.
          </p>
          <div className="flex gap-0.5">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary h-8 w-8">
              <Twitter className="w-4 h-4" />
            </Button>
             <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary h-8 w-8">
              <Facebook className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary h-8 w-8">
              <Github className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
