import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthCard from '../../components/auth/AuthCard';
import { useForm } from 'react-hook-form';
import { apiPrivate } from '../../api/axios';

export default function Register() {
  const navigate = useNavigate();

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      role: 'MEMBER',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const response = await apiPrivate.post('/auth/register', data);
      navigate('/login');
    } catch (err) {
      if (!err?.response) {
        setErrorMsg('No Server Response');
      } else if (err.response?.status === 400) {
        setErrorMsg('Please fill the required fields');
      } else {
        setErrorMsg('Failed to Register');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Create your account"
      subtitle="Start managing your projects with Pulse today — free forever."
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label
              htmlFor="firstName"
              className="block text-sm font-semibold text-slate-700"
            >
              First name
              <span className="ml-0.5 text-rose-500">*</span>
            </label>
            <input
              id="firstName"
              type="text"
              placeholder="John"
              className={`block w-full px-4 py-2.5 bg-slate-50 border ${
                errors.firstName
                  ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500'
                  : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
              } rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:bg-white transition duration-150`}
              {...register('firstName', { required: 'First Name is required' })}
            />
            {errors.firstName && (
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
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="lastName"
              className="block text-sm font-semibold text-slate-700"
            >
              Last name
              <span className="ml-0.5 text-rose-500">*</span>
            </label>
            <input
              id="lastName"
              type="text"
              placeholder="Doe"
              className={`block w-full px-4 py-2.5 bg-slate-50 border ${
                errors.lastName
                  ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500'
                  : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
              } rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:bg-white transition duration-150`}
              {...register('lastName', { required: 'Last Name is required' })}
            />
            {errors.lastName && (
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
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label
              htmlFor="username"
              className="block text-sm font-semibold text-slate-700"
            >
              Username
              <span className="ml-0.5 text-rose-500">*</span>
            </label>
            <input
              id="username"
              type="text"
              placeholder="johndoe"
              className={`block w-full px-4 py-2.5 bg-slate-50 border ${
                errors.username
                  ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500'
                  : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
              } rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:bg-white transition duration-150`}
              {...register('username', {
                required: 'Username is required',
                minLength: { value: 3, message: 'Must be at least 3 chars' },
                maxLength: { value: 30, message: 'Must be at most 30 chars' },
                pattern: {
                  value: /^[a-zA-Z0-9_]+$/,
                  message: 'Only letters, numbers, and _',
                },
              })}
            />
            {errors.username && (
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
                {errors.username.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="phone"
              className="block text-sm font-semibold text-slate-700"
            >
              Phone number
              <span className="ml-0.5 text-rose-500">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              className={`block w-full px-4 py-2.5 bg-slate-50 border ${
                errors.phone
                  ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500'
                  : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
              } rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:bg-white transition duration-150`}
              {...register('phone', { required: 'Phone number is required' })}
            />
            {errors.phone && (
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
                {errors.phone.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              className={`block w-full px-4 py-2.5 bg-slate-50 border ${
                errors.email
                  ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500'
                  : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
              } rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:bg-white transition duration-150`}
              {...register('email', { required: 'Email is required' })}
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

          <div className="space-y-1.5">
            <label
              htmlFor="department"
              className="block text-sm font-semibold text-slate-700"
            >
              Department
            </label>
            <select
              id="department"
              className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:bg-white transition duration-150"
              {...register('department')}
            >
              <option value="">Select Department (Optional)</option>
              <option value="Engineering">Engineering</option>
              <option value="Product">Product</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="Operations">Operations</option>
              <option value="QA / Testing">QA / Testing</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            Select Your Role
            <span className="ml-0.5 text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label
              className={`flex flex-col items-center justify-center p-3 border rounded-xl cursor-pointer transition-all duration-150 text-center relative ${
                selectedRole === 'MEMBER'
                  ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-600/25'
                  : errors.role
                    ? 'border-rose-300 bg-white hover:bg-slate-50'
                    : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                value="MEMBER"
                className="sr-only"
                {...register('role', { required: 'Role is required' })}
              />
              <div
                className={`p-1.5 rounded-lg ${selectedRole === 'MEMBER' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <span
                className={`mt-1.5 text-xs font-bold ${selectedRole === 'MEMBER' ? 'text-indigo-900' : 'text-slate-700'}`}
              >
                Member
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                Contributor / Dev
              </span>
            </label>

            <label
              className={`flex flex-col items-center justify-center p-3 border rounded-xl cursor-pointer transition-all duration-150 text-center relative ${
                selectedRole === 'PROJECT_MANAGER'
                  ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-600/25'
                  : errors.role
                    ? 'border-rose-300 bg-white hover:bg-slate-50'
                    : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                value="PROJECT_MANAGER"
                className="sr-only"
                {...register('role', { required: 'Role is required' })}
              />
              <div
                className={`p-1.5 rounded-lg ${selectedRole === 'PROJECT_MANAGER' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>
              <span
                className={`mt-1.5 text-xs font-bold ${selectedRole === 'PROJECT_MANAGER' ? 'text-indigo-900' : 'text-slate-700'}`}
              >
                Manager
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                Leads the projects
              </span>
            </label>
          </div>
          {errors.role && (
            <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {errors.role.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              placeholder="Min. 8 characters"
              className={`block w-full px-4 py-2.5 bg-slate-50 border ${
                errors.password
                  ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500'
                  : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
              } rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:bg-white transition duration-150`}
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Must be at least 8 characters',
                },
              })}
            />
            {errors.password && (
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
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="confirm-password"
              className="block text-sm font-semibold text-slate-700"
            >
              Confirm password
              <span className="ml-0.5 text-rose-500">*</span>
            </label>
            <input
              id="confirm-password"
              type="password"
              placeholder="••••••••"
              className={`block w-full px-4 py-2.5 bg-slate-50 border ${
                errors.confirmPassword
                  ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500'
                  : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
              } rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:bg-white transition duration-150`}
              {...register('confirmPassword', {
                required: 'Confirm Password is required',
                validate: (val) => {
                  if (watch('password') !== val) {
                    return 'Passwords do not match';
                  }
                },
              })}
            />
            {errors.confirmPassword && (
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
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-2.5 px-4 rounded-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-150 shadow-sm shadow-indigo-200 cursor-pointer mt-2"
        >
          Create account
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-bold text-indigo-600 hover:text-indigo-500 transition"
        >
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
