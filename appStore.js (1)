import { create } from 'zustand'

const useAppStore = create((set, get) => ({
  // Navigation state
  currentPage: 'dashboard',
  setCurrentPage: (page) => set({ currentPage: page }),

  // User preferences
  userName: 'Admin User',
  setUserName: (name) => set({ userName: name }),

  // Theme state
  darkMode: false,
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

  // Dashboard stats (dummy data)
  dashboardStats: {
    totalProducts: 150,
    lowStock: 12,
    totalSales: 45000,
    pendingOrders: 8
  },
  updateDashboardStats: (stats) => set({ dashboardStats: stats }),

  // Stock management state
  stockItems: [
    { id: 1, name: 'Product A', quantity: 50, price: 100 },
    { id: 2, name: 'Product B', quantity: 5, price: 200 },
    { id: 3, name: 'Product C', quantity: 0, price: 150 }
  ],
  addStockItem: (item) => set((state) => ({
    stockItems: [...state.stockItems, { ...item, id: Date.now() }]
  })),

  // Bill generator state
  currentBill: {
    customerName: '',
    items: [],
    total: 0
  },
  updateCurrentBill: (bill) => set({ currentBill: bill }),

  // Settings state
  settings: {
    currency: 'PKR',
    language: 'en',
    notifications: true,
    autoSave: true
  },
  updateSettings: (newSettings) => set((state) => ({
    settings: { ...state.settings, ...newSettings }
  }))
}))

export default useAppStore

