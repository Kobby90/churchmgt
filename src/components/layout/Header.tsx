import React from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { useSettings } from '@/contexts/settings';

export function Header() {
  const { user } = useAuth();
  const { settings } = useSettings();

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        {settings.logoUrl && (
          <img 
            src={settings.logoUrl} 
            alt="Organization Logo"
            className="h-8 w-8 object-contain"
          />
        )}
        <h2 className="text-xl font-semibold text-gray-800">
          {settings.appName}
        </h2>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <Bell className="h-5 w-5 text-gray-600" />
        </button>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">{user?.email}</span>
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">
              {user?.email?.[0].toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}