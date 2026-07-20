import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthCard from '../../components/auth/AuthCard';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../../context/AuthContext';
import { apiPrivate } from '../../api/axios';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await apiPrivate.post('/auth/forgot-password', data);
      setSubmitted(true);
    } catch (err) {
      if (!err?.response) {
        setErrorMsg('No Server Response');
      } else if (err.response?.status === 400) {
        setErrorMsg('Missing Email');
      } else if (err.response?.status === 404) {
        setErrorMsg('Email address not found');
      } else {
        setErrorMsg('Forgot Password Failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title={submitted ? 'Check your inbox' : 'Forgot password?'}
      subtitle={
        submitted
          ? "We've sent a reset link to your email address."
          : "No worries — enter your email and we'll send you a reset link."
      }
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
          {errorMsg}
        </div>
      )}

      {submitted ? (
        <div className="space-y-5">
          <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg
                className="h-4 w-4 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-800">
                Reset email sent
              </p>
              <p className="text-xs text-emerald-700/80 mt-0.5">
                Check your spam folder if you don't see it within a few minutes.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/reset-password')}
            className="w-full flex justify-center py-2.5 px-4 rounded-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition cursor-pointer"
          >
            Continue to reset password
          </button>
          <p className="text-center text-sm text-slate-500">
            <Link
              to="/login"
              className="font-semibold text-slate-700 hover:text-indigo-600 transition"
            >
              ← Back to sign in
            </Link>
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-slate-700"
            >
              Email address
              <span className="ml-0.5 text-rose-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register('email', {
                required: 'Email is required',
              })}
              className={`block w-full px-4 py-2.5 bg-slate-50 border ${
                errors.email
                  ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500'
                  : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
              } rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:bg-white transition duration-150`}
            />
            {errors.email && (
              <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                <svg
                  className="h-3 w-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {errors.email.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2.5 px-4 rounded-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition shadow-sm shadow-indigo-200 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Sending...' : 'Send reset link'}
          </button>

          <p className="text-center text-sm text-slate-500">
            <Link
              to="/login"
              className="font-semibold text-slate-700 hover:text-indigo-600 transition"
            >
              ← Back to sign in
            </Link>
          </p>
        </form>
      )}
    </AuthCard>
  );
}
