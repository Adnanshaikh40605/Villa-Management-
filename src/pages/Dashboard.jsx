import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ArrowUpRight,
  Banknote,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Clock,
  PieChart as PieChartIcon,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import {
  useGetDashboardOverviewQuery,
  useGetRecentBookingsQuery,
  useGetRevenueCandlesQuery,
  useGetRevenueChartQuery,
} from '@/services/api/bookingApi'
import { format } from 'date-fns'

const INR_SYMBOL = '\u20B9'
const VILLA_COLORS = ['#0f9f6e', '#2563eb', '#f59e0b', '#e11d48']

const formatCurrency = (value) => {
  const amount = Number(value || 0)
  return `${INR_SYMBOL}${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

const formatNumber = (value) => Number(value || 0).toLocaleString('en-IN')

const parseAmount = (value) => Number.parseFloat(value || 0) || 0

const getTrend = (value) => {
  const trendValue = Number(value || 0)
  if (trendValue > 0) return { direction: 'up', label: `+${trendValue}%` }
  if (trendValue < 0) return { direction: 'down', label: `${trendValue}%` }
  return { direction: 'neutral', label: '0%' }
}

const MetricCard = ({ title, value, helper, icon: Icon, tone, trend, delay = 0 }) => {
  const toneClasses = {
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    blue: 'bg-blue-50 text-blue-700 ring-blue-100',
    amber: 'bg-amber-50 text-amber-700 ring-amber-100',
    rose: 'bg-rose-50 text-rose-700 ring-rose-100',
  }

  const trendClasses = {
    up: 'bg-emerald-50 text-emerald-700',
    down: 'bg-rose-50 text-rose-700',
    neutral: 'bg-gray-100 text-gray-600',
  }

  return (
    <div
      className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lg animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ring-1 ${toneClasses[tone]}`}>
          <Icon className="h-6 w-6" strokeWidth={2.3} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${trendClasses[trend.direction]}`}>
            {trend.direction === 'down' ? <TrendingDown className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
            {trend.label}
          </div>
        )}
      </div>
      <div className="mt-5">
        <div className="text-3xl font-bold tracking-tight text-gray-950">{value}</div>
        <div className="mt-1 text-sm font-medium text-gray-600">{title}</div>
        {helper && <div className="mt-3 text-xs text-gray-400">{helper}</div>}
      </div>
    </div>
  )
}

const ActivityCard = ({ title, value, helper, icon: Icon, tone }) => {
  const toneClasses = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/70 p-4 transition-all duration-300 hover:bg-white hover:shadow-card">
      <div className="flex items-center gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${toneClasses[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-900">{title}</div>
          <div className="text-xs text-gray-500">{helper}</div>
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-950">{value}</div>
    </div>
  )
}

const EmptyChart = ({ label }) => (
  <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-500">
    {label}
  </div>
)

export default function Dashboard() {
  const navigate = useNavigate()
  const [timeRange, setTimeRange] = useState('1M')
  const { data: overview, isLoading: overviewLoading } = useGetDashboardOverviewQuery()
  const { data: recentBookings, isLoading: bookingsLoading } = useGetRecentBookingsQuery(6)
  const { data: candleData, isLoading: candleLoading } = useGetRevenueCandlesQuery(timeRange)
  const { data: monthlyRevenue, isLoading: monthlyRevenueLoading } = useGetRevenueChartQuery(6)

  const villaRevenue = useMemo(() => overview?.villa_revenue_this_month || [], [overview])
  const monthTotal = parseAmount(overview?.revenue?.this_month)
  const revenueTrend = getTrend(overview?.revenue?.month_change_percentage)

  const lineChartData = useMemo(() => {
    return (candleData || []).map((item) => ({
      label: item.time,
      revenue: Number(item.close || 0),
      bookings: Number(item.volume || 0),
    }))
  }, [candleData])

  const monthlyChartData = useMemo(() => {
    return (monthlyRevenue || []).map((item) => ({
      month: item.month,
      revenue: Number(item.revenue || 0),
      bookings: Number(item.bookings || 0),
    }))
  }, [monthlyRevenue])

  const pieData = villaRevenue
    .filter((villa) => parseAmount(villa.revenue_this_month) > 0)
    .map((villa) => ({
      name: villa.villa_name,
      value: parseAmount(villa.revenue_this_month),
    }))

  if (overviewLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-10 animate-fade-in">
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white px-5 py-5 shadow-soft md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-glow" />
            Live operations dashboard
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-950 md:text-3xl">Business Overview</h1>
          <p className="mt-1 text-sm text-gray-500">
            Current month villa revenue, booking activity, customer count, and recent reservations.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate('/calendar')}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
          >
            <CalendarCheck className="h-4 w-4" />
            Calendar
          </button>
          <button
            onClick={() => navigate('/bookings')}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-emerald-700"
          >
            View Bookings
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Current Month Revenue"
          value={formatCurrency(monthTotal)}
          helper="Across all villas this month"
          icon={Banknote}
          tone="green"
          trend={revenueTrend}
          delay={0}
        />
        <MetricCard
          title="Total Customers"
          value={formatNumber(overview?.bookings?.total_customers ?? overview?.bookings?.total_clients)}
          helper="Unique customer phone numbers"
          icon={Users}
          tone="blue"
          delay={80}
        />
        <MetricCard
          title="Bookings This Month"
          value={formatNumber(overview?.bookings?.this_month)}
          helper={`${formatNumber(overview?.bookings?.upcoming_7_days)} upcoming in 7 days`}
          icon={CalendarCheck}
          tone="amber"
          delay={160}
        />
        <MetricCard
          title="Occupancy Today"
          value={`${overview?.villas?.occupancy_rate || 0}%`}
          helper={`${overview?.today?.currently_booked || 0} of ${overview?.villas?.active || 0} active villas occupied`}
          icon={PieChartIcon}
          tone="rose"
          delay={240}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-soft xl:col-span-2">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-950">Revenue Trend</h2>
              <p className="text-sm text-gray-500">Booking revenue over the selected period</p>
            </div>
            <select
              value={timeRange}
              onChange={(event) => setTimeRange(event.target.value)}
              className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 outline-none transition focus:border-emerald-400 focus:bg-white"
            >
              <option value="7D">Last 7 Days</option>
              <option value="1M">Last Month</option>
              <option value="6M">Last 6 Months</option>
              <option value="1Y">Last Year</option>
            </select>
          </div>
          <div className="h-[330px]">
            {candleLoading ? (
              <div className="flex h-full items-center justify-center"><LoadingSpinner /></div>
            ) : lineChartData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={lineChartData} margin={{ top: 12, right: 18, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#eef2f7" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} minTickGap={28} />
                  <YAxis tickFormatter={(value) => `${INR_SYMBOL}${Number(value).toLocaleString('en-IN')}`} tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} width={78} />
                  <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} labelClassName="font-semibold" contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={3} fill="url(#revenueFill)" activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart label="No revenue data for this period" />
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-soft">
          <h2 className="text-lg font-bold text-gray-950">Today&apos;s Activity</h2>
          <p className="mb-5 text-sm text-gray-500">Operational pulse for today</p>
          <div className="space-y-3">
            <ActivityCard title="Check-ins" helper="Guests arriving" value={overview?.today?.check_ins || 0} icon={UserCheck} tone="blue" />
            <ActivityCard title="Check-outs" helper="Guests leaving" value={overview?.today?.check_outs || 0} icon={CheckCircle2} tone="green" />
            <ActivityCard title="Occupied" helper="Currently booked villas" value={overview?.today?.currently_booked || 0} icon={Building2} tone="amber" />
          </div>
          <div className="mt-5 rounded-xl bg-gray-950 p-4 text-white">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Clock className="h-4 w-4" />
              Current month period
            </div>
            <div className="mt-2 text-sm font-semibold">
              {overview?.period?.month_start ? format(new Date(overview.period.month_start), 'dd MMM') : 'Month start'} - {overview?.period?.month_end ? format(new Date(overview.period.month_end), 'dd MMM yyyy') : 'Month end'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-soft xl:col-span-2">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-950">Villa Revenue This Month</h2>
              <p className="text-sm text-gray-500">All villas, ranked by current month revenue</p>
            </div>
            <div className="rounded-xl bg-emerald-50 px-3 py-2 text-right">
              <div className="text-xs font-semibold text-emerald-700">Month Total</div>
              <div className="text-sm font-bold text-emerald-900">{formatCurrency(monthTotal)}</div>
            </div>
          </div>
          <div className="space-y-4">
            {villaRevenue.map((villa, index) => {
              const revenue = parseAmount(villa.revenue_this_month)
              const width = monthTotal > 0 ? Math.max((revenue / monthTotal) * 100, revenue > 0 ? 8 : 0) : 0

              return (
                <div key={villa.villa_id} className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 transition hover:bg-white hover:shadow-card">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold text-gray-950">{villa.villa_name}</div>
                      <div className="mt-1 text-xs text-gray-500">{villa.bookings_this_month || 0} bookings this month</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-950">{formatCurrency(revenue)}</div>
                      <div className="text-xs capitalize text-gray-500">{villa.status}</div>
                    </div>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${width}%`, backgroundColor: VILLA_COLORS[index % VILLA_COLORS.length] }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-soft">
          <h2 className="text-lg font-bold text-gray-950">Revenue Split</h2>
          <p className="mb-5 text-sm text-gray-500">Current month by villa</p>
          <div className="h-[260px]">
            {pieData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={4}>
                    {pieData.map((entry, index) => (
                      <Cell key={entry.name} fill={VILLA_COLORS[index % VILLA_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart label="No villa revenue this month" />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-soft xl:col-span-2">
          <h2 className="text-lg font-bold text-gray-950">Six Month Performance</h2>
          <p className="mb-5 text-sm text-gray-500">Revenue and booking volume by month</p>
          <div className="h-[300px]">
            {monthlyRevenueLoading ? (
              <div className="flex h-full items-center justify-center"><LoadingSpinner /></div>
            ) : monthlyChartData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyChartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#eef2f7" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                  <YAxis tickFormatter={(value) => `${INR_SYMBOL}${Number(value).toLocaleString('en-IN')}`} tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} width={78} />
                  <Tooltip formatter={(value, name) => (name === 'revenue' ? [formatCurrency(value), 'Revenue'] : [value, 'Bookings'])} contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb' }} />
                  <Bar dataKey="revenue" fill="#2563eb" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart label="No monthly revenue data" />
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-soft">
          <h2 className="text-lg font-bold text-gray-950">Recent Bookings</h2>
          <p className="mb-5 text-sm text-gray-500">Latest activity in the system</p>
          {bookingsLoading ? (
            <div className="flex h-64 items-center justify-center"><LoadingSpinner /></div>
          ) : recentBookings?.length ? (
            <div className="space-y-3">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="rounded-xl border border-gray-100 p-3 transition hover:bg-gray-50">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold text-gray-950">{booking.client_name}</div>
                      <div className="truncate text-xs text-gray-500">{booking.villa?.name}</div>
                    </div>
                    <div className="text-sm font-bold text-gray-900">{formatCurrency(booking.total_payment)}</div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <span>{format(new Date(booking.check_in), 'dd MMM')} - {format(new Date(booking.check_out), 'dd MMM')}</span>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700">{booking.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyChart label="No recent bookings" />
          )}
        </div>
      </div>
    </div>
  )
}
