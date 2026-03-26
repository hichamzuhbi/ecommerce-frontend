import { LoginForm } from '../components/auth/LoginForm';

export const LoginPage = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
      <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-md sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Welcome Back</h1>
        <p className="mt-1 text-sm font-medium text-gray-600">Login to continue shopping.</p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </section>
    </main>
  );
};
