import { useState } from 'react'
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
  CalendarRange,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  MapPin
} from 'lucide-react'
import Card from '@/components/common/Card'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import RevenueChart from '@/components/dashboard/RevenueChart'
import {
  useGetDashboardOverviewQuery,
  useGetRecentBookingsQuery,
  useGetRevenueCandlesQuery,
} from '@/services/api/bookingApi'
import { format } from 'date-fns'

// Modern Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, trend, trendValue, iconColor }) => {
  const trendColors = {
    up: 'text-emerald-600 bg-emerald-50',
    down: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50'
  }

  // Map icon colors to specific classes if needed, or default to gradients
  const iconBgs = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-indigo-50 text-indigo-600',
    orange: 'bg-orange-50 text-orange-600',
  }

  return (
    <div className="group bg-white rounded-2xl p-5 border border-gray-100 shadow-soft hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className="flex justify-between items-start">
        <div className={`p-3.5 rounded-2xl ${iconBgs[color]} transition-colors`}>
          <Icon className="w-6 h-6" strokeWidth={2.5} />
        </div>
        {trend && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${trendColors[trend]}`}>
            {trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{trendValue}</span>
            </div>
        )}
      </div>
      <div className="mt-5">
        <h3 className="text-3xl font-display font-bold text-gray-900 tracking-tight">{value}</h3>
        <p className="text-sm font-medium text-gray-500 mt-1">{title}</p>
      </div>
    </div>
  )
}

// Activity Item Component
const ActivityItem = ({ title, value, subtitle, color, icon: Icon }) => {
    return (
        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-sm transition-all duration-300 group">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color === 'blue' ? 'bg-blue-100 text-blue-600' : color === 'green' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}>
                    <Icon className="w-6 h-6" strokeWidth={2.5}/>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <h4 className="text-xl font-bold text-gray-900">{value}</h4>
                </div>
            </div>
            {/* Optional subtle indicator arrow or similar */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400">
               <ArrowUpRight className="w-5 h-5"/>
            </div>
        </div>
    )
}

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState('1M')
  const { data: overview, isLoading: overviewLoading } = useGetDashboardOverviewQuery()
  const { data: recentBookings, isLoading: bookingsLoading } = useGetRecentBookingsQuery(5)
  const { data: candleData, isLoading: candleLoading } = useGetRevenueCandlesQuery(timeRange)
  const today = new Date()

  if (overviewLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          {/* Greeting removed as per request */}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group hidden sm:block">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search properties, bookings..." 
              className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 w-72 shadow-sm transition-all"
            />
          </div>
          <button className="relative p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm group">
            <Bell className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse"></span>
          </button>
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
          trendValue="+12.5%"
        />
        <StatCard
          title="Active Clients"
          value={overview?.bookings?.total_clients || 0}
          icon={Users}
          color="green"
          trend="up"
          trendValue="+8.2%"
        />
        <StatCard
          title="Total Bookings"
          value={overview?.bookings?.total || 0}
          icon={CalendarCheck}
          color="purple"
          trend="up"
          trendValue="+3.1%"
        />
        <StatCard
          title="Occupancy Rate"
          value={`${overview?.villas?.occupancy_rate || 0}%`}
          icon={Percent}
          color="orange"
          trend="down"
          trendValue="-2.4%"
        />
      </div>

      {/* Mid Section: Activity & Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="xl:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-soft">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Revenue Overview {timeRange}</h3>
              <p className="text-sm text-gray-500">Comparing revenue performance over time</p>
            </div>
            <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2"
            >
                <option value="7D">Last 7 Days</option>
                <option value="1M">Last Month</option>
                <option value="6M">Last 6 Months</option>
                <option value="1Y">Last Year</option>
            </select>
          </div>
          <div className="h-[350px] w-full">
            {candleLoading ? (
                <div className="flex items-center justify-center h-full">
                    <LoadingSpinner />
                </div>
            ) : (
                <RevenueChart data={candleData} />
            )}
          </div>
        </div>

        {/* Today's Activity Column */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-soft h-full">
             <h3 className="text-lg font-bold text-gray-900 mb-1">Today's Activity</h3>
             <p className="text-sm text-gray-500 mb-6">Summary of daily operations</p>
             
             <div className="space-y-4">
               <ActivityItem
                 title="Check-ins"
                 value={overview?.today?.check_ins || 0}
                 subtitle="Incoming"
                 icon={UserCheck}
                 color="blue"
               />
               <ActivityItem
                 title="Check-outs"
                 value={overview?.today?.check_outs || 0}
                 subtitle="Outgoing"
                 icon={CheckCircle2}
                 color="green"
               />
               <ActivityItem
                 title="Occupied"
                 value={overview?.today?.currently_booked || 0}
                 subtitle="Properties"
                 icon={Building}
                 color="purple"
               />
             </div>
             
             <div className="mt-8 pt-6 border-t border-gray-100">
                <button className="w-full py-3 rounded-xl bg-gray-50 text-gray-600 font-medium text-sm hover:bg-gray-100 hover:text-gray-900 transition-colors flex items-center justify-center gap-2">
                    View Full Calendar <ArrowUpRight className="w-4 h-4"/>
                </button>
             </div>
        </div>
      </div>

      {/* Recent Bookings Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
          <div>
             <h3 className="text-lg font-bold text-gray-900">Recent Bookings</h3>
             <p className="text-sm text-gray-500 mt-1">Latest reservations and their status</p>
          </div>
          <button className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 text-sm font-medium rounded-lg transition-colors border border-gray-200">
             View All Bookings
          </button>
        </div>
        
        {bookingsLoading ? (
            <div className="p-16 flex justify-center"><LoadingSpinner /></div>
          ) : recentBookings && recentBookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Property</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Schedule</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 relative"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 bg-white">
                  {recentBookings.map((booking) => (
                    <tr key={booking.id} className="group hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                            <Building className="h-5 w-5" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-gray-900">{booking.villa?.name}</div>
                            <div className="flex items-center text-xs text-gray-500 mt-0.5">
                                <MapPin className="w-3 h-3 mr-1" />
                                {booking.villa?.location || 'Main Location'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border border-white shadow-sm flex items-center justify-center text-gray-500 mr-3">
                            <span className="text-xs font-bold">{booking.client_name?.charAt(0)}</span>
                          </div>
                          <div className="text-sm font-medium text-gray-900">{booking.client_name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">
                                {format(new Date(booking.check_in), 'MMM dd')} - {format(new Date(booking.check_out), 'MMM dd')}
                            </span>
                            <span className="text-xs text-gray-500">{format(new Date(booking.check_out), 'yyyy')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border 
                          ${booking.status === 'booked' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                              : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                          {booking.status === 'booked' ? 'Confirmed' : booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-gray-900">
                        ₹{parseFloat(booking.total_payment).toLocaleString()}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                        <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-gray-100">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <CalendarRange className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">No recent bookings</h3>
              <p className="text-gray-500 max-w-sm mt-2">There haven't been any new bookings recently. Your dashboard will populate as soon as activity starts.</p>
            </div>
          )}
      </div>
    </div>
  )
}
