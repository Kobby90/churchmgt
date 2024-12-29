import React from 'react';
import { useAuth } from '@/contexts/auth';
import { useMember } from '@/hooks/useMember';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Shield,
  Edit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function MemberProfile() {
  const { user } = useAuth();
  const { member, updateMember, loading } = useMember();
  const [isEditing, setIsEditing] = React.useState(false);

  const togglePrivacySetting = async (setting: string) => {
    if (!member) return;
    
    const newPrivacy = {
      ...member.profile_privacy,
      [setting]: !member.profile_privacy[setting]
    };
    
    await updateMember({
      profile_privacy: newPrivacy
    });
  };

  if (loading || !member) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${member.first_name} ${member.last_name}`} />
              <AvatarFallback>{member.first_name[0]}{member.last_name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {member.first_name} {member.last_name}
              </h1>
              <p className="text-sm text-gray-500">Member since {new Date(member.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            {isEditing ? 'View Profile' : 'Edit Profile'}
          </Button>
        </div>

        <div className="space-y-6">
          {/* Personal Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{member.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Switch 
                      checked={member.profile_privacy.show_email}
                      onCheckedChange={() => togglePrivacySetting('show_email')}
                    />
                    <span className="text-xs text-gray-500">Public</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{member.phone}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Switch 
                      checked={member.profile_privacy.show_phone}
                      onCheckedChange={() => togglePrivacySetting('show_phone')}
                    />
                    <span className="text-xs text-gray-500">Public</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{member.address}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Switch 
                      checked={member.profile_privacy.show_address}
                      onCheckedChange={() => togglePrivacySetting('show_address')}
                    />
                    <span className="text-xs text-gray-500">Public</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(member.date_of_birth).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Switch 
                      checked={member.profile_privacy.show_birthday}
                      onCheckedChange={() => togglePrivacySetting('show_birthday')}
                    />
                    <span className="text-xs text-gray-500">Public</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Membership Status */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Membership Status</h2>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-gray-400" />
              <span className={`px-2 py-1 text-xs font-medium rounded-full
                ${member.membership_status === 'active' ? 'bg-green-100 text-green-800' :
                  member.membership_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'}`}>
                {member.membership_status.charAt(0).toUpperCase() + member.membership_status.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 