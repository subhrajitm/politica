
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
            <Card>
                <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>Manage general site settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="siteName">Site Name</Label>
                        <Input id="siteName" defaultValue="PolitiFind" />
                    </div>
                     <Separator />
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Content Management</h3>
                         <div className="flex items-center space-x-2">
                            <Checkbox id="requireApproval" defaultChecked />
                            <Label htmlFor="requireApproval">Require admin approval for new submissions</Label>
                        </div>
                         <div className="flex items-center space-x-2">
                            <Checkbox id="enablePublic" />
                            <Label htmlFor="enablePublic">Enable public contributions</Label>
                        </div>
                    </div>
                    <Button>Save Changes</Button>
                </CardContent>
            </Card>
        </div>
    )
}
