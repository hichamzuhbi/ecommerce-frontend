import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { BriefcaseBusiness, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { hasAdminAccess } from '../../utils/auth.utils';

const signupSchema = z
  .object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please confirm your password'),
    accountType: z.enum(['employee', 'admin']),
    adminSecret: z.string().optional(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .superRefine((values, ctx) => {
    if (values.accountType === 'admin' && !values.adminSecret?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['adminSecret'],
        message: 'Admin secret is required for admin registration',
      });
    }
  });

type SignupValues = z.infer<typeof signupSchema>;

export const SignupForm = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      accountType: 'employee',
      adminSecret: '',
    },
  });

  const accountType = watch('accountType');

  const onSubmit = async (values: SignupValues) => {
    const isAdmin = values.accountType === 'admin';
    const authenticatedUser = await registerUser(
      {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        ...(isAdmin ? { adminSecret: values.adminSecret?.trim() ?? '' } : {}),
      },
      isAdmin,
    );

    navigate(hasAdminAccess(authenticatedUser) ? '/admin/dashboard' : '/home');
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="First Name"
          placeholder="John"
          error={errors.firstName?.message}
          {...register('firstName')}
        />
        <Input
          label="Last Name"
          placeholder="Doe"
          error={errors.lastName?.message}
          {...register('lastName')}
        />
      </div>

      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register('email')}
      />

      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-700">Account Type</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className={`cursor-pointer rounded-xl border p-3 transition-all ${
            accountType === 'employee' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-white'
          }`}>
            <input type="radio" value="employee" className="sr-only" {...register('accountType')} />
            <div className="flex items-start gap-2">
              <BriefcaseBusiness size={18} className="mt-0.5 text-indigo-600" />
              <div>
                <p className="text-sm font-bold text-gray-900">I&apos;m Employee</p>
                <p className="text-xs text-gray-600">Create a regular customer account.</p>
              </div>
            </div>
          </label>

          <label className={`cursor-pointer rounded-xl border p-3 transition-all ${
            accountType === 'admin' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-white'
          }`}>
            <input type="radio" value="admin" className="sr-only" {...register('accountType')} />
            <div className="flex items-start gap-2">
              <ShieldCheck size={18} className="mt-0.5 text-indigo-600" />
              <div>
                <p className="text-sm font-bold text-gray-900">I&apos;m Admin</p>
                <p className="text-xs text-gray-600">Requires your backend admin secret key.</p>
              </div>
            </div>
          </label>
        </div>
      </div>

      {accountType === 'admin' ? (
        <Input
          label="Admin Secret"
          type="password"
          placeholder="Enter admin secret"
          error={errors.adminSecret?.message}
          {...register('adminSecret')}
        />
      ) : null}

      <div className="relative">
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="********"
          error={errors.password?.message}
          {...register('password')}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-9 text-gray-500"
          aria-label="Toggle password visibility"
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      <Input
        label="Confirm Password"
        type={showPassword ? 'text' : 'password'}
        placeholder="********"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      <Button className="w-full" type="submit" isLoading={isLoading}>
        {accountType === 'admin' ? 'Create Admin Account' : 'Sign Up'}
      </Button>

      <p className="text-center text-sm font-medium text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
          Login
        </Link>
      </p>
    </form>
  );
};
