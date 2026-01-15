import { useState, useEffect } from 'react'
import { useCreateVillaMutation, useUpdateVillaMutation } from '@/services/api/villaApi'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import toast from 'react-hot-toast'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'

const WEEKEND_DAYS = [
    { label: 'Friday', value: 4 },
    { label: 'Saturday', value: 5 },
    { label: 'Sunday', value: 6 }
]

export default function VillaModal({ isOpen, onClose, villa = null }) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    max_guests: 1,
    price_per_night: '',
    weekend_price: '',
    special_day_price: '',
    weekend_days: [],
    status: 'active',
  })

  // State for new special price entry (Range based)
  const [specialPrices, setSpecialPrices] = useState([])
  const [newSpecialPrice, setNewSpecialPrice] = useState({ start_date: '', end_date: '', price: '', name: '' })

  // Pre-fill form when editing
  useEffect(() => {
    if (villa) {
       setFormData({
         name: villa.name || '',
         location: villa.location || '',
         description: villa.description || '',
         max_guests: villa.max_guests || 1,
         price_per_night: villa.price_per_night ? villa.price_per_night.toString() : '',
         weekend_price: villa.weekend_price ? villa.weekend_price.toString() : '',
         special_day_price: villa.special_day_price ? villa.special_day_price.toString() : '',
         weekend_days: villa.weekend_days || [],
         status: villa.status || 'active',
         order: villa.order || 0
       })
       // Map received special_prices to local state if available
       setSpecialPrices(villa.special_prices || [])
    } else {
       // Reset for create mode
       setFormData({
        name: '',
        location: '',
        description: '',
        max_guests: 1,
        price_per_night: '',
        weekend_price: '',
        special_day_price: '',
        weekend_days: [],
        status: 'active',
        order: 0,
       })
       setSpecialPrices([])
    }
  }, [villa, isOpen])

  const [createVilla, { isLoading: isCreating }] = useCreateVillaMutation()
  const [updateVilla, { isLoading: isUpdating }] = useUpdateVillaMutation()

  const isLoading = isCreating || isUpdating

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleWeekendDayChange = (dayValue) => {
      setFormData(prev => {
          const days = prev.weekend_days.includes(dayValue)
            ? prev.weekend_days.filter(d => d !== dayValue)
            : [...prev.weekend_days, dayValue]
          return { ...prev, weekend_days: days }
      })
  }

  const handleAddSpecialPrice = () => {
      const { start_date, end_date, price } = newSpecialPrice
      if (!start_date || !end_date || !price) {
          toast.error("Start Date, End Date and Price are required")
          return
      }
      if (new Date(start_date) > new Date(end_date)) {
          toast.error("Start Date cannot be after End Date")
          return
      }
      
      setSpecialPrices([...specialPrices, { ...newSpecialPrice }])
      setNewSpecialPrice({ start_date: '', end_date: '', price: '', name: '' })
  }

  const handleRemoveSpecialPrice = (index) => {
      setSpecialPrices(specialPrices.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      // Check if there is a pending special price in the inputs that hasn't been added
      let currentSpecialPrices = [...specialPrices]
      const { start_date, end_date, price } = newSpecialPrice
      
      if (start_date && end_date && price) {
          if (new Date(start_date) <= new Date(newSpecialPrice.end_date)) {
              currentSpecialPrices.push({ ...newSpecialPrice })
              toast("Included unsaved special price", { icon: 'ℹ️' })
          } else {
             toast.error("Ignored invalid pending special price (Start date after End date)")
          }
      }

      const payload = {
        name: formData.name,
        location: formData.location,
        description: formData.description,
        max_guests: parseInt(formData.max_guests),
        price_per_night: parseFloat(formData.price_per_night),
        weekend_price: formData.weekend_price ? parseFloat(formData.weekend_price) : null,
        special_day_price: formData.special_day_price ? parseFloat(formData.special_day_price) : null,
        weekend_days: formData.weekend_days,
        status: formData.status,
        order: parseInt(formData.order) || 0,
        special_prices: currentSpecialPrices.map(sp => ({
            ...sp, 
            price: parseFloat(sp.price)
        }))
      }

      if (villa) {
          await updateVilla({ id: villa.id, ...payload }).unwrap()
          toast.success('Villa updated successfully!')
      } else {
          await createVilla(payload).unwrap()
          toast.success('Villa created successfully!')
      }

      onClose()
      // Reset pending state
      setNewSpecialPrice({ start_date: '', end_date: '', price: '', name: '' })
    } catch (error) {
      console.error('Villa save error:', error)
      toast.error(error?.data?.detail || `Failed to ${villa ? 'update' : 'create'} villa`)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={villa ? "Edit Villa" : "Add New Villa"} size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Info Section */}
        <div className="space-y-4">
            <h4 className="text-md font-semibold text-gray-900 border-b pb-1">Core Details</h4>
            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Villa Name <span className="text-red-500">*</span></label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required className="input" placeholder="Enter villa name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location <span className="text-red-500">*</span></label>
                  <input type="text" name="location" value={formData.location} onChange={handleChange} required className="input" placeholder="Enter location" />
                </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="2" className="input" placeholder="Enter villa description" />
            </div>

             <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status <span className="text-red-500">*</span></label>
                    <select name="status" value={formData.status} onChange={handleChange} className="input">
                        <option value="active">Active</option>
                        <option value="maintenance">Maintenance</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Guests <span className="text-red-500">*</span></label>
                    <input type="number" name="max_guests" value={formData.max_guests} onChange={handleChange} required min="1" className="input" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                    <input type="number" name="order" value={formData.order} onChange={handleChange} min="0" className="input" placeholder="0" />
                </div>
            </div>
        </div>

        {/* Pricing Section */}
        <div className="space-y-4">
             <h4 className="text-md font-semibold text-gray-900 border-b pb-1">Pricing Configuration</h4>
             
             {/* Prices */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Base Price / Night (₹) <span className="text-red-500">*</span></label>
                    <input type="number" name="price_per_night" value={formData.price_per_night} onChange={handleChange} required min="0" step="0.01" className="input" placeholder="5000.00" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Weekend Price / Night (₹)</label>
                    <input type="number" name="weekend_price" value={formData.weekend_price} onChange={handleChange} min="0" step="0.01" className="input" placeholder="Optional (e.g. 7000.00)" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Special Day Price / Night (₹)</label>
                    <input type="number" name="special_day_price" value={formData.special_day_price} onChange={handleChange} min="0" step="0.01" className="input" placeholder="Optional (e.g. 9000.00)" />
                </div>
             </div>

             {/* Weekend Days Selection */}
             <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Weekend Days Definition</label>
                 <div className="flex gap-4">
                     {WEEKEND_DAYS.map(day => (
                         <label key={day.value} className="inline-flex items-center">
                             <input 
                                type="checkbox" 
                                className="form-checkbox h-4 w-4 text-primary-600 rounded border-gray-300" 
                                checked={formData.weekend_days.includes(day.value)}
                                onChange={() => handleWeekendDayChange(day.value)}
                             />
                             <span className="ml-2 text-sm text-gray-700">{day.label}</span>
                         </label>
                     ))}
                 </div>
                 <p className="text-xs text-gray-500 mt-1">Select days considered as "weekend" for this villa.</p>
             </div>
        </div>

        {/* Special Days Section */}
        <div className="space-y-4">
            <h4 className="text-md font-semibold text-gray-900 border-b pb-1">Special Day Pricing (Bulk Add)</h4>
             
             {/* Add New Special Price Range */}
             <div className="bg-gray-50/50 p-4 rounded-lg border border-gray-100 space-y-4 md:space-y-0 md:flex md:gap-4 md:items-end">
                 <div className="flex-1">
                     <label className="block text-sm text-gray-600 mb-1.5 font-medium">Start Date</label>
                     <input 
                        type="date" 
                        value={newSpecialPrice.start_date} 
                        onChange={e => setNewSpecialPrice({...newSpecialPrice, start_date: e.target.value})} 
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-2 text-sm" 
                    />
                 </div>
                 <div className="flex-1">
                     <label className="block text-sm text-gray-600 mb-1.5 font-medium">End Date</label>
                     <input 
                        type="date" 
                        value={newSpecialPrice.end_date} 
                        onChange={e => setNewSpecialPrice({...newSpecialPrice, end_date: e.target.value})} 
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-2 text-sm" 
                     />
                 </div>
                 <div className="flex-1">
                     <label className="block text-sm text-gray-600 mb-1.5 font-medium">Price (₹)</label>
                     <input 
                        type="number" 
                        placeholder="Price" 
                        value={newSpecialPrice.price} 
                        onChange={e => setNewSpecialPrice({...newSpecialPrice, price: e.target.value})} 
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-2 text-sm" 
                    />
                 </div>
                 <div className="flex-[1.5]">
                     <label className="block text-sm text-gray-600 mb-1.5 font-medium">Name (Optional)</label>
                     <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="e.g. Season" 
                            value={newSpecialPrice.name} 
                            onChange={e => setNewSpecialPrice({...newSpecialPrice, name: e.target.value})} 
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-2 text-sm" 
                        />
                        <button 
                            type="button" 
                            onClick={handleAddSpecialPrice} 
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 whitespace-nowrap"
                        >
                            <PlusIcon className="h-4 w-4 mr-1" /> Add
                        </button>
                     </div>
                 </div>
             </div>

             {/* List of Special Prices */}
             {specialPrices.length > 0 && (
                 <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                     <table className="min-w-full divide-y divide-gray-200">
                         <thead className="bg-gray-50">
                             <tr>
                                 <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Range</th>
                                 <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                                 <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                                 <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                             </tr>
                         </thead>
                         <tbody className="bg-white divide-y divide-gray-200">
                             {specialPrices.map((sp, idx) => (
                                 <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                     <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                                         {sp.start_date} <span className="text-gray-400 mx-2">to</span> {sp.end_date}
                                     </td>
                                     <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-semibold">₹{sp.price}</td>
                                     <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{sp.name || '-'}</td>
                                     <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                         <button type="button" onClick={() => handleRemoveSpecialPrice(idx)} className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded">
                                             <TrashIcon className="h-4 w-4" />
                                         </button>
                                     </td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
             )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" loading={isLoading}>
            {villa ? 'Update Villa' : 'Create Villa'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
