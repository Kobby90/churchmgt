import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, DollarSign, Heart, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { cn } from "@/lib/utils";

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/members', icon: Users, label: 'Members' },
  { to: '/finance', icon: DollarSign, label: 'Finance' },
  { to: '/welfare', icon: Heart, label: 'Welfare' },
];

export function Sidebar() {
  const { signOut } = useAuth();

  return (
    <div className="h-screen w-64 bg-gray-900 text-white p-4 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Church Manager</h1>
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors',
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  )
                }
              >
                <Icon size={20} />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <button
        onClick={() => signOut()}
        className="flex items-center space-x-3 px-4 py-2 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
      >
        <LogOut size={20} />
        <span>Sign Out</span>
      </button>
    </div>
  );
}