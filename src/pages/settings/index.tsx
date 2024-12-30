import React from 'react';
import { useSettings } from '@/contexts/settings';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Settings as SettingsIcon, Palette, Building, FileText, Upload } from 'lucide-react';
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
import { ToastProvider, Toast, ToastTitle, ToastDescription, ToastViewport } from "@/components/ui/toast-dialog";
import { useAuth } from '@/contexts/auth';

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
  logoUrl: z.string(),
  defaultDocumentAccess: z.string()
});

function LogoUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const { token } = useAuth();
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!token) {
      console.error('No auth token available');
      throw new Error('Authentication required');
    }

    const formData = new FormData();
    formData.append('logo', file);

    try {
      const response = await fetch('/api/settings/logo/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload logo');
      }
      
      const data = await response.json();
      onChange(data.url);
    } catch (error) {
      console.error('Failed to upload logo:', error);
      throw error;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        {value && (
          <img 
            src={value} 
            alt="Logo" 
            className="h-12 w-12 object-contain rounded-md border"
          />
        )}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="px-4 py-2 border rounded-md hover:bg-gray-50 flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Logo
          </div>
        </label>
      </div>
    </div>
  );
}

export function Settings() {
  const { settings, updateSettings, loading } = useSettings();
  const { token } = useAuth();
  
  console.log('Settings Component - Current Settings:', settings);
  console.log('Settings Component - Loading State:', loading);

  const form = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: settings
  });

  const [toastOpen, setToastOpen] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState({ title: '', description: '' });

  const showToast = (title: string, description: string) => {
    setToastMessage({ title, description });
    setToastOpen(true);
  };

  const onSubmit = async (data: z.infer<typeof settingsSchema>) => {
    try {
      console.log('Starting settings submission:', data);
      const updatedSettings = await updateSettings(data);
      console.log('Settings update response:', updatedSettings);
      
      // Reset form with new values
      form.reset(updatedSettings);
      
      showToast(
        "Success",
        "Settings updated successfully"
      );
    } catch (error) {
      console.error('Failed to update settings:', error);
      showToast(
        "Error",
        error instanceof Error ? error.message : "Failed to update settings"
      );
    }
  };

  React.useEffect(() => {
    console.log('Settings Component - Mount effect');
    console.log('Token available:', !!token);
  }, [token]);

  React.useEffect(() => {
    console.log('Settings Component - Settings/Loading changed:', {
      hasSettings: !!settings,
      loading,
      settingsKeys: settings ? Object.keys(settings) : []
    });
    
    if (settings && !loading) {
      console.log('Settings Component - Updating form with:', settings);
      form.reset(settings);
    }
  }, [settings, loading, form.reset]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <form onSubmit={form.handleSubmit(onSubmit)} className="h-full p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Settings</h1>
          <Button type="submit">Save Changes</Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Logo Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label className="text-sm font-medium">Organization Logo</label>
                <LogoUpload
                  value={form.watch('logoUrl')}
                  onChange={(url) => form.setValue('logoUrl', url)}
                />
              </div>
            </CardContent>
          </Card>

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

      <ToastProvider>
        <Toast 
          open={toastOpen} 
          onOpenChange={setToastOpen}
          aria-describedby="toast-description"
        >
          <div>
            <ToastTitle>{toastMessage.title}</ToastTitle>
            <ToastDescription id="toast-description">
              {toastMessage.description}
            </ToastDescription>
          </div>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    </div>
  );
} 