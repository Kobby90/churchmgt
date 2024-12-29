import React from 'react';
import { cn } from '@/lib/utils';

interface AuthCardProps {
  children: React.ReactNode;
  title: string;
  className?: string;
}

export function AuthCard({ children, title, className }: AuthCardProps) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className={cn(
        "w-full space-y-8 bg-white p-8 rounded-lg shadow",
        className || "max-w-md"
      )}>
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {title}
          </h2>
        </div>
        {children}
      </div>
    </div>
  );
}