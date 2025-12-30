import { useState } from 'react'
import { useCreateVillaMutation } from '@/services/api/villaApi'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import toast from 'react-hot-toast'

export default function VillaModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    max_guests: 1,
    price_per_night: '',
    status: 'active',
  })

  const [createVilla, { isLoading }] = useCreateVillaMutation()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      await createVilla({
        name: formData.name,
        location: formData.location,
        description: formData.description,
        max_guests: parseInt(formData.max_guests),
        price_per_night: parseFloat(formData.price_per_night),
        status: formData.status,
      }).unwrap()

      toast.success('Villa created successfully!')
      onClose()
      // Reset form
      setFormData({
        name: '',
        location: '',
        description: '',
        max_guests: 1,
        price_per_night: '',
        status: 'active',
      })
    } catch (error) {
      console.error('Villa creation error:', error)
      toast.error(error?.data?.detail || 'Failed to create villa')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Villa" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Villa Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Villa Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="input"
            placeholder="Enter villa name"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="input"
            placeholder="Enter location"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="input"
            placeholder="Enter villa description"
          />
        </div>

        {/* Max Guests and Price */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Guests <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="max_guests"
              value={formData.max_guests}
              onChange={handleChange}
              required
              min="1"
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price per Night (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="price_per_night"
              value={formData.price_per_night}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="input"
              placeholder="5000.00"
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="input"
          >
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isLoading}
          >
            Create Villa
          </Button>
        </div>
      </form>
    </Modal>
  )
}
