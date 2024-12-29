import React from 'react';
import { useMembers } from '@/hooks/useMembers';
import { useCommunications } from '@/hooks/useCommunications';
import { 
  Send,
  Users,
  Mail,
  Phone,
  Check,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';

export function BulkMessaging() {
  const { members } = useMembers();
  const { sendBulkMessage, loading } = useCommunications();
  const [selectedMembers, setSelectedMembers] = React.useState<string[]>([]);
  const [message, setMessage] = React.useState('');
  const [channels, setChannels] = React.useState({
    email: true,
    sms: false
  });

  const handleSend = async () => {
    try {
      await sendBulkMessage({
        memberIds: selectedMembers,
        message,
        channels
      });
      // Reset form
      setSelectedMembers([]);
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Bulk Communications</h1>
        <Button
          onClick={handleSend}
          disabled={loading || !message || selectedMembers.length === 0}
          className="flex items-center gap-2"
        >
          <Send className="h-4 w-4" />
          Send Message
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Member Selection */}
        <div className="md:col-span-1 bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recipients</h2>
            <span className="text-sm text-gray-500">
              {selectedMembers.length} selected
            </span>
          </div>
          
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {members.map(member => (
              <div 
                key={member.id}
                className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded"
              >
                <Checkbox
                  checked={selectedMembers.includes(member.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedMembers(prev => [...prev, member.id]);
                    } else {
                      setSelectedMembers(prev => prev.filter(id => id !== member.id));
                    }
                  }}
                />
                <span className="text-sm text-gray-900">
                  {member.first_name} {member.last_name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Message Composition */}
        <div className="md:col-span-2 bg-white rounded-lg shadow-sm p-4">
          <div className="space-y-4">
            <div>
              <h2 className="font-semibold text-gray-900 mb-2">Message</h2>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                className="min-h-[200px]"
              />
            </div>

            <div>
              <h2 className="font-semibold text-gray-900 mb-2">Channels</h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-900">Email</span>
                  </div>
                  <Switch
                    checked={channels.email}
                    onCheckedChange={(checked) => 
                      setChannels(prev => ({ ...prev, email: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-900">SMS</span>
                  </div>
                  <Switch
                    checked={channels.sms}
                    onCheckedChange={(checked) => 
                      setChannels(prev => ({ ...prev, sms: checked }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 