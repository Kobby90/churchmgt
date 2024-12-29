import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { 
  DollarSign, 
  CreditCard, 
  Banknote, 
  CalendarDays,
  Plus,
  Filter,
  Download,
  Loader2,
  TrendingUp,
  TrendingDown,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TransactionModal } from '@/components/finance/TransactionModal';
import { useTransactions } from '@/hooks/useTransactions';
import { formatCurrency } from '@/lib/utils';

export function Finance() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { transactions, stats, loading, error, createTransaction } = useTransactions();

  const getStatValue = (type: string) => {
    if (!stats) return '$0.00';
    const stat = stats.find((s: any) => s.type === type);
    return formatCurrency(stat?.total || 0);
  };

  const dashboardStats = [
    {
      title: 'Total Tithe',
      value: getStatValue('tithe'),
      icon: DollarSign,
      trend: '+12.5%',
      trendUp: true
    },
    {
      title: 'Total Offerings',
      value: getStatValue('offering'),
      icon: Banknote,
      trend: '+8.2%',
      trendUp: true
    },
    {
      title: 'Total Donations',
      value: getStatValue('donation'),
      icon: CreditCard,
      trend: '-3.1%',
      trendUp: false
    }
  ];

  const handleCreateTransaction = async (data: any) => {
    try {
      await createTransaction(data);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to create transaction:', error);
    }
  };

  const filteredTransactions = transactions.filter(transaction => 
    transaction.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.payment_method.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.amount.toString().includes(searchTerm)
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
        Error loading transactions: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Financial Management</h1>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> New Transaction
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dashboardStats.map((stat, index) => (
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
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" /> Filter
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" /> Export
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="capitalize text-sm font-medium text-gray-900">
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="capitalize text-sm text-gray-500">
                      {transaction.payment_method.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${transaction.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : transaction.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                      }`}>
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <TransactionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTransaction}
      />
    </div>
  );
}