import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  useGetRevenueChartQuery,
  useGetVillaPerformanceQuery,
  useGetBookingSourcesQuery,
} from '@/services/api/bookingApi'
import Card from '@/components/common/Card'
import LoadingSpinner from '@/components/common/LoadingSpinner'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function Analytics() {
  const { data: revenueData, isLoading: revenueLoading } = useGetRevenueChartQuery(6)
  const { data: performanceData, isLoading: performanceLoading } = useGetVillaPerformanceQuery()
  const { data: sourcesData, isLoading: sourcesLoading } = useGetBookingSourcesQuery()

  if (revenueLoading || performanceLoading || sourcesLoading) {
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
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-1 text-gray-600">Detailed insights and performance metrics</p>
      </div>

      {/* Revenue Trend Chart */}
      <Card title="Revenue Trend (Last 6 Months)">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
                name="Revenue (₹)"
              />
              <Line
                type="monotone"
                dataKey="bookings"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
                name="Bookings"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Villa Performance */}
      <Card title="Villa Performance">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData?.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="villa_name" stroke="#6b7280" angle={-45} textAnchor="end" height={100} />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="total_revenue" fill="#3b82f6" name="Revenue (₹)" />
              <Bar dataKey="total_bookings" fill="#10b981" name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Booking Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Booking Sources">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourcesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ source_display, percentage }) => `${source_display}: ${percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {sourcesData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Source Breakdown">
          <div className="space-y-4">
            {sourcesData?.map((source, index) => (
              <div key={source.source} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-sm font-medium text-gray-900">
                    {source.source_display}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">{source.count}</div>
                  <div className="text-xs text-gray-500">{source.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Performance Table */}
      <Card title="Top Performing Villas">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Villa</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Bookings</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Revenue</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nights Booked</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {performanceData?.slice(0, 10).map((villa, index) => (
                <tr key={villa.villa_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{index + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{villa.villa_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{villa.total_bookings}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                    ₹{villa.total_revenue.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{villa.total_nights_booked}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{villa.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
