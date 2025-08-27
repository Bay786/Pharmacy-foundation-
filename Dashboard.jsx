import { useState } from 'react'
import { TrendingUp, Package, AlertTriangle, ShoppingCart, Upload } from 'lucide-react'
import useAppStore from '../store/appStore'
import useMedicineStore from '../store/medicineStore'
import ImportModal from '../components/ImportModal'

const Dashboard = () => {
  const { userName, setCurrentPage } = useAppStore()
  const { setIsAddModalOpen, medicines } = useMedicineStore()
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  // Calculate stats from medicine data
  const totalMedicines = medicines.length
  const inStockMedicines = medicines.filter(m => m.quantity > 10).length
  const lowStockMedicines = medicines.filter(m => m.quantity > 0 && m.quantity <= 10).length
  const outOfStockMedicines = medicines.filter(m => m.quantity === 0).length

  const handleAddNewProduct = () => {
    setCurrentPage('stock')
    setIsAddModalOpen(true)
  }

  const handleCreateNewBill = () => {
    setCurrentPage('bill')
  }

  const handleViewReports = () => {
    // Future implementation for reports
    alert('Reports feature coming soon!')
  }

  const handleImportData = () => {
    setIsImportModalOpen(true)
  }

  const statsCards = [
    {
      title: 'Total Products',
      value: totalMedicines,
      icon: Package,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-800'
    },
    {
      title: 'Low Stock Items',
      value: lowStockMedicines,
      icon: AlertTriangle,
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      textColor: 'text-red-800'
    },
    {
      title: 'Total Sales',
      value: 'PKR 45,000',
      icon: TrendingUp,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      textColor: 'text-green-800'
    },
    {
      title: 'Pending Orders',
      value: 8,
      icon: ShoppingCart,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      textColor: 'text-orange-800'
    }
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Welcome Header */}
      <div className="mb-6 lg:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          Welcome back, {userName}! 👋
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          Here's what's happening with your inventory today.
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {statsCards.map((card, index) => {
          const Icon = card.icon
          return (
            <div
              key={index}
              className={`${card.bgColor} rounded-xl p-4 lg:p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                    {card.title}
                  </p>
                  <p className={`text-xl sm:text-2xl font-bold ${card.textColor}`}>
                    {card.value}
                  </p>
                </div>
                <div className={`p-2 lg:p-3 rounded-lg bg-white shadow-md`}>
                  <Icon className={card.iconColor} size={20} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 mb-6 lg:mb-8">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 lg:gap-4">
          <button 
            onClick={handleAddNewProduct}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 lg:px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
          >
            <Package size={18} />
            <span>Add New Product</span>
          </button>
          <button 
            onClick={handleCreateNewBill}
            className="bg-green-500 hover:bg-green-600 text-white px-4 lg:px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
          >
            <ShoppingCart size={18} />
            <span>Create New Bill</span>
          </button>
          <button 
            onClick={handleViewReports}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 lg:px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
          >
            <TrendingUp size={18} />
            <span>View Reports</span>
          </button>
          <button 
            onClick={handleImportData}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 lg:px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
          >
            <Upload size={18} />
            <span>Import</span>
          </button>
        </div>
      </div>

      {/* Import Information Box */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl shadow-lg p-4 lg:p-6 mb-6 lg:mb-8">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Upload className="text-orange-600" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-orange-800 mb-2">📥 Import Products & Data</h3>
            <p className="text-sm sm:text-base text-orange-700 mb-3">
              Easily import your products and inventory data from CSV or Excel files. Save time by bulk uploading medicine information, stock quantities, and pricing details.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-orange-600">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                <span>📂 CSV & Excel Support</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                <span>⚡ Bulk Upload</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                <span>🔄 Auto Stock Update</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                <span>💰 Pricing Import</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
            <span className="text-sm sm:text-base text-gray-700 flex-1">New product "Product A" added to inventory</span>
            <span className="text-xs sm:text-sm text-gray-500 flex-shrink-0">2 hours ago</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
            <span className="text-sm sm:text-base text-gray-700 flex-1">Low stock alert for "Product B"</span>
            <span className="text-xs sm:text-sm text-gray-500 flex-shrink-0">4 hours ago</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
            <span className="text-sm sm:text-base text-gray-700 flex-1">Bill #1001 generated successfully</span>
            <span className="text-xs sm:text-sm text-gray-500 flex-shrink-0">6 hours ago</span>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      <ImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
      />
    </div>
  )
}

export default Dashboard

