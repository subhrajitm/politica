import Link from 'next/link';
import { Facebook, Twitter, Github, Dribbble } from 'lucide-react';
import { Button } from './ui/button';
import { LogoIcon } from '@/lib/icons';

export default function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-8">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 text-xl font-bold">
              <LogoIcon className="w-7 h-7 text-primary" />
              PolitiFind
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Borsower Strasse 41 <br />
              10405 Berlin, Germany
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              mail@politifind.xyz
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-primary">About Us</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Our Team</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Blog</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Contact Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Platform</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/politicians" className="text-muted-foreground hover:text-primary">Find Politicians</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Contribute</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">User Profiles</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">API Access</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Resources</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Help Center</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
               <li><Link href="#" className="text-muted-foreground hover:text-primary">Data Sources</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Impressum</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Disclaimer</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground mb-4 sm:mb-0">
            © {new Date().getFullYear()} PolitiFind. All rights reserved.
          </p>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
              <Twitter className="w-5 h-5" />
            </Button>
             <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
              <Facebook className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
              <Github className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
