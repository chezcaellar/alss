'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Student, Barangay } from '@/types';
import { User } from '@/types/auth';
import {
  studentSchema,
  StudentFormValues,
  programOptions,
  modalityOptions,
  statusOptions,
  genderOptions
} from '@/validators/student-validators';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface StudentFormProps {
  student?: Student;
  barangays: Barangay[];
  user: User | null;
  onSubmit: (data: StudentFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function StudentForm({ student, barangays, user, onSubmit, onCancel, isSubmitting = false }: StudentFormProps) {
  // Filter barangays based on user role - Regular Admin can only see their assigned barangay
  const filteredBarangays = user?.role === 'admin' && user?.assignedBarangayId
    ? barangays.filter(b => b._id === user.assignedBarangayId)
    : barangays;

  // Initialize form with React Hook Form and Zod validation
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      lrn: student?.lrn || '',
      name: student?.name || '',
      status: student?.status || 'active',
      gender: student?.gender || 'male',
      address: student?.address || '',
      barangayId: student?.barangayId || (user?.role === 'admin' && user?.assignedBarangayId ? user.assignedBarangayId : ''),
      program: student?.program || '',
      enrollmentDate: student?.enrollmentDate || new Date().toISOString().split('T')[0],
      modality: student?.modality || 'Face to Face',
      pisScore: student?.pisScore || null,
      assessment: student?.assessment || '',
      group: student?.group || 'A',
    },
  });

  // Handle form submission
  const handleSubmit = async (data: StudentFormValues) => {
    try {
      await onSubmit(data);
    } catch (error) {
      // Map specific errors to field-level validation
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes('This LRN is already taken.')) {
        form.setError('lrn', { type: 'manual', message: 'This LRN is already taken.' });
      }
      console.error('Form submission error:', error);
      // Re-throw so the dialog can also display the error banner
      throw error;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LRN */}
          <FormField
            control={form.control}
            name="lrn"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-700 font-semibold">Learner Reference Number (LRN)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. 123456789012"
                    maxLength={12}
                    className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-sm text-gray-600">
                  Enter exactly 12 digits
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-700 font-semibold">Full Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. DELA CRUZ, Juan M."
                    className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-700 font-semibold">Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="border-blue-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {statusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Gender */}
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-700 font-semibold">Gender</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="border-blue-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {genderOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Barangay */}
          <FormField
            control={form.control}
            name="barangayId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-700 font-semibold">Barangay</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="border-blue-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select barangay" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filteredBarangays.map(barangay => (
                      <SelectItem key={barangay._id} value={barangay._id}>
                        {barangay.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Address */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-2">
                <FormLabel className="text-blue-700 font-semibold">Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Purok 2, Barangay 1 (POB.), Indang, Cavite"
                    className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Program */}
          <FormField
            control={form.control}
            name="program"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-700 font-semibold">Program</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="border-blue-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select program" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {programOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Enrollment Date */}
          <FormField
            control={form.control}
            name="enrollmentDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-700 font-semibold">Enrollment Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Modality */}
          <FormField
            control={form.control}
            name="modality"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-700 font-semibold">Modality</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="border-blue-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select modality" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {modalityOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="border-blue-200 text-blue-700 hover:bg-blue-50 cursor-pointer transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-500 text-white cursor-pointer transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? (student ? 'Updating...' : 'Adding...')
              : (student ? 'Update Student' : 'Add Student')
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}
