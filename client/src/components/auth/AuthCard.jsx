import { Link } from 'react-router-dom';

export default function AuthCard({ title, subtitle, children }) {
  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Brand Panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-[42%] bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-32 -right-20 w-[28rem] h-[28rem] rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-white/[0.03] pointer-events-none" />

        {/* Logo */}
        <Link to="/login" className="flex items-center space-x-3 z-10 w-fit">
          <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-white text-xl border border-white/20">
            P
          </div>
          <span className="text-white font-bold text-xl tracking-wide">
            Pulse
          </span>
        </Link>

        {/* Central tagline */}
        <div className="z-10 space-y-6">
          <div className="space-y-3">
            <h1 className="text-4xl font-extrabold text-white leading-tight tracking-tight">
              Track the pulse
              <br />
              of your projects.
            </h1>
            <p className="text-indigo-200 text-base leading-relaxed max-w-xs">
              Manage tasks, collaborate with your team, and deliver on time —
              all in one place.
            </p>
          </div>

          {/* Feature badges */}
          <div className="flex flex-wrap gap-2 pt-2">
            {['Task management', 'Team collaboration', 'Progress tracking'].map(
              (f) => (
                <span
                  key={f}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white text-xs font-semibold backdrop-blur-sm"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
                  {f}
                </span>
              ),
            )}
          </div>
        </div>

        {/* Bottom trust line */}
        <p className="text-indigo-300/70 text-xs z-10"></p>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex flex-col justify-center py-12 px-6 sm:px-12 lg:px-16 xl:px-24 bg-white">
        {/* Mobile-only logo */}
        <div className="lg:hidden mb-10 flex items-center space-x-2.5">
          <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-indigo-200">
            P
          </div>
          <span className="text-slate-800 font-bold text-xl tracking-wide">
            Pulse
          </span>
        </div>

        <div className="max-w-sm w-full mx-auto lg:mx-0 space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-slate-500 leading-relaxed">{subtitle}</p>
          )}
        </div>

        <div className="mt-8 max-w-sm w-full mx-auto lg:mx-0">{children}</div>
      </div>
    </div>
  );
}
