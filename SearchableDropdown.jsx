import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, Plus } from 'lucide-react'

const SearchableDropdown = ({ name, value, onChange, error, categories }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customValue, setCustomValue] = useState('')
  const dropdownRef = useRef(null)

  // Filter categories based on search term
  const filteredCategories = categories.filter(category =>
    category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        setShowCustomInput(false)
        setCustomValue('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (category) => {
    onChange(category)
    setIsOpen(false)
    setSearchTerm('')
    setShowCustomInput(false)
    setCustomValue('')
  }

  const handleCustomSubmit = () => {
    if (customValue.trim()) {
      onChange(customValue.trim())
      setIsOpen(false)
      setShowCustomInput(false)
      setCustomValue('')
      setSearchTerm('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (showCustomInput) {
        handleCustomSubmit()
      } else if (filteredCategories.length > 0) {
        handleSelect(filteredCategories[0])
      }
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Main Input */}
      <div
        className={`w-full px-4 py-3 border-2 rounded-lg cursor-pointer flex items-center justify-between text-base transition-all ${
          error ? 'border-red-300' : 'border-gray-300'
        } ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : 'hover:border-gray-400'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-500'}>
          {value || 'Select medicine type'}
        </span>
        <ChevronDown 
          size={20} 
          className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search medicine type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                autoFocus={true}
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-40 overflow-y-auto">
            {/* Filtered Categories */}
            {filteredCategories.map((category, index) => {
              // Highlight matching text
              const highlightText = (text, highlight) => {
                if (!highlight.trim()) return text;
                const regex = new RegExp(`(${highlight})`, 'gi');
                const parts = text.split(regex);
                return parts.map((part, i) => 
                  regex.test(part) ? (
                    <span key={i} className="bg-yellow-200 font-semibold">{part}</span>
                  ) : part
                );
              };

              return (
                <div
                  key={category}
                  className={`px-4 py-3 cursor-pointer text-sm transition-colors ${
                    index === 0 && searchTerm ? 'bg-blue-100 border-l-4 border-blue-500' : 'hover:bg-blue-50'
                  }`}
                  onClick={() => handleSelect(category)}
                >
                  {highlightText(category, searchTerm)}
                </div>
              );
            })}

            {/* No Results */}
            {filteredCategories.length === 0 && searchTerm && !showCustomInput && (
              <div className="px-4 py-3 text-gray-500 text-sm">
                No matching categories found
              </div>
            )}

            {/* Custom Option */}
            {!showCustomInput && (
              <div
                className="px-4 py-3 hover:bg-green-50 cursor-pointer text-sm transition-colors border-t border-gray-200 text-green-600 flex items-center"
                onClick={() => setShowCustomInput(true)}
              >
                <Plus size={16} className="mr-2" />
                Add Custom Category
              </div>
            )}

            {/* Custom Input */}
            {showCustomInput && (
              <div className="p-3 border-t border-gray-200 bg-green-50">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter custom category..."
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                    autoFocus={true}
                  />
                  <button
                    type="button"
                    onClick={handleCustomSubmit}
                    className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchableDropdown

