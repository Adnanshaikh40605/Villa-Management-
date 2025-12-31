import {
  Banknote,
  Users,
  CalendarCheck,
  Percent,
  TrendingUp,
  TrendingDown,
  Building,
  UserCheck,
  CheckCircle2,
  Bell,
  Search,
  MoreVertical,
  CalendarRange
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import Card from '@/components/common/Card'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import {
  useGetDashboardOverviewQuery,
  useGetRecentBookingsQuery,
} from '@/services/api/bookingApi'
import { format } from 'date-fns'

// Custom Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, trend, trendValue }) => {
  const colorStyles = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl ${colorStyles[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        <p className="text-sm text-gray-500 mt-1">{title}</p>
      </div>
    </div>
  )
}

// Activity Card Component
const ActivityCard = ({ title, value, subtitle, color }) => {
  const colors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600'
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
      <h3 className="text-gray-500 font-medium text-sm uppercase tracking-wider">{title}</h3>
      <div className={`mt-4 text-4xl font-bold ${colors[color]}`}>
        {value}
      </div>
      <p className="mt-2 text-sm text-gray-400">{subtitle}</p>
    </div>
  )
}

export default function Dashboard() {
  const { data: overview, isLoading: overviewLoading } = useGetDashboardOverviewQuery()
  const { data: recentBookings, isLoading: bookingsLoading } = useGetRecentBookingsQuery(5)

  // Mock data for the chart (replace with real API data if available)
  const chartData = [
    { name: 'Jan', revenue: 4000, bookings: 24 },
    { name: 'Feb', revenue: 3000, bookings: 18 },
    { name: 'Mar', revenue: 2000, bookings: 12 },
    { name: 'Apr', revenue: 2780, bookings: 20 },
    { name: 'May', revenue: 1890, bookings: 15 },
    { name: 'Jun', revenue: 2390, bookings: 18 },
  ]

  if (overviewLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-gray-500">Welcome back! Here's what's happening today.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
          <button className="relative p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Bell className="w-5 h-5 text-gray-500" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
            AD
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`₹${parseFloat(overview?.revenue?.total || 0).toLocaleString()}`}
          icon={Banknote}
          color="blue"
          trend="up"
          trendValue="12.5%"
        />
        <StatCard
          title="Total Customers"
          value={overview?.bookings?.total_clients || 0} // Assuming API returns this or placeholder
          icon={Users}
          color="green"
          trend="up"
          trendValue="8.2%"
        />
        <StatCard
          title="Total Bookings"
          value={overview?.bookings?.total || 0}
          icon={CalendarCheck}
          color="purple"
          trend="up"
          trendValue="2.4%"
        />
        <StatCard
          title="Occupancy Rate"
          value={`${overview?.villas?.occupancy_rate || 0}%`}
          icon={Percent}
          color="orange"
          trend="down"
          trendValue="4.1%"
        />
      </div>

      {/* Mid Section: Activity & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Activity Column */}
        <div className="space-y-6">
          <ActivityCard
            title="Today's Check-ins"
            value={overview?.today?.check_ins || 0}
            subtitle="Guests arriving today"
            color="blue"
          />
          <ActivityCard
            title="Today's Check-outs"
            value={overview?.today?.check_outs || 0}
            subtitle="Guests departing today"
            color="green"
          />
          <ActivityCard
            title="Currently Booked"
            value={overview?.today?.currently_booked || 0}
            subtitle="Properties occupied now"
            color="purple"
          />
        </div>

        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Revenue Overview</h3>
              <p className="text-sm text-gray-500">Monthly revenue vs bookings performance</p>
            </div>
          </div>
          <div className="h-[256px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6B7280', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6B7280', fontSize: 12 }} 
                />
                <Tooltip 
                  cursor={{ fill: '#F9FAFB' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar 
                  dataKey="revenue" 
                  name="Revenue" 
                  fill="#3B82F6" 
                  radius={[4, 4, 0, 0]} 
                  barSize={20}
                />
                <Bar 
                  dataKey="bookings" 
                  name="Bookings" 
                  fill="#A855F7" 
                  radius={[4, 4, 0, 0]} 
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Bookings Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Recent Bookings</h3>
          <button className="text-sm text-blue-600 font-medium hover:text-blue-700">View All</button>
        </div>
        
        {bookingsLoading ? (
            <div className="p-12"><LoadingSpinner /></div>
          ) : recentBookings && recentBookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 relative"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {recentBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                            <Building className="h-5 w-5" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{booking.villa?.name}</div>
                            <div className="text-xs text-gray-500">{booking.villa?.location || 'Main Location'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 mr-3">
                            <UserCheck className="h-4 w-4" />
                          </div>
                          <div className="text-sm text-gray-900">{booking.client_name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{format(new Date(booking.check_in), 'MMM dd')} - {format(new Date(booking.check_out), 'MMM dd, yyyy')}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${booking.status === 'booked' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {booking.status === 'booked' ? 'Confirmed' : booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{booking.total_amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreVertical className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <CalendarRange className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No recent bookings</h3>
              <p className="text-gray-500 max-w-sm mt-1">There haven't been any new bookings recently. Check back later or create a new booking.</p>
            </div>
          )}
      </div>
    </div>
  )
}
