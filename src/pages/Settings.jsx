import Card from '@/components/common/Card'
import Button from '@/components/common/Button'

export default function Settings() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-gray-600">Manage your account and preferences</p>
      </div>

      {/* Profile Settings */}
      <Card title="Profile Information">
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input type="text" className="input" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input type="email" className="input" placeholder="john@example.com" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input type="tel" className="input" placeholder="+91 9876543210" />
          </div>
          <Button variant="primary">Save Changes</Button>
        </form>
      </Card>

      {/* Notification Settings */}
      <Card title="Notifications">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-600">Receive booking updates via email</p>
            </div>
            <input type="checkbox" className="w-5 h-5 text-primary-600 rounded" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Push Notifications</p>
              <p className="text-sm text-gray-600">Receive push notifications for important updates</p>
            </div>
            <input type="checkbox" className="w-5 h-5 text-primary-600 rounded" />
          </div>
        </div>
      </Card>

      {/* Change Password */}
      <Card title="Change Password">
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <input type="password" className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input type="password" className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input type="password" className="input" />
          </div>
          <Button variant="primary">Update Password</Button>
        </form>
      </Card>
    </div>
  )
}
