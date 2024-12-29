import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const welfareCaseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  amount_requested: z.number().min(0.01, 'Amount must be greater than 0'),
});

type WelfareCaseForm = z.infer<typeof welfareCaseSchema>;

interface WelfareCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WelfareCaseForm) => Promise<void>;
}

export function WelfareCaseModal({ isOpen, onClose, onSubmit }: WelfareCaseModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<WelfareCaseForm>({
    resolver: zodResolver(welfareCaseSchema)
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Welfare Case</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <Input {...register('title')} className={errors.title ? 'border-red-500' : ''} />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <Textarea 
              {...register('description')} 
              className={errors.description ? 'border-red-500' : ''} 
              rows={4}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Amount Requested</label>
            <Input 
              type="number" 
              step="0.01"
              {...register('amount_requested', { valueAsNumber: true })} 
              className={errors.amount_requested ? 'border-red-500' : ''} 
            />
            {errors.amount_requested && (
              <p className="mt-1 text-sm text-red-500">{errors.amount_requested.message}</p>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Submit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 