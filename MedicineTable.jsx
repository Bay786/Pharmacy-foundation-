import { useMemo, useState, useEffect, useRef } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper
} from '@tanstack/react-table'
import { Edit, Trash2, Package, Calendar, DollarSign, Hash, Eye, EyeOff } from 'lucide-react'
import useMedicineStore from '../store/medicineStore'
import ScrollRoller from './ScrollRoller'

const columnHelper = createColumnHelper()

const MedicineTable = () => {
  const { 
    medicines,
    searchTerm,
    selectedBrand,
    selectedGenericName,
    selectedExpiryFilter,
    selectedCategory,
    selectedStockRange,
    deleteMedicine, 
    setEditingMedicine, 
    setIsAddModalOpen 
  } = useMedicineStore()

  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768)
  const [showMobileDetails, setShowMobileDetails] = useState({})
  const scrollContainerRef = useRef(null)

  // Use direct filtering with reactive dependencies
  const data = useMemo(() => {
    return medicines.filter(medicine => {
      // Search filter - check name, brand, generic name, and company
      const matchesSearch = !searchTerm || 
        medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (medicine.company && medicine.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (medicine.genericName && medicine.genericName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        medicine.type.toLowerCase().includes(searchTerm.toLowerCase())
      
      // Brand filter
      const matchesBrand = !selectedBrand || (medicine.company && medicine.company === selectedBrand)
      
      // Generic Name filter
      const matchesGenericName = !selectedGenericName || (medicine.genericName && medicine.genericName === selectedGenericName)
      
      // Category filter
      const matchesCategory = !selectedCategory || medicine.type === selectedCategory
      
      // Expiry Date filter
      let matchesExpiry = true
      if (selectedExpiryFilter) {
        const expiryDate = new Date(medicine.expiryDate)
        const currentDate = new Date()
        const threeMonthsFromNow = new Date()
        threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3)
        
        if (selectedExpiryFilter === 'Expiring Soon') {
          matchesExpiry = expiryDate <= threeMonthsFromNow && expiryDate > currentDate
        } else if (selectedExpiryFilter === 'Expired') {
          matchesExpiry = expiryDate <= currentDate
        } else if (selectedExpiryFilter === 'Valid') {
          matchesExpiry = expiryDate > threeMonthsFromNow
        }
      }
      
      // Stock Range filter
      let matchesStockRange = true
      if (selectedStockRange) {
        if (selectedStockRange === 'Out of Stock') {
          matchesStockRange = medicine.quantity === 0
        } else if (selectedStockRange === 'Low Stock') {
          matchesStockRange = medicine.quantity > 0 && medicine.quantity <= 10
        } else if (selectedStockRange === 'Medium Stock') {
          matchesStockRange = medicine.quantity > 10 && medicine.quantity <= 50
        } else if (selectedStockRange === 'High Stock') {
          matchesStockRange = medicine.quantity > 50
        }
      }
      
      return matchesSearch && matchesBrand && matchesGenericName && matchesCategory && matchesExpiry && matchesStockRange
    })
  }, [medicines, searchTerm, selectedBrand, selectedGenericName, selectedExpiryFilter, selectedCategory, selectedStockRange])

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768)
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const getStockStatus = (quantity) => {
    if (quantity === 0) {
      return { 
        status: 'Out of Stock', 
        color: 'text-red-600', 
        bgColor: 'bg-red-100',
        dotColor: 'bg-red-500'
      }
    } else if (quantity <= 10) {
      return { 
        status: 'Low Stock', 
        color: 'text-orange-600', 
        bgColor: 'bg-orange-100',
        dotColor: 'bg-orange-500'
      }
    } else {
      return { 
        status: 'In Stock', 
        color: 'text-green-600', 
        bgColor: 'bg-green-100',
        dotColor: 'bg-green-500'
      }
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'گولی':
        return 'bg-blue-100 text-blue-800'
      case 'انجکشن':
        return 'bg-red-100 text-red-800'
      case 'کریم':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const isExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date()
  }

  const handleEdit = (medicine) => {
    setEditingMedicine(medicine)
    setIsAddModalOpen(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('کیا آپ واقعی اس دوا کو ڈیلیٹ کرنا چاہتے ہیں؟')) {
      deleteMedicine(id)
    }
  }

  const toggleMobileDetails = (id) => {
    setShowMobileDetails(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const columns = useMemo(() => [
    columnHelper.accessor('id', {
      header: 'ID',
      cell: info => `#${String(info.getValue()).padStart(3, '0')}`,
      size: 80
    }),
    columnHelper.accessor('name', {
      header: 'Medicine Name',
      cell: info => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{info.getValue()}</div>
            <div className="text-sm text-gray-500">Medicine</div>
          </div>
        </div>
      ),
      size: 200
    }),
    columnHelper.accessor('type', {
      header: 'Type',
      cell: info => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(info.getValue())}`}>
          {info.getValue()}
        </span>
      ),
      size: 120
    }),
    columnHelper.accessor('price', {
      header: 'Price',
      cell: info => (
        <div className="flex items-center">
          <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
          <span className="font-medium">PKR {info.getValue()}</span>
        </div>
      ),
      size: 120
    }),
    columnHelper.accessor('quantity', {
      header: 'Quantity',
      cell: info => {
        const status = getStockStatus(info.getValue())
        return (
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${status.dotColor}`}></div>
            <span className={`font-medium ${status.color}`}>{info.getValue()}</span>
          </div>
        )
      },
      size: 120
    }),
    columnHelper.accessor('expiryDate', {
      header: 'Expiry Date',
      cell: info => {
        const expired = isExpired(info.getValue())
        return (
          <div className="flex items-center">
            <Calendar className="w-4 h-4 text-gray-400 mr-1" />
            <span className={expired ? 'text-red-600 font-medium' : 'text-gray-900'}>
              {new Date(info.getValue()).toLocaleDateString()}
            </span>
            {expired && (
              <span className="ml-2 text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                Expired
              </span>
            )}
          </div>
        )
      },
      size: 150
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEdit(row.original)}
            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
            title={`Edit ${row.original.name}`}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.original.id)}
            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
            title={`Delete ${row.original.name}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
      size: 100
    })
  ], [])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (isMobileView) {
    return (
      <div className="space-y-4 relative">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Medicine Inventory</h3>
          <p className="text-sm text-gray-500">
            Manage your medicine stock and track expiry dates
          </p>
        </div>

        {data.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No medicines found</h3>
            <p className="text-gray-500">Add some medicines to get started</p>
          </div>
        ) : (
          <>
            <div 
              ref={scrollContainerRef}
              className="space-y-3 max-h-[70vh] overflow-y-auto scrollbar-hide"
              style={{
                scrollBehavior: 'smooth',
                overscrollBehavior: 'contain'
              }}
            >
              {data.map((medicine) => {
                const status = getStockStatus(medicine.quantity)
                const expired = isExpired(medicine.expiryDate)
                const showDetails = showMobileDetails[medicine.id]

                return (
                  <div key={medicine.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{medicine.name}</h4>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(medicine.type)}`}>
                            {medicine.type}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleMobileDetails(medicine.id)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        {showDetails ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-500">Price</p>
                        <p className="font-medium text-gray-900">PKR {medicine.price}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Quantity</p>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${status.dotColor}`}></div>
                          <span className={`font-medium ${status.color}`}>{medicine.quantity}</span>
                        </div>
                      </div>
                    </div>

                    {showDetails && (
                      <div className="border-t border-gray-100 pt-3 mb-3">
                        <div className="grid grid-cols-1 gap-2">
                          <div>
                            <p className="text-sm text-gray-500">Expiry Date</p>
                            <p className={`font-medium ${expired ? 'text-red-600' : 'text-gray-900'}`}>
                              {new Date(medicine.expiryDate).toLocaleDateString()}
                              {expired && <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Expired</span>}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Medicine ID</p>
                            <p className="font-medium text-gray-900">#{String(medicine.id).padStart(3, '0')}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(medicine)}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(medicine.id)}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Custom Scroll Roller for Mobile */}
            <ScrollRoller 
              containerRef={scrollContainerRef}
              isVisible={data.length > 5} // Only show if more than 5 items
              autoHideDelay={3000}
              color="#a3c9f1"
              width={8}
            />
          </>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
          <span>Showing {data.length} medicine(s)</span>
          <span>Total inventory items</span>
        </div>

        {/* Hide scrollbar CSS */}
        <style jsx>{`
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Medicine Inventory</h3>
        <p className="text-sm text-gray-500">
          Manage your medicine stock and track expiry dates
        </p>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No medicines found</h3>
          <p className="text-gray-500">Add some medicines to get started</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map(cell => (
                    <td
                      key={cell.id}
                      className="px-6 py-4 whitespace-nowrap"
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
        <span>Showing {data.length} medicine(s)</span>
        <span>Total inventory items</span>
      </div>
    </div>
  )
}

export default MedicineTable

