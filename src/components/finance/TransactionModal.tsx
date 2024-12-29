import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

const transactionSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  type: z.enum(['tithe', 'offering', 'donation']),
  payment_method: z.enum(['card', 'bank_transfer', 'cash']),
  date: z.string(),
  description: z.string().optional(),
});

type TransactionForm = z.infer<typeof transactionSchema>;

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TransactionForm) => Promise<void>;
}

export function TransactionModal({ isOpen, onClose, onSubmit }: TransactionModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Amount</label>
            <Input
              type="number"
              step="0.01"
              {...register('amount', { valueAsNumber: true })}
              className={errors.amount ? 'border-red-500' : ''}
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-500">{errors.amount.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <Select {...register('type')} className={errors.type ? 'border-red-500' : ''}>
              <option value="tithe">Tithe</option>
              <option value="offering">Offering</option>
              <option value="donation">Donation</option>
            </Select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-500">{errors.type.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Method</label>
            <Select {...register('payment_method')} className={errors.payment_method ? 'border-red-500' : ''}>
              <option value="card">Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cash">Cash</option>
            </Select>
            {errors.payment_method && (
              <p className="mt-1 text-sm text-red-500">{errors.payment_method.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <Input
              type="date"
              {...register('date')}
              className={errors.date ? 'border-red-500' : ''}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-500">{errors.date.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
            <Input
              {...register('description')}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Transaction'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 