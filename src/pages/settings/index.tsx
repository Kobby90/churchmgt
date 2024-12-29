import React from 'react';
import { useSettings } from '@/contexts/settings';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Settings as SettingsIcon, Palette, Building, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ColorPicker } from '@/components/ui/color-picker';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

const settingsSchema = z.object({
  appName: z.string().min(1, 'Application name is required'),
  themeColors: z.object({
    primary: z.string(),
    secondary: z.string(),
    accent: z.string()
  }),
  dateFormat: z.string(),
  currencyFormat: z.string(),
  enableNotifications: z.boolean(),
  enableWelfare: z.boolean(),
  enableFamilyUnits: z.boolean(),
  enableDocumentSharing: z.boolean(),
  enableVersionControl: z.boolean(),
  defaultDocumentAccess: z.string()
});

export function Settings() {
  const { settings, updateSettings, loading } = useSettings();
  const form = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: settings,
    values: settings
  });

  const onSubmit = async (data: z.infer<typeof settingsSchema>) => {
    try {
      console.log('Submitting settings:', data); // Debug log
      await updateSettings(data);
      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update settings",
        variant: "destructive",
      });
    }
  };

  React.useEffect(() => {
    if (settings) {
      form.reset(settings);
    }
  }, [settings, form]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Settings</h1>
          <Button type="submit">Save Changes</Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Application Name</label>
                <Input {...form.register('appName')} />
              </div>
              <div>
                <label className="text-sm font-medium">Date Format</label>
                <Input {...form.register('dateFormat')} />
              </div>
              <div>
                <label className="text-sm font-medium">Currency Format</label>
                <Input {...form.register('currencyFormat')} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Theme Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Primary Color</label>
                <ColorPicker
                  value={form.watch('themeColors.primary')}
                  onChange={(color) => form.setValue('themeColors.primary', color)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Secondary Color</label>
                <ColorPicker
                  value={form.watch('themeColors.secondary')}
                  onChange={(color) => form.setValue('themeColors.secondary', color)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feature Toggles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'enableNotifications', label: 'Enable Notifications', description: 'Receive system notifications and alerts' },
                { key: 'enableWelfare', label: 'Enable Welfare Module', description: 'Manage welfare cases and assistance' },
                { key: 'enableFamilyUnits', label: 'Enable Family Units', description: 'Group members into family units' }
              ].map((feature) => (
                <div key={feature.key} className="flex items-start space-x-4 p-4 rounded-lg border bg-gray-50">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-900">{feature.label}</label>
                    <p className="text-sm text-gray-500 mt-1">{feature.description}</p>
                  </div>
                  <Switch 
                    {...form.register(feature.key)}
                    className="mt-1"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Document Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Enable Document Sharing</label>
                <Switch {...form.register('enableDocumentSharing')} />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Enable Version Control</label>
                <Switch {...form.register('enableVersionControl')} />
              </div>
              <div>
                <label className="text-sm font-medium">Default Document Access</label>
                <Select 
                  value={form.watch('defaultDocumentAccess')}
                  onValueChange={(value) => form.setValue('defaultDocumentAccess', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select default access" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="members">All Members</SelectItem>
                    <SelectItem value="admin">Admins Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
} 