import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const WelcomePage = () => {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-sky-900 to-emerald-700 px-4">
      <div className="absolute -left-16 top-14 h-44 w-44 animate-float rounded-full bg-cyan-300/20 blur-2xl" />
      <div className="absolute right-0 top-1/3 h-64 w-64 animate-float-delayed rounded-full bg-indigo-300/20 blur-2xl" />
      <div className="absolute bottom-10 left-1/3 h-36 w-36 animate-float rounded-full bg-emerald-200/20 blur-2xl" />

      <section className="relative z-10 mx-auto max-w-2xl text-center text-white">
        <h1 className="text-5xl font-black tracking-tight sm:text-7xl">EasyShop</h1>
        <p className="mt-5 text-base font-medium text-blue-100 sm:text-lg">
          Discover everything you need, all in one place.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/login">
            <Button className="w-full sm:w-36" variant="secondary">
              Login
            </Button>
          </Link>
          <Link to="/signup">
            <Button className="w-full sm:w-36">Sign Up</Button>
          </Link>
        </div>
      </section>
    </main>
  );
};
