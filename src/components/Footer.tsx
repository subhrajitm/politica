
import Link from 'next/link';
import { Facebook, Twitter, Github } from 'lucide-react';
import { Button } from './ui/button';
import { LogoIcon } from '@/lib/icons';
import { useSettings } from '@/hooks/use-settings';

export default function Footer() {
  const { siteName } = useSettings();
  
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-4 md:py-6">
        {/* Mobile: Single column, Desktop: Multi-column */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 md:gap-8 mb-4 md:mb-6">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-2 text-sm md:text-base font-bold">
              <LogoIcon className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              {siteName || 'OurNation'}
            </Link>
            <p className="text-xs text-muted-foreground max-w-xs">
              A comprehensive directory of public officials in India.
            </p>
          </div>

          {/* Mobile: Show only essential links in a compact grid */}
          <div className="md:hidden">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-1 text-foreground text-xs">Platform</h4>
                <ul className="space-y-1 text-xs">
                  <li><Link href="/politicians" className="text-muted-foreground hover:text-primary">Find Politicians</Link></li>
                  <li><Link href="/contribute" className="text-muted-foreground hover:text-primary">Contribute</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-1 text-foreground text-xs">Support</h4>
                <ul className="space-y-1 text-xs">
                  <li><Link href="/contact" className="text-muted-foreground hover:text-primary">Contact</Link></li>
                  <li><Link href="#" className="text-muted-foreground hover:text-primary">Help</Link></li>
                  <li><Link href="#" className="text-muted-foreground hover:text-primary">Privacy</Link></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Desktop: Full sections */}
          <div className="hidden md:block">
            <h4 className="font-semibold mb-2 text-foreground text-sm">Company</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link href="#" className="text-muted-foreground hover:text-primary">About Us</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Our Team</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Blog</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary">Contact Us</Link></li>
            </ul>
          </div>
          
          <div className="hidden md:block">
            <h4 className="font-semibold mb-2 text-foreground text-sm">Platform</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link href="/politicians" className="text-muted-foreground hover:text-primary">Find Politicians</Link></li>
              <li><Link href="/browse/countries" className="text-muted-foreground hover:text-primary">Browse by Country</Link></li>
              <li><Link href="/browse/map" className="text-muted-foreground hover:text-primary">Browse by Map</Link></li>
              <li><Link href="/contribute" className="text-muted-foreground hover:text-primary">Contribute</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">API Access</Link></li>
            </ul>
          </div>

          <div className="hidden md:block">
            <h4 className="font-semibold mb-2 text-foreground text-sm">Resources</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Help Center</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Data Sources</Link></li>
            </ul>
          </div>

          <div className="hidden md:block">
            <h4 className="font-semibold mb-2 text-foreground text-sm">Legal</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Impressum</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Disclaimer</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            © {new Date().getFullYear()} {siteName || 'OurNation'}. All rights reserved.
          </p>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary h-7 w-7 md:h-8 md:w-8">
              <Twitter className="w-3 h-3 md:w-4 md:h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary h-7 w-7 md:h-8 md:w-8">
              <Facebook className="w-3 h-3 md:w-4 md:h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary h-7 w-7 md:h-8 md:w-8">
              <Github className="w-3 h-3 md:w-4 md:h-4" />
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
