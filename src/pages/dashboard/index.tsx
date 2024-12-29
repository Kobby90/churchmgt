import React from 'react';
import { useAuth } from '@/contexts/auth';
import { 
  Users, 
  DollarSign, 
  GiftIcon, 
  CalendarDays,
  TrendingUp,
  Heart
} from 'lucide-react';

interface DashboardStat {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  change?: string;
}

export function Dashboard() {
  const { user } = useAuth();

  const stats: DashboardStat[] = [
    {
      title: 'Total Tithe',
      value: '$0.00',
      icon: DollarSign,
      description: 'Current month',
      change: '+0% from last month'
    },
    {
      title: 'Donations',
      value: '$0.00',
      icon: GiftIcon,
      description: 'Current month'
    },
    {
      title: 'Welfare Cases',
      value: '0',
      icon: Heart,
      description: 'Active cases'
    },
    {
      title: 'Family Members',
      value: '0',
      icon: Users,
      description: 'Connected family members'
    }
  ];

  const upcomingEvents = [
    {
      title: 'Birthday Celebrations',
      date: 'Next 30 days',
      count: 0
    },
    {
      title: 'Wedding Anniversaries',
      date: 'Next 30 days',
      count: 0
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">Last updated: {new Date().toLocaleString()}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{stat.value}</p>
              </div>
              <div className="bg-blue-50 rounded-full p-3">
                <stat.icon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            {stat.description && (
              <p className="mt-4 text-sm text-gray-600">
                {stat.description}
                {stat.change && (
                  <span className="ml-2 text-green-600">{stat.change}</span>
                )}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <div className="mt-4">
              <p className="text-gray-500">No recent activity</p>
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
            <div className="mt-4 space-y-4">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CalendarDays className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{event.title}</p>
                      <p className="text-sm text-gray-500">{event.date}</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{event.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}