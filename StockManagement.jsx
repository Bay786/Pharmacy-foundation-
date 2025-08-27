import { Package, Plus, AlertTriangle, TrendingUp } from 'lucide-react'
import useMedicineStore from '../store/medicineStore'
import MedicineTable from '../components/MedicineTable'
import MedicineFilters from '../components/MedicineFilters'
import AddMedicineModal from '../components/AddMedicineModal'

const StockManagement = () => {
  const { 
    medicines, 
    isAddModalOpen, 
    setIsAddModalOpen,
    getFilteredMedicines,
    getStockStats,
    setSelectedStockRange
  } = useMedicineStore()

  const filteredMedicines = getFilteredMedicines()
  const stockStats = getStockStats()

  const handleStockFilter = (filterType) => {
    switch (filterType) {
      case 'lowStock':
        setSelectedStockRange('Low Stock')
        break
      case 'outOfStock':
        setSelectedStockRange('Out of Stock')
        break
      case 'inStock':
        setSelectedStockRange('High Stock')
        break
      default:
        setSelectedStockRange('')
    }
  }

  const statsCards = [
    {
      title: 'Total Medicines',
      value: stockStats.total,
      icon: Package,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-800',
      clickable: false
    },
    {
      title: 'In Stock',
      value: stockStats.inStock,
      icon: TrendingUp,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      textColor: 'text-green-800',
      clickable: true,
      onClick: () => handleStockFilter('inStock')
    },
    {
      title: 'Low Stock',
      value: stockStats.lowStock,
      icon: AlertTriangle,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      textColor: 'text-orange-800',
      clickable: true,
      onClick: () => handleStockFilter('lowStock')
    },
    {
      title: 'Out of Stock',
      value: stockStats.outOfStock,
      icon: AlertTriangle,
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      textColor: 'text-red-800',
      clickable: true,
      onClick: () => handleStockFilter('outOfStock')
    }
  ]

  return (
    <div className="p-3 sm:p-4 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 lg:mb-6">
        <div className="mb-3 sm:mb-0">
          <div className="flex items-center space-x-2 mb-1">
            <Package className="text-blue-600" size={24} />
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
              Stock Management
            </h2>
          </div>
          <p className="text-sm sm:text-base text-gray-600">
            Manage your medicine inventory, track stock levels, and monitor expiry dates.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base w-full sm:w-auto"
        >
          <Plus size={18} />
          <span>Add New Medicine</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-4 lg:mb-6">
        {statsCards.map((card, index) => {
          const Icon = card.icon
          return (
            <div
              key={index}
              className={`${card.bgColor} rounded-xl p-3 lg:p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100 ${
                card.clickable ? 'cursor-pointer' : ''
              }`}
              onClick={card.clickable ? card.onClick : undefined}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-gray-600 mb-1">
                    {card.title}
                  </p>
                  <p className={`text-lg lg:text-2xl font-bold ${card.textColor}`}>
                    {card.value}
                  </p>
                </div>
                <div className={`p-2 lg:p-3 rounded-lg bg-white shadow-md`}>
                  <Icon className={card.iconColor} size={16} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="mb-4 lg:mb-6">
        <MedicineFilters />
      </div>

      {/* Medicine Table */}
      <div className="mb-4 lg:mb-6">
        <MedicineTable />
      </div>

      {/* Quick Actions - Mobile Only */}
      <div className="md:hidden bg-white rounded-xl shadow-lg p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-3">Quick Actions</h3>
        <div className="space-y-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <Plus size={18} />
            <span>Add New Medicine</span>
          </button>
          <button className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2">
            <TrendingUp size={18} />
            <span>Generate Report</span>
          </button>
          <button className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2">
            <AlertTriangle size={18} />
            <span>Check Expiry Alerts</span>
          </button>
        </div>
      </div>

      {/* Mobile Optimization Notice */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 md:hidden">
        <div className="flex items-start space-x-2">
          <Package className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
          <div>
            <h4 className="text-sm font-semibold text-blue-800">Mobile Optimized</h4>
            <p className="text-xs text-blue-600 mt-1">
              This inventory system is optimized for Android devices. All data is stored locally on your device.
            </p>
          </div>
        </div>
      </div>

      {/* Add Medicine Modal */}
      {isAddModalOpen && <AddMedicineModal />}
    </div>
  )
}

export default StockManagement

