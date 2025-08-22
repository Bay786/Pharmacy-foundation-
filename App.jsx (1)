import Navigation from './components/Navigation'
import Dashboard from './pages/Dashboard'
import StockManagement from './pages/StockManagement'
import BillGenerator from './pages/BillGenerator'
import Settings from './pages/Settings'
import useAppStore from './store/appStore'
import './App.css'

function App() {
  const { currentPage, darkMode } = useAppStore()

  console.log('Current Page:', currentPage); // Debugging: Check current page state

  const renderPage = () => {
    console.log('Rendering page for:', currentPage); // Debugging: Check which page is being rendered
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'stock':
        return <StockManagement />
      case 'billing':
        return <BillGenerator />
      case 'settings':
        return <Settings />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Navigation />
      <main className="max-w-7xl mx-auto">
        {renderPage()}
      </main>
    </div>
  )
}

export default App


