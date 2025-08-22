import { Home, Package, FileText, Settings, Moon, Sun, User } from 'lucide-react'
import useAppStore from '../store/appStore'

const Navigation = () => {
  const { currentPage, setCurrentPage, darkMode, toggleDarkMode, userName } = useAppStore()

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'stock', label: 'Stock Management', icon: Package },
    { id: 'billing', label: 'Bill Generator', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-700 shadow-lg">
      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="bg-white p-2 rounded-lg shadow-md">
                <Package className="text-blue-600" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Inventory Management</h1>
                <p className="text-blue-100 text-sm">Professional Business Solution</p>
              </div>
            </div>

            {/* Navigation Items */}
            <div className="flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = currentPage === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-white text-blue-600 shadow-md'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="hidden lg:block">{item.label}</span>
                  </button>
                )
              })}
            </div>

            {/* User Info & Dark Mode */}
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleDarkMode}
                className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Toggle Dark Mode"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <div className="flex items-center space-x-2 text-white">
                <User size={18} />
                <span className="text-sm font-medium">{userName}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        {/* Mobile Header */}
        <div className="px-4 py-3 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-white p-1.5 rounded-lg shadow-md">
                <Package className="text-blue-600" size={20} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Inventory Management</h1>
                <p className="text-blue-100 text-xs">Professional Business Solution</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleDarkMode}
                className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Toggle Dark Mode"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <div className="flex items-center space-x-1 text-white">
                <User size={16} />
                <span className="text-sm font-medium">Admin User</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="px-2 py-2">
          <div className="grid grid-cols-4 gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-blue-600 shadow-md'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-xs mt-1 leading-tight text-center">
                    {item.label.split(' ')[0]}
                    {item.label.split(' ')[1] && (
                      <br />
                    )}
                    {item.label.split(' ')[1]}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Navigation





