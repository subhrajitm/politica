
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { SettingsService, Setting } from '@/lib/settingsService';

export default function SettingsPage() {
    const [settings, setSettings] = useState<Setting[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        site_name: '',
        site_description: '',
        contact_email: '',
        require_approval: false,
        enable_public_contributions: false
    });
    const { toast } = useToast();

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const allSettings = await SettingsService.getAllSettings();
            setSettings(allSettings);
            
            // Convert settings array to form data
            const formDataObj: any = {};
            allSettings.forEach(setting => {
                if (setting.key === 'require_approval' || setting.key === 'enable_public_contributions') {
                    formDataObj[setting.key] = setting.value === 'true';
                } else {
                    formDataObj[setting.key] = setting.value;
                }
            });
            setFormData(formDataObj);
        } catch (error) {
            console.error('Error loading settings:', error);
            toast({
                title: "Error",
                description: "Failed to load settings",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (key: string, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const updates: Record<string, string> = {};
            
            // Convert form data back to string format for database
            Object.entries(formData).forEach(([key, value]) => {
                updates[key] = typeof value === 'boolean' ? value.toString() : value;
            });

            await SettingsService.updateMultipleSettings(updates);
            
            toast({
                title: "Success",
                description: "Settings saved successfully",
            });
            
            // Reload settings to ensure consistency
            await loadSettings();
        } catch (error) {
            console.error('Error saving settings:', error);
            toast({
                title: "Error",
                description: "Failed to save settings",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                <div className="flex items-center justify-center h-64">
                    <div className="text-muted-foreground">Loading settings...</div>
                </div>
            </div>
        );
    }

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
                        <Input 
                            id="siteName" 
                            value={formData.site_name || ''}
                            onChange={(e) => handleInputChange('site_name', e.target.value)}
                            placeholder="Enter site name"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="siteDescription">Site Description</Label>
                        <Input 
                            id="siteDescription" 
                            value={formData.site_description || ''}
                            onChange={(e) => handleInputChange('site_description', e.target.value)}
                            placeholder="Enter site description"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="contactEmail">Contact Email</Label>
                        <Input 
                            id="contactEmail" 
                            type="email"
                            value={formData.contact_email || ''}
                            onChange={(e) => handleInputChange('contact_email', e.target.value)}
                            placeholder="Enter contact email"
                        />
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Content Management</h3>
                        <div className="flex items-center space-x-2">
                            <Checkbox 
                                id="requireApproval" 
                                checked={formData.require_approval || false}
                                onCheckedChange={(checked) => 
                                    handleInputChange('require_approval', checked === true)
                                }
                            />
                            <Label htmlFor="requireApproval">Require admin approval for new submissions</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox 
                                id="enablePublic" 
                                checked={formData.enable_public_contributions || false}
                                onCheckedChange={(checked) => 
                                    handleInputChange('enable_public_contributions', checked === true)
                                }
                            />
                            <Label htmlFor="enablePublic">Enable public contributions</Label>
                        </div>
                    </div>
                    
                    <Button 
                        onClick={handleSave} 
                        disabled={saving}
                        className="w-full"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
