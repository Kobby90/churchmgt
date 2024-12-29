import React from 'react';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { 
  Calendar,
  Filter,
  Download,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Select } from '@/components/ui/select';

export function AuditLogViewer() {
  const [filters, setFilters] = React.useState({
    user_id: '',
    entity_type: '',
    from_date: null,
    to_date: null
  });

  const { logs, loading, exportLogs } = useAuditLogs(filters);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <Button
          onClick={exportLogs}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export Logs
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search by user..."
            value={filters.user_id}
            onChange={(e) => setFilters(prev => ({ ...prev, user_id: e.target.value }))}
          />
          
          <Select
            value={filters.entity_type}
            onValueChange={(value) => setFilters(prev => ({ ...prev, entity_type: value }))}
          >
            <option value="">All Types</option>
            <option value="member">Member</option>
            <option value="transaction">Transaction</option>
            <option value="welfare_case">Welfare Case</option>
          </Select>

          <DateRangePicker
            from={filters.from_date}
            to={filters.to_date}
            onSelect={(range) => setFilters(prev => ({
              ...prev,
              from_date: range.from,
              to_date: range.to
            }))}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Entity Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Changes
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {log.user_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {log.action}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {log.entity_type}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(log.changes, null, 2)}
                  </pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 