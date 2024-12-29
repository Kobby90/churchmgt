import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const userSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['member', 'admin', 'welfare_admin']),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type UserForm = z.infer<typeof userSchema>;

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserForm) => Promise<void>;
}

export function UserModal({ isOpen, onClose, onSubmit }: UserModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<UserForm>({
    resolver: zodResolver(userSchema)
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New User</DialogTitle>
          <DialogDescription className="text-gray-600">
            Fill in the details to create a new user account.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="modal-form-container">
          <div className="grid grid-cols-2 gap-4">
            <div className="modal-form-field">
              <label className="modal-form-label">First Name</label>
              <Input 
                {...register('firstName')} 
                className={cn(
                  "modal-form-input",
                  errors.firstName && "border-red-500"
                )}
              />
              {errors.firstName && (
                <p className="modal-form-error">{errors.firstName.message}</p>
              )}
            </div>
            
            {/* Similar pattern for other fields */}
          </div>

          <div className="modal-form-footer">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 