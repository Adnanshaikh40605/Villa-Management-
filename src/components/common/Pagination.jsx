import React from 'react'
import { ChevronLeftIcon, ChevronRightIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from '@heroicons/react/24/outline'

export default function Pagination({ 
    currentPage, 
    totalCount, 
    pageSize, 
    onPageChange, 
    className = '' 
}) {
  const totalPages = Math.ceil(totalCount / pageSize)
  
  // if (totalPages <= 1) return null; // Always show pagination for consistency

  // Calculate start and end indices for "Showing X to Y of Z"
  const startResult = (currentPage - 1) * pageSize + 1
  const endResult = Math.min(currentPage * pageSize, totalCount)

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page)
    }
  }

  const handleGoTo = (e) => {
      e.preventDefault()
      const val = parseInt(e.target.elements.goto.value)
      if (val && !isNaN(val)) {
          handlePageChange(val)
          e.target.reset()
      }
  }

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-3 ${className}`}>
        {/* Results Counter */}
        <div className="text-sm text-gray-500 order-2 sm:order-1">
            Showing <span className="font-medium text-gray-900">{startResult}</span> to{' '}
            <span className="font-medium text-gray-900">{endResult}</span> of{' '}
            <span className="font-medium text-gray-900">{totalCount}</span> results
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center gap-2 order-1 sm:order-2">
            {/* First Page */}
            <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                title="First Page"
            >
                <ChevronDoubleLeftIcon className="w-4 h-4 text-gray-600" />
            </button>

            {/* Previous Page */}
            <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                title="Previous Page"
            >
                <ChevronLeftIcon className="w-4 h-4 text-gray-600" />
            </button>

            {/* Current Page Indicator */}
            <span className="bg-primary-600 text-white px-3 py-1.5 rounded text-sm font-medium whitespace-nowrap">
                Page {currentPage} of {totalPages}
            </span>

            {/* Next Page */}
            <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                title="Next Page"
            >
                <ChevronRightIcon className="w-4 h-4 text-gray-600" />
            </button>

            {/* Last Page */}
            <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                title="Last Page"
            >
                <ChevronDoubleRightIcon className="w-4 h-4 text-gray-600" />
            </button>

            {/* Go To Input */}
            <form onSubmit={handleGoTo} className="flex items-center gap-2 ml-2">
                <span className="text-sm text-gray-500 whitespace-nowrap">Go to:</span>
                <input 
                    name="goto"
                    type="number" 
                    min="1" 
                    max={totalPages}
                    className="w-12 px-1 py-1 text-center text-sm border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                    placeholder={currentPage} 
                />
                <button 
                    type="submit" 
                    className="text-xs px-2 py-1 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"
                >
                    Go
                </button>
            </form>
        </div>
    </div>
  )
}
