import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { 
  Heart, 
  Plus,
  Search,
  Loader2,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { WelfareCaseModal } from '@/components/welfare/WelfareCaseModal';
import { useWelfareCases } from '@/hooks/useWelfareCases';
import { formatCurrency } from '@/lib/utils';

export function Welfare() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { welfareCases, loading, error, createWelfareCase } = useWelfareCases();

  const stats = [
    {
      title: 'Total Cases',
      value: welfareCases.length,
      icon: Heart,
      trend: '+5.2%',
      trendUp: true
    },
    {
      title: 'Pending Cases',
      value: welfareCases.filter(c => c.status === 'pending').length,
      icon: Clock,
      trend: '-2.1%',
      trendUp: false
    },
    {
      title: 'Total Approved',
      value: formatCurrency(welfareCases
        .filter(c => c.status === 'approved')
        .reduce((sum, c) => sum + (c.amount_approved || 0), 0)),
      icon: CheckCircle,
      trend: '+8.4%',
      trendUp: true
    }
  ];

  const handleCreateCase = async (data: any) => {
    try {
      await createWelfareCase({
        ...data,
        member_id: user.id
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to create welfare case:', error);
    }
  };

  const filteredCases = welfareCases.filter(welfareCase => 
    welfareCase.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    welfareCase.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    welfareCase.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        Error loading welfare cases: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Welfare Management</h1>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> New Case
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{stat.value}</p>
              </div>
              <div className={`rounded-full p-3 ${stat.trendUp ? 'bg-green-50' : 'bg-red-50'}`}>
                <stat.icon className={`h-6 w-6 ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {stat.trendUp ? (
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
              )}
              <span className={`text-sm ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                {stat.trend} from last month
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Welfare Cases</h2>
            <div className="flex items-center gap-4">
              <Input
                placeholder="Search cases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
                icon={<Search className="h-4 w-4 text-gray-400" />}
              />
            </div>
          </div>

          {filteredCases.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No welfare cases found</p>
          ) : (
            <div className="space-y-4">
              {filteredCases.map((welfareCase) => (
                <div 
                  key={welfareCase.id} 
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{welfareCase.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{welfareCase.description}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          Requested: {formatCurrency(welfareCase.amount_requested)}
                        </p>
                        {welfareCase.amount_approved && (
                          <p className="text-sm text-gray-500">
                            Approved: {formatCurrency(welfareCase.amount_approved)}
                          </p>
                        )}
                      </div>
                      <span className={`
                        px-2 py-1 text-xs font-medium rounded-full
                        ${welfareCase.status === 'approved' ? 'bg-green-100 text-green-800' :
                          welfareCase.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'}
                      `}>
                        {welfareCase.status.charAt(0).toUpperCase() + welfareCase.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <WelfareCaseModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateCase}
      />
    </div>
  );
}