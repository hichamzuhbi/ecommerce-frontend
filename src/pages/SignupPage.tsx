import { SignupForm } from '../components/auth/SignupForm';

export const SignupPage = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
      <section className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-md sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Create Account</h1>
        <p className="mt-1 text-sm font-medium text-gray-600">Join EasyShop in less than a minute.</p>
        <div className="mt-6">
          <SignupForm />
        </div>
      </section>
    </main>
  );
};
