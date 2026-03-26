import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { hasAdminAccess } from '../../utils/auth.utils';

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginValues = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginValues) => {
    const authenticatedUser = await login(values.email, values.password);
    navigate(hasAdminAccess(authenticatedUser) ? '/admin/dashboard' : '/home');
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-gray-700" htmlFor="password">
          Password
        </label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="********"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-3 text-gray-500"
            aria-label="Toggle password visibility"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <Button className="w-full" type="submit" isLoading={isLoading}>
        Login
      </Button>

      <p className="text-center text-sm font-medium text-gray-600">
        Don&apos;t have an account?{' '}
        <Link to="/signup" className="font-semibold text-indigo-600 hover:text-indigo-700">
          Sign Up
        </Link>
      </p>
    </form>
  );
};
