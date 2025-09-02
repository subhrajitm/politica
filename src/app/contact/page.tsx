
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Get in Touch</h1>
        <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
          Have a question, suggestion, or a data correction? We'd love to hear from you. Use the form below or contact us directly.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-6">
           <Card>
            <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Our official contact details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex items-start gap-4">
                    <Mail className="w-5 h-5 text-primary mt-1" />
                    <div>
                        <h3 className="font-semibold">Email</h3>
                        <p className="text-muted-foreground text-sm">For general inquiries, support, or feedback.</p>
                        <a href="mailto:contact@politifind.com" className="text-primary text-sm hover:underline">
                            contact@politifind.com
                        </a>
                    </div>
                </div>
                 <div className="flex items-start gap-4">
                    <Phone className="w-5 h-5 text-primary mt-1" />
                    <div>
                        <h3 className="font-semibold">Phone</h3>
                        <p className="text-muted-foreground text-sm">Our phone lines are open during business hours.</p>
                        <a href="tel:+911123456789" className="text-primary text-sm hover:underline">
                            +91-11-23456789
                        </a>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <MapPin className="w-5 h-5 text-primary mt-1" />
                    <div>
                        <h3 className="font-semibold">Office Address</h3>
                        <p className="text-muted-foreground text-sm">
                            PolitiFind Headquarters<br />
                            7, Lok Kalyan Marg<br />
                            New Delhi, 110011, India
                        </p>
                    </div>
                </div>
            </CardContent>
           </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
              <CardDescription>Fill out the form and we'll get back to you as soon as possible.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Your Name</Label>
                    <Input id="name" placeholder="John Doe" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Your Email</Label>
                    <Input id="email" type="email" placeholder="john.doe@example.com" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="e.g., Data Correction for..." />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Please type your message here..." rows={5} />
                </div>
                <Button type="submit" className="w-full md:w-auto">
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
