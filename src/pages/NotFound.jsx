import { Link } from 'react-router-dom'
import Button from '@/components/common/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary-600">404</h1>
        <h2 className="mt-4 text-3xl font-bold text-gray-900">Page Not Found</h2>
        <p className="mt-2 text-gray-600">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8">
          <Link to="/">
            <Button variant="primary" size="lg">
              Go Back Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
