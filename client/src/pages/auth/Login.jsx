import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthCard from '../../components/auth/AuthCard';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../../context/AuthContext';
import { apiPrivate } from '../../api/axios';

export default function Login() {
  const { setAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const response = await apiPrivate.post('/auth/login', data);
      const { accessToken, username, role } = response.data;
      setAuth({ token: accessToken, username, role });
      navigate('/dashboard');
    } catch (err) {
      if (!err?.response) {
        setErrorMsg('No Server Response');
      } else if (err.response?.status === 400) {
        setErrorMsg('Missing Username/Email or Password');
      } else if (err.response?.status === 401) {
        setErrorMsg('Invalid Credentials');
      } else {
        setErrorMsg('Login Failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your account to continue"
    >
      {errorMsg && (
        <div className="p-3 mb-4 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-600 flex items-center gap-2">
          <svg
            className="h-4 w-4 shrink-0 text-rose-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <label
            htmlFor="identifier"
            className="block text-sm font-semibold text-slate-700"
          >
            Username or Email
            <span className="ml-0.5 text-rose-500">*</span>
          </label>
          <input
            id="identifier"
            type="text"
            placeholder="Enter username or email"
            className={`block w-full px-4 py-2.5 bg-slate-50 border ${
              errors.identifier
                ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500'
                : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
            } rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:bg-white transition duration-150`}
            {...register('identifier', {
              required: 'Username or Email is required',
            })}
          />
          {errors.identifier && (
            <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {errors.identifier.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="block text-sm font-semibold text-slate-700"
          >
            Password
            <span className="ml-0.5 text-rose-500">*</span>
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            className={`block w-full px-4 py-2.5 bg-slate-50 border ${
              errors.password
                ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500'
                : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
            } rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:bg-white transition duration-150`}
            {...register('password', { required: 'Password is required' })}
          />
          {errors.password && (
            <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 transition cursor-pointer"
              {...register('rememberMe')}
            />
            <label
              htmlFor="remember-me"
              className="text-sm text-slate-600 cursor-pointer select-none leading-snug"
            >
              Remember me
            </label>
          </div>
          <Link
            to="/forgot-password"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 transition"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2.5 px-4 rounded-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-150 shadow-sm shadow-indigo-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don't have an account?{' '}
        <Link
          to="/register"
          className="font-bold text-indigo-600 hover:text-indigo-500 transition"
        >
          Create one
        </Link>
      </p>
    </AuthCard>
  );
}
