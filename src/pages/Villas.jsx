import { useState } from 'react'
import { PlusIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'
import { useGetVillasQuery, useDeleteVillaMutation } from '@/services/api/villaApi'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import Badge from '@/components/common/Badge'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import VillaModal from '@/components/villa/VillaModal'
import toast from 'react-hot-toast'

export default function Villas() {
  const [statusFilter, setStatusFilter] = useState('')
  const [villaModalOpen, setVillaModalOpen] = useState(false)
  const { data, isLoading } = useGetVillasQuery({ status: statusFilter })
  const [deleteVilla] = useDeleteVillaMutation()

  const villas = data?.results || data || []

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteVilla(id).unwrap()
        toast.success('Villa deleted successfully')
      } catch (error) {
        toast.error('Failed to delete villa')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Villas</h1>
          <p className="mt-1 text-gray-600">Manage your villa properties</p>
        </div>
        <Button variant="primary" icon={PlusIcon} onClick={() => setVillaModalOpen(true)}>
          Add Villa
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="">All Villas</option>
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Villas Grid */}
      {villas.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No villas found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new villa.</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {villas.map((villa) => (
            <Card key={villa.id}>
              {/* Villa Image Placeholder */}
              <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-purple-100 rounded-lg mb-4 flex items-center justify-center">
                <BuildingOfficeIcon className="w-16 h-16 text-primary-600" />
              </div>

              {/* Villa Info */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">{villa.name}</h3>
                  <Badge variant={villa.status === 'active' ? 'success' : 'warning'}>
                    {villa.status}
                  </Badge>
                </div>

                <p className="text-sm text-gray-600">📍 {villa.location}</p>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500">Max Guests</p>
                    <p className="text-sm font-semibold text-gray-900">{villa.max_guests}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Price/Night</p>
                    <p className="text-sm font-semibold text-gray-900">₹{villa.price_per_night}</p>
                  </div>
                </div>

                {villa.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{villa.description}</p>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-3">
                  <Button variant="primary" size="sm" className="flex-1">
                    View
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(villa.id, villa.name)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Villa Modal */}
      <VillaModal
        isOpen={villaModalOpen}
        onClose={() => setVillaModalOpen(false)}
      />
    </div>
  )
}
