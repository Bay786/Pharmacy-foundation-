import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { Search, Package, X } from 'lucide-react'

const MedicineSearchBar = forwardRef(({ medicines, onMedicineSelect, selectedMedicine, customerType }, ref) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredMedicines, setFilteredMedicines] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [isSelected, setIsSelected] = useState(false) // Track if a medicine is selected
  const searchRef = useRef(null)
  const dropdownRef = useRef(null)

  // Expose clearSearch function to parent component
  useImperativeHandle(ref, () => ({
    clearSearch: () => {
      setSearchTerm('')
      setFilteredMedicines([])
      setShowDropdown(false)
      setHighlightedIndex(-1)
      setIsSelected(false)
      if (onMedicineSelect) {
        onMedicineSelect(null) // Clear selected medicine in parent
      }
    }
  }))

  // Fuzzy search function
  const fuzzySearch = (searchTerm, text) => {
    const search = searchTerm.toLowerCase()
    const target = text.toLowerCase()
    
    // Exact match gets highest priority
    if (target.includes(search)) {
      return { score: 100, match: true }
    }
    
    // Partial match at the beginning gets high priority
    if (target.startsWith(search)) {
      return { score: 90, match: true }
    }
    
    // Check if all characters of search term exist in order (fuzzy match)
    let searchIndex = 0
    let score = 0
    let consecutiveMatches = 0
    
    for (let i = 0; i < target.length && searchIndex < search.length; i++) {
      if (target[i] === search[searchIndex]) {
        searchIndex++
        consecutiveMatches++
        score += 10 + consecutiveMatches // Bonus for consecutive matches
      } else {
        consecutiveMatches = 0
      }
    }
    
    // If all characters found, it's a fuzzy match
    if (searchIndex === search.length) {
      // Calculate match percentage
      const matchPercentage = (searchIndex / target.length) * 100
      return { score: score + matchPercentage, match: true }
    }
    
    // Even if not all characters match, if we have a good partial match, include it
    if (searchIndex >= Math.ceil(search.length * 0.6)) { // At least 60% of characters match
      return { score: score * 0.5, match: true }
    }
    
    return { score: 0, match: false }
  }

  // Highlight matching text
  const highlightText = (text, searchTerm) => {
    if (!searchTerm || isSelected) return text // Don't highlight if medicine is selected
    
    const regex = new RegExp(`(${searchTerm})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 font-semibold">
          {part}
        </span>
      ) : part
    )
  }

  // Helper function to check if expiry date is near (within 3 months)
  const isExpiryNear = (expiryDate) => {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const today = new Date()
    const threeMonthsFromNow = new Date()
    threeMonthsFromNow.setMonth(today.getMonth() + 3)
    return expiry <= threeMonthsFromNow
  }

  // Helper function to format expiry date
  const formatExpiryDate = (expiryDate) => {
    if (!expiryDate) return 'N/A'
    const date = new Date(expiryDate)
    return date.toLocaleDateString('en-GB', { month: '2-digit', year: 'numeric' })
  }

  // Helper function to get stock status
  const getStockStatus = (medicine) => {
    const threshold = medicine.lowStockThreshold || 50
    if (medicine.quantity === 0) {
      return { status: 'outOfStock', color: 'bg-red-100 text-red-800', icon: '❌' }
    } else if (medicine.quantity <= threshold) {
      return { status: 'lowStock', color: 'bg-orange-100 text-orange-800', icon: '⚠️' }
    } else {
      return { status: 'inStock', color: 'bg-green-100 text-green-800', icon: '✅' }
    }
  }

  // Helper function to calculate total boxes
  const calculateTotalBoxes = (quantity, unitsPerBox) => {
    if (!quantity || !unitsPerBox || unitsPerBox <= 0) return 0
    return Math.floor(quantity / unitsPerBox)
  }

  // Function to get price based on customer type
  const getPriceForCustomerType = (medicine) => {
    switch (customerType) {
      case 'Doctor':
        return medicine.doctorSellingPrice || medicine.customerSellingPrice || 0
      case 'Medical Professional':
        return medicine.medicalProfessionalSellingPrice || medicine.customerSellingPrice || 0
      default: // General Customer
        return medicine.customerSellingPrice || 0
    }
  }

  // Filter medicines based on search term with fuzzy search
  useEffect(() => {
    // Don't show suggestions if a medicine is already selected
    if (isSelected || searchTerm.trim() === '') {
      setFilteredMedicines([])
      setShowDropdown(false)
      return
    }

    const searchResults = medicines.map(medicine => {
      const nameMatch = fuzzySearch(searchTerm, medicine.name || '')
      const typeMatch = fuzzySearch(searchTerm, medicine.type || '')
      const genericMatch = fuzzySearch(searchTerm, medicine.genericName || '')
      const companyMatch = fuzzySearch(searchTerm, medicine.companyName || '')
      
      // Find the best match among all fields
      const matches = [nameMatch, typeMatch, genericMatch, companyMatch]
      const bestMatch = matches.reduce((best, current) => 
        current.score > best.score ? current : best
      )
      
      // Store which field had the best match for highlighting
      let matchedField = 'name'
      if (bestMatch === typeMatch) matchedField = 'type'
      else if (bestMatch === genericMatch) matchedField = 'genericName'
      else if (bestMatch === companyMatch) matchedField = 'companyName'
      
      return {
        ...medicine,
        searchScore: bestMatch.score,
        hasMatch: bestMatch.match,
        matchedField: matchedField
      }
    })
    .filter(medicine => medicine.hasMatch)
    .sort((a, b) => {
      // Sort by stock status first (in stock items first), then by search score
      const aStock = a.quantity > 0 ? 1 : 0
      const bStock = b.quantity > 0 ? 1 : 0
      if (aStock !== bStock) {
        return bStock - aStock // In stock items first
      }
      return b.searchScore - a.searchScore
    })
    .slice(0, 10) // Limit to 10 results for performance

    setFilteredMedicines(searchResults)
    setShowDropdown(searchResults.length > 0)
    setHighlightedIndex(-1)
  }, [searchTerm, medicines, isSelected])

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    
    // If user starts typing after selection, reset selection state
    if (isSelected && value !== selectedMedicine?.name) {
      setIsSelected(false)
    }
  }

  // Handle medicine selection
  const handleMedicineSelect = (medicine) => {
    // Check if medicine is out of stock
    if (medicine.quantity === 0) {
      // Show alert for out of stock medicine
      alert(`${medicine.name} is currently Out of Stock. You cannot add this medicine to the bill.`)
      return
    }
    
    onMedicineSelect(medicine)
    setSearchTerm(medicine.name)
    setShowDropdown(false) // Immediately hide dropdown
    setHighlightedIndex(-1)
    setIsSelected(true) // Mark as selected to prevent suggestions
  }

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showDropdown || isSelected) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev < filteredMedicines.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && filteredMedicines[highlightedIndex]) {
          handleMedicineSelect(filteredMedicines[highlightedIndex])
        }
        break
      case 'Escape':
        setShowDropdown(false)
        setHighlightedIndex(-1)
        break
    }
  }

  // Handle input focus - don't show suggestions if medicine is selected
  const handleInputFocus = () => {
    if (!isSelected && searchTerm && filteredMedicines.length > 0) {
      setShowDropdown(true)
    }
  }

  // Clear search
  const clearSearch = () => {
    setSearchTerm('')
    setShowDropdown(false)
    setHighlightedIndex(-1)
    setIsSelected(false)
    onMedicineSelect(null)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
        setHighlightedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Update selection state when selectedMedicine changes
  useEffect(() => {
    if (selectedMedicine) {
      setIsSelected(true)
      setSearchTerm(selectedMedicine.name)
      setShowDropdown(false)
    } else {
      setIsSelected(false)
    }
  }, [selectedMedicine])

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Search Medicine
      </label>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          ref={searchRef}
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          placeholder="Search by name, generic name, or company..."
          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Search Results Dropdown - Only show if not selected */}
      {showDropdown && !isSelected && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredMedicines.map((medicine, index) => {
            const isOutOfStock = medicine.quantity === 0
            return (
              <div
                key={medicine.id}
                onClick={() => handleMedicineSelect(medicine)}
                className={`p-3 border-b border-gray-100 last:border-b-0 ${
                  isOutOfStock 
                    ? 'cursor-not-allowed bg-gray-50 opacity-75' 
                    : 'cursor-pointer hover:bg-blue-50'
                } ${
                  index === highlightedIndex && !isOutOfStock ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                      {highlightText(medicine.name, searchTerm)}
                      {isOutOfStock && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          ❌ Out of Stock
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      {/* Medicine Type and Stock Info */}
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          📋 {highlightText(medicine.type, searchTerm)}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStockStatus(medicine).color}`}>
                          {getStockStatus(medicine).icon} {medicine.quantity} units
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          📦 {calculateTotalBoxes(medicine.quantity, medicine.unitsPerBox)} boxes
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          🔢 {medicine.unitsPerBox || 1}/box
                        </span>
                      </div>
                      
                      {/* Expiry Date */}
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          isExpiryNear(medicine.expiryDate) 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          📅 Expiry: {formatExpiryDate(medicine.expiryDate)}
                        </span>
                      </div>
                      
                      {/* Generic Name and Company */}
                      <div className="flex flex-wrap gap-2">
                        {medicine.genericName && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            🧬 Generic: {highlightText(medicine.genericName, searchTerm)}
                          </span>
                        )}
                        {medicine.companyName && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800">
                            🏢 {highlightText(medicine.companyName, searchTerm)}
                          </span>
                        )}
                      </div>
                      
                      {/* Out of Stock Message */}
                      {isOutOfStock && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-2 mt-2">
                          <p className="text-xs text-red-700 font-medium">
                            ⚠️ This medicine is out of stock and cannot be added to the bill.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${isOutOfStock ? 'text-gray-400' : 'text-green-600'}`}>
                      PKR {getPriceForCustomerType(medicine).toFixed(2)}
                    </div>
                    {/* Show which field matched */}
                    {medicine.matchedField === 'genericName' && (
                      <div className="text-xs text-purple-600 font-medium">Generic Match</div>
                    )}
                    {medicine.matchedField === 'companyName' && (
                      <div className="text-xs text-blue-600 font-medium">Company Match</div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Selected Medicine Display - Removed discount information */}
      {selectedMedicine && (
        <div className="mt-3 bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Package className="text-green-600" size={18} />
              <span className="font-medium">{selectedMedicine.name}</span>
            </div>
            <span className="text-green-600 font-semibold">PKR {getPriceForCustomerType(selectedMedicine).toFixed(2)}</span>
          </div>
          <div className="space-y-3">
            {/* Medicine Info with Enhanced Badges */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                📋 {selectedMedicine.type}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStockStatus(selectedMedicine).color}`}>
                {getStockStatus(selectedMedicine).icon} {selectedMedicine.quantity} units
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                📦 {calculateTotalBoxes(selectedMedicine.quantity, selectedMedicine.unitsPerBox)} boxes
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                🔢 {selectedMedicine.unitsPerBox || 1}/box
              </span>
            </div>
            
            {/* Expiry Date */}
            <div className="flex items-center">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                isExpiryNear(selectedMedicine.expiryDate) 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-indigo-100 text-indigo-800'
              }`}>
                📅 Expiry: {formatExpiryDate(selectedMedicine.expiryDate)}
              </span>
            </div>
            
            {/* Generic Name and Company */}
            <div className="flex flex-wrap gap-2">
              {selectedMedicine.genericName && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  🧬 Generic: {selectedMedicine.genericName}
                </span>
              )}
              {selectedMedicine.companyName && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-cyan-100 text-cyan-800">
                  🏢 {selectedMedicine.companyName}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* No results message - Only show if not selected */}
      {searchTerm && filteredMedicines.length === 0 && !isSelected && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500">
          No medicines found matching "{searchTerm}"
        </div>
      )}
    </div>
  )
})

export default MedicineSearchBar

