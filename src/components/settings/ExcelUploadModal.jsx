import { useState, useRef } from 'react'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import * as xlsx from 'xlsx'
import toast from 'react-hot-toast'
import { useUpdateVillaMutation } from '@/services/api/villaApi'
import { DocumentArrowUpIcon } from '@heroicons/react/24/outline'

export default function ExcelUploadModal({ isOpen, onClose, villas }) {
  const [file, setFile] = useState(null)
  const [headers, setHeaders] = useState([])
  const [excelData, setExcelData] = useState([])
  const [selectedVillaId, setSelectedVillaId] = useState('')
  const [selectedPriceColumn, setSelectedPriceColumn] = useState('')
  const fileInputRef = useRef(null)

  const [updateVilla, { isLoading }] = useUpdateVillaMutation()

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      readExcel(selectedFile)
    }
  }

  const readExcel = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target.result
        const workbook = xlsx.read(data, { type: 'binary', cellDates: true })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const json = xlsx.utils.sheet_to_json(worksheet, { defval: '' })
        
        if (json.length > 0) {
          // Extract headers from the first object keys
          const extractedHeaders = Object.keys(json[0])
          setHeaders(extractedHeaders)
          setExcelData(json)
        } else {
          toast.error("Excel file is empty")
        }
      } catch (error) {
        toast.error("Error reading Excel file")
        console.error(error)
      }
    }
    reader.readAsBinaryString(file)
  }

  const handleReset = () => {
    setFile(null)
    setHeaders([])
    setExcelData([])
    setSelectedVillaId('')
    setSelectedPriceColumn('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatDate = (val) => {
    try {
        if (!val) return null
        if (val instanceof Date) {
            const offset = val.getTimezoneOffset()
            const d = new Date(val.getTime() - (offset*60*1000))
            return d.toISOString().split('T')[0]
        }
        // Handle string formatted dates, e.g. "2026-01-26"
        const d = new Date(val)
        if (isNaN(d.getTime())) return null
        return d.toISOString().split('T')[0]
    } catch (e) {
        return null
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedVillaId) {
      toast.error('Please select a Villa')
      return
    }
    if (!selectedPriceColumn) {
      toast.error('Please select a price column from the Excel file')
      return
    }

    const villaToUpdate = villas.find(v => v.id.toString() === selectedVillaId)
    if (!villaToUpdate) {
      toast.error('Villa not found')
      return
    }

    try {
      // Create new special prices from Excel
      const newPrices = []
      excelData.forEach(row => {
        // Assume Excel has a column containing "Date" or "date"
        const dateKey = headers.find(h => h.toLowerCase() === 'date')
        const nameKey = headers.find(h => h.toLowerCase() === 'occasion' || h.toLowerCase() === 'name' || h.toLowerCase() === 'title')
        
        let dateVal = dateKey ? row[dateKey] : null
        let nameVal = nameKey ? row[nameKey] : 'Special Day'
        let priceVal = row[selectedPriceColumn]

        if (dateVal && priceVal) {
          const formattedDate = formatDate(dateVal)
          if (formattedDate) {
             const parsedPrice = parseFloat(priceVal)
             if (!isNaN(parsedPrice) && parsedPrice > 0) {
                 newPrices.push({
                   start_date: formattedDate,
                   end_date: formattedDate,
                   price: parsedPrice,
                   name: nameVal || 'Special Day'
                 })
             }
          }
        }
      })

      if (newPrices.length === 0) {
        toast.error("No valid dates and prices found in the Excel file.")
        return
      }

      // Merge new prices with existing special_prices
      // Overwrite if same date range exists, otherwise append
      const existingPrices = [...(villaToUpdate.special_prices || [])]
      
      newPrices.forEach(np => {
        const existingIdx = existingPrices.findIndex(
          ep => ep.start_date === np.start_date && ep.end_date === np.end_date
        )
        if (existingIdx !== -1) {
          existingPrices[existingIdx] = np
        } else {
          existingPrices.push(np)
        }
      })

      await updateVilla({
         id: villaToUpdate.id,
         // we only need name, location, max_guests, price_per_night, etc, as it's a PATCH.
         special_prices: existingPrices
      }).unwrap()

      toast.success('Special days updated successfully!')
      handleReset()
      onClose()
      
    } catch (error) {
      console.error('Update failed:', error)
      toast.error(error?.data?.detail || 'Failed to update special prices')
    }
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Upload Special Days Price (Excel)" size="md">
      <div className="mb-4">
        <p className="text-sm text-gray-500">Upload an Excel file to automatically add or update special day prices for a selected villa.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* File Input */}
        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">Select Excel File <span className="text-red-500">*</span></label>
           <input 
             type="file" 
             accept=".xlsx, .xls, .csv" 
             onChange={handleFileChange}
             ref={fileInputRef}
             className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 border border-gray-300 rounded-md cursor-pointer"
             required
           />
        </div>

        {file && excelData.length > 0 && (
           <>
              {/* Select Villa */}
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Villa <span className="text-red-500">*</span></label>
                  <select 
                     value={selectedVillaId} 
                     onChange={e => setSelectedVillaId(e.target.value)}
                     className="input w-full border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                     required
                  >
                     <option value="">-- Choose a Villa --</option>
                     {villas.map(villa => (
                        <option key={villa.id} value={villa.id}>{villa.name}</option>
                     ))}
                  </select>
              </div>

              {/* Select Price Column */}
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Price Column <span className="text-red-500">*</span></label>
                  <select 
                     value={selectedPriceColumn} 
                     onChange={e => setSelectedPriceColumn(e.target.value)}
                     className="input w-full border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                     required
                  >
                     <option value="">-- Choose Column --</option>
                     {headers.map((header, i) => (
                        <option key={i} value={header}>{header}</option>
                     ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Select the column in your Excel file that contains the prices to apply.</p>
              </div>
           </>
        )}

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
           <Button type="button" variant="secondary" onClick={handleClose}>Cancel</Button>
           <Button type="submit" variant="primary" loading={isLoading} disabled={!file || !selectedVillaId || !selectedPriceColumn}>
              <DocumentArrowUpIcon className="w-5 h-5 mr-1" />
              Upload & Save
           </Button>
        </div>
      </form>
    </Modal>
  )
}
