import { CalendarDays, ChevronRight, Clock3, MapPin, Search, Ticket, Trophy } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { demoMatches, type MatchFormat } from '../services/demoMatches'
import { useAuthStore } from '../store/authStore'

const formatFilters: Array<'All formats' | MatchFormat> = ['All formats', 'T20', 'ODI', 'Test']

function formatFixtureDate(value: string) {
  const date = value.slice(0, 10)
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T12:00:00Z`))
}

const Matches: React.FC = () => {
  const { user } = useAuthStore()
  const [query, setQuery] = useState('')
  const [selectedFormat, setSelectedFormat] = useState<(typeof formatFilters)[number]>('All formats')

  const visibleMatches = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase()
    return demoMatches
      .filter((match) => selectedFormat === 'All formats' || match.format === selectedFormat)
      .filter((match) => {
        if (!normalizedQuery) return true
        return [
          match.teamA,
          match.teamB,
          match.tournament,
          match.format,
          match.venue,
          match.city,
          match.country,
        ]
          .join(' ')
          .toLocaleLowerCase()
          .includes(normalizedQuery)
      })
      .sort((left, right) => left.matchDate.localeCompare(right.matchDate))
  }, [query, selectedFormat])

  return (
    <main className="min-h-screen bg-[#f4f7f6] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-600 text-sm font-black text-white">CV</span>
            <span>
              <span className="block text-sm font-bold tracking-wide">CRICKETVERSE</span>
              <span className="block text-[11px] text-slate-500">Matchday tickets</span>
            </span>
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
            <Link to="/" className="hover:text-emerald-700">Home</Link>
            <Link to="/profile" className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 hover:bg-slate-200">
              <Ticket size={15} /> My bookings
            </Link>
            {user?.role === 'admin' && (
              <Link to="/admin/matches" className="rounded-lg bg-slate-100 px-3 py-2 hover:bg-slate-200">
                Manage matches
              </Link>
            )}
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[#10352e] text-white">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute -right-16 -top-40 h-[34rem] w-[34rem] rounded-full border-[36px] border-emerald-300/30" />
          <div className="absolute -right-4 -top-28 h-[27rem] w-[27rem] rounded-full border border-white/20" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-emerald-300">Live the match, your way</p>
            <h1 className="text-3xl font-black tracking-tight sm:text-5xl">Find your next matchday.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-emerald-50/80 sm:text-base">
              Browse upcoming fixtures, compare ticket categories and choose your seat in an interactive 3D cricket stadium.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-xl font-bold">{demoMatches.length}</p>
              <p className="text-xs text-emerald-50/70">upcoming fixtures</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-xl font-bold">{new Set(demoMatches.map((match) => match.country)).size}</p>
              <p className="text-xs text-emerald-50/70">host countries</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-xl font-bold">T20 · ODI · Test</p>
              <p className="text-xs text-emerald-50/70">match formats</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2 text-emerald-700">
              <Trophy size={17} />
              <p className="text-xs font-bold uppercase tracking-[0.18em]">Upcoming cricket</p>
            </div>
            <h2 className="mt-2 text-2xl font-bold">Fixtures & tickets</h2>
            <p className="mt-1 text-sm text-slate-500">Browse match information and select a fixture to explore the seats.</p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Demo fixture schedule · not a live feed
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row">
          <label className="relative flex-1">
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search teams, tournament, venue or city"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {formatFilters.map((format) => (
              <button
                key={format}
                type="button"
                onClick={() => setSelectedFormat(format)}
                className={`rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                  selectedFormat === format
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {format}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-600">
            {visibleMatches.length} {visibleMatches.length === 1 ? 'fixture' : 'fixtures'}
          </p>
          <p className="text-xs text-slate-500">Sorted by date</p>
        </div>

        {visibleMatches.length > 0 ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {visibleMatches.map((match) => (
              <article
                key={match.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-4">
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-800">
                    {match.tournament}
                  </span>
                  <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase text-blue-800">
                    {match.format}
                  </span>
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xl font-black">{match.teamA}</p>
                      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Home side</p>
                    </div>
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-[10px] font-black text-slate-500">VS</span>
                    <div className="min-w-0 flex-1 text-right">
                      <p className="truncate text-xl font-black">{match.teamB}</p>
                      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Away side</p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
                    <MatchDetail icon={<CalendarDays size={16} />} label="Date" value={formatFixtureDate(match.matchDate)} />
                    <MatchDetail icon={<Clock3 size={16} />} label="Local start" value={`${match.localTime} ${match.timeZone}`} />
                    <MatchDetail
                      icon={<MapPin size={16} />}
                      label="Venue"
                      value={match.venue}
                      subValue={`${match.city}, ${match.country}`}
                    />
                    <MatchDetail
                      icon={<Ticket size={16} />}
                      label="Ticket range"
                      value={`₹${match.minTicketPrice.toLocaleString('en-IN')} – ₹${match.maxTicketPrice.toLocaleString('en-IN')}`}
                      subValue={`${match.availableTickets.toLocaleString('en-IN')} demo seats listed`}
                    />
                  </div>

                  <div className="mt-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <p className="text-[11px] leading-4 text-slate-500">
                      Prices and ticket counts are illustrative; availability is not live.
                    </p>
                    <Link
                      to={`/stadium/${match.id}`}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-800"
                    >
                      Choose seats <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <Search className="mx-auto text-slate-400" size={28} />
            <h3 className="mt-3 font-bold">No fixtures match your search</h3>
            <p className="mt-1 text-sm text-slate-500">Try another team, city or format.</p>
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setSelectedFormat('All formats')
              }}
              className="mt-4 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold hover:bg-slate-200"
            >
              Clear filters
            </button>
          </div>
        )}

        <p className="mt-8 text-center text-xs leading-5 text-slate-500">
          Schedule, opponents, venues and ticket inventory shown here are sample project data. Connect an official fixture and ticketing provider before publishing.
        </p>
      </section>
    </main>
  )
}

function MatchDetail({
  icon,
  label,
  value,
  subValue,
}: {
  icon: React.ReactNode
  label: string
  value: string
  subValue?: string
}) {
  return (
    <div className="flex min-w-0 gap-2.5">
      <span className="mt-0.5 shrink-0 text-emerald-700">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="truncate text-xs font-semibold text-slate-800">{value}</p>
        {subValue && <p className="truncate text-[11px] text-slate-500">{subValue}</p>}
      </div>
    </div>
  )
}

export default Matches
