import {
  HomeIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline'
import StatCard from '@/components/common/StatCard'
import Card from '@/components/common/Card'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import Badge from '@/components/common/Badge'
import {
  useGetDashboardOverviewQuery,
  useGetRecentBookingsQuery,
} from '@/services/api/bookingApi'
import { format } from 'date-fns'

export default function Dashboard() {
  const { data: overview, isLoading: overviewLoading } = useGetDashboardOverviewQuery()
  const { data: recentBookings, isLoading: bookingsLoading } = useGetRecentBookingsQuery(5)

  if (overviewLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-600">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          title="Total Villas"
          value={overview?.villas?.total || 0}
          icon={BuildingOfficeIcon}
          color="blue"
        />
        <StatCard
          title="Active Villas"
          value={overview?.villas?.active || 0}
          icon={HomeIcon}
          color="green"
        />
        <StatCard
          title="Occupancy Rate"
          value={`${overview?.villas?.occupancy_rate || 0}%`}
          icon={ChartBarIcon}
          color="purple"
        />
        <StatCard
          title="Total Bookings"
          value={overview?.bookings?.total || 0}
          icon={CalendarIcon}
          color="yellow"
        />
      </div>

      {/* Today's Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <Card title="Today's Check-ins" className="text-center">
          <div className="py-4">
            <div className="text-4xl font-bold text-primary-600">
              {overview?.today?.check_ins || 0}
            </div>
            <p className="mt-2 text-sm text-gray-600">Guests arriving today</p>
          </div>
        </Card>

        <Card title="Today's Check-outs" className="text-center">
          <div className="py-4">
            <div className="text-4xl font-bold text-green-600">
              {overview?.today?.check_outs || 0}
            </div>
            <p className="mt-2 text-sm text-gray-600">Guests departing today</p>
          </div>
        </Card>

        <Card title="Currently Booked" className="text-center">
          <div className="py-4">
            <div className="text-4xl font-bold text-purple-600">
              {overview?.today?.currently_booked || 0}
            </div>
            <p className="mt-2 text-sm text-gray-600">Villas occupied now</p>
          </div>
        </Card>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <Card title="Total Revenue">
          <div className="mt-4">
            <div className="text-3xl font-bold text-gray-900">
              ₹{parseFloat(overview?.revenue?.total || 0).toLocaleString()}
            </div>
            <p className="mt-2 text-sm text-gray-600">All-time revenue</p>
          </div>
        </Card>

        <Card title="This Month">
          <div className="mt-4">
            <div className="text-3xl font-bold text-gray-900">
              ₹{parseFloat(overview?.revenue?.this_month || 0).toLocaleString()}
            </div>
            <p className="mt-2 text-sm text-gray-600">Revenue this month</p>
          </div>
        </Card>

        <Card title="Average Booking">
          <div className="mt-4">
            <div className="text-3xl font-bold text-gray-900">
              ₹{overview?.revenue?.average_per_booking?.toLocaleString() || 0}
            </div>
            <p className="mt-2 text-sm text-gray-600">Per booking average</p>
          </div>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card title="Recent Bookings">
        {bookingsLoading ? (
          <LoadingSpinner />
        ) : recentBookings && recentBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Villa</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-in</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {booking.villa?.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {booking.client_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {format(new Date(booking.check_in), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={booking.status === 'booked' ? 'success' : 'info'}>
                        {booking.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      ₹{booking.total_amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No recent bookings</p>
        )}
      </Card>
    </div>
  )
}
