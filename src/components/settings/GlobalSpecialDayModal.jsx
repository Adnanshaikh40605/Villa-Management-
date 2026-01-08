import { useState } from 'react'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import toast from 'react-hot-toast'
import { useCreateGlobalSpecialDayMutation } from '@/services/api/villaApi'

export default function GlobalSpecialDayModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    day: '',
    month: '',
    year: ''
  })

  // We need to add this mutation to villaApi.js first!
  // Assuming it will be there or I will add it next.
  const [createSpecialDay, { isLoading }] = useCreateGlobalSpecialDayMutation()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
        await createSpecialDay({
            name: formData.name,
            day: parseInt(formData.day),
            month: parseInt(formData.month),
            year: formData.year ? parseInt(formData.year) : null
        }).unwrap()
        toast.success("Global special day created!")
        setFormData({ name: '', day: '', month: '', year: '' })
        onClose()
    } catch (error) {
        console.error("Failed to create special day:", error)
        toast.error("Failed to create special day")
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Special Day" size="md">
        <div className="mb-4">
            <p className="text-sm text-gray-500">Create a new global special day</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
             {/* Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    required 
                    placeholder="Enter special day name" 
                    className="input w-full border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500" 
                />
            </div>

            <div className="grid grid-cols-3 gap-4">
                 {/* Day */}
                <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Day <span className="text-red-500">*</span></label>
                     <input 
                        type="number" 
                        name="day" 
                        value={formData.day} 
                        onChange={handleChange} 
                        required 
                        min="1" max="31" 
                        placeholder="Day" 
                        className="input w-full border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500" 
                    />
                </div>
                 {/* Month */}
                 <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Month <span className="text-red-500">*</span></label>
                     <select 
                        name="month" 
                        value={formData.month} 
                        onChange={handleChange} 
                        required 
                        className="input w-full border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                     >
                         <option value="">Month</option>
                         {Array.from({ length: 12 }, (_, i) => (
                             <option key={i + 1} value={i + 1}>{i + 1}</option>
                         ))}
                     </select>
                </div>
                 {/* Year */}
                 <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                     <input 
                        type="number" 
                        name="year" 
                        value={formData.year} 
                        onChange={handleChange} 
                        placeholder="Year (optional)" 
                        className="input w-full border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500" 
                    />
                </div>
            </div>

             <div className="flex justify-end gap-3 pt-6">
                <Button type="button" variant="secondary" onClick={onClose} className="bg-gray-200 text-gray-700 hover:bg-gray-300">Cancel</Button>
                <Button type="submit" variant="primary" loading={isLoading} className="bg-primary-600 hover:bg-primary-700 text-white">Create</Button>
            </div>
        </form>
    </Modal>
  )
}
