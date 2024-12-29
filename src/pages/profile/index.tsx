import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  phone: z.string().optional(),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export function Profile() {
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  const onSubmit = async (data: ProfileForm) => {
    try {
      // TODO: Implement profile update
      console.log('Profile update:', data);
    } catch (error) {
      console.error('Profile update failed:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Profile Settings</h2>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <Input
                {...register('firstName')}
                className={errors.firstName ? 'border-red-500' : ''}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-500">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <Input
                {...register('lastName')}
                className={errors.lastName ? 'border-red-500' : ''}
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-500">{errors.lastName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <Input
                {...register('phone')}
                type="tel"
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <Input
                {...register('dateOfBirth')}
                type="date"
                className={errors.dateOfBirth ? 'border-red-500' : ''}
              />
              {errors.dateOfBirth && (
                <p className="mt-1 text-sm text-red-500">{errors.dateOfBirth.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <Input
                {...register('address')}
                className={errors.address ? 'border-red-500' : ''}
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-500">{errors.address.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 