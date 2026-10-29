import { useState } from 'react'
import { ArrowRight, Eye, EyeOff, LockKeyhole, Sparkles, Ticket } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const Login: React.FC = () => {
  const navigate = useNavigate()
  const { login, isLoading, setUser, setToken } = useAuthStore()

  const [formData, setFormData] = useState({ email: 'sairam107@gmail.com', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    try {
      await login(formData.email.trim(), formData.password)
      navigate('/matches')
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'We couldn’t sign you in. Please try again.')
    }
  }

  const continueAsGuest = () => {
    setUser({
      id: 'guest',
      name: 'Cricket Fan',
      email: 'guest@cricketverse.demo',
      role: 'user',
    })
    setToken('demo-guest-session')
    navigate('/matches')
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#07111b] text-white">
      <div className="mx-auto grid min-h-screen w-full max-w-[1440px] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden min-h-screen overflow-hidden border-r border-white/10 bg-[radial-gradient(ellipse_at_48%_42%,#164737_0%,#0b2828_32%,#0a1924_69%,#07111b_100%)] px-12 py-10 lg:flex lg:flex-col lg:justify-between xl:px-20">
          <div className="absolute inset-0 opacity-25" aria-hidden="true">
            <div className="absolute left-1/2 top-[46%] h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-100/30" />
            <div className="absolute left-1/2 top-[46%] h-[510px] w-[510px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[28px] border-emerald-200/10" />
            <div className="absolute left-1/2 top-[46%] h-[390px] w-[390px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[34px] border-emerald-300/10" />
            <div className="absolute left-1/2 top-[46%] h-[220px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-lime-100/50 bg-[repeating-linear-gradient(0deg,#14613c_0px,#14613c_13px,#207848_14px,#207848_27px)] shadow-[0_0_80px_rgba(52,211,153,0.18)]" />
            <div className="absolute left-1/2 top-[46%] h-24 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-100/80 shadow-[0_0_28px_rgba(253,230,138,0.4)]" />
            <div className="absolute left-[13%] top-[29%] h-32 w-32 rounded-full bg-emerald-300/10 blur-3xl" />
            <div className="absolute right-[12%] bottom-[22%] h-40 w-40 rounded-full bg-sky-300/10 blur-3xl" />
          </div>

          <Link to="/" className="relative z-10 inline-flex w-fit items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl border border-emerald-200/20 bg-emerald-300/10 text-emerald-200">
              <Ticket size={21} />
            </span>
            <span className="text-sm font-black uppercase tracking-[0.23em]">CricketVerse</span>
          </Link>

          <div className="relative z-10 mx-auto w-full max-w-xl pb-8">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200/20 bg-black/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-100 backdrop-blur">
              <Sparkles size={13} /> Feel every moment
            </div>
            <h1 className="max-w-lg text-5xl font-black leading-[1.08] tracking-tight xl:text-6xl">
              Your seat.
              <br />
              <span className="text-emerald-300">Your view.</span>
              <br />
              Game on.
            </h1>
            <p className="mt-5 max-w-md text-sm leading-6 text-slate-300">
              Find your match, explore the stadium in 3D, and choose the view you want before booking.
            </p>
            <div className="mt-8 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300">
              Made for fans who live for the game
            </div>
          </div>

          <p className="relative z-10 text-[10px] uppercase tracking-[0.18em] text-slate-500">
            Explore the matchday from every angle
          </p>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10">
          <div className="w-full max-w-md">
            <Link to="/" className="mb-12 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-emerald-300 lg:hidden">
              <Ticket size={18} /> CricketVerse
            </Link>

            <div className="mb-8">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-300">
                Welcome back
              </p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Sign in to CricketVerse</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Pick up where the game gets exciting.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="mb-2 block text-xs font-semibold text-slate-300">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#101c28] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300/50 focus:ring-2 focus:ring-emerald-300/10"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="password" className="block text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <LockKeyhole size={14} className="text-slate-500" />
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                    placeholder="Enter your password"
                    required
                    className="w-full rounded-xl border border-white/10 bg-[#101c28] px-4 py-3.5 pr-12 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300/50 focus:ring-2 focus:ring-emerald-300/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 grid w-12 place-items-center text-slate-400 transition hover:text-white"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {error && (
                <p role="alert" className="rounded-xl border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#6ee7b7] px-5 py-3.5 text-sm font-bold text-[#062117] shadow-[0_8px_28px_rgba(52,211,153,0.16)] transition hover:bg-[#a7f3d0] focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:ring-offset-2 focus:ring-offset-[#07111b] disabled:cursor-wait disabled:opacity-60"
              >
                {isLoading ? 'Signing in…' : 'Sign in'}
                {!isLoading && <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />}
              </button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <span className="h-px flex-1 bg-white/10" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">or</span>
              <span className="h-px flex-1 bg-white/10" />
            </div>

            <button
              type="button"
              onClick={continueAsGuest}
              className="w-full rounded-xl border border-white/10 bg-[#0d1924] px-5 py-3.5 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-[#142431]"
            >
              Continue as guest
            </button>

            <p className="mt-6 text-center text-sm text-slate-400">
              New to CricketVerse?{' '}
              <Link to="/register" className="font-semibold text-emerald-300 transition hover:text-emerald-200">
                Create an account
              </Link>
            </p>

            <p className="mt-8 rounded-xl border border-white/5 bg-white/[0.025] px-4 py-3 text-center text-[11px] leading-5 text-slate-500">
              Your account is stored securely in the app database. Guests can explore, but bookings require an account.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}

export default Login
