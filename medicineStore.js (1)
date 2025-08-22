import { create } from 'zustand'

// Helper functions for localStorage
const loadMedicinesFromStorage = () => {
  try {
    const stored = localStorage.getItem('medicines')
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error loading medicines from localStorage:', error)
    return []
  }
}

const saveMedicinesToStorage = (medicines) => {
  try {
    localStorage.setItem('medicines', JSON.stringify(medicines))
  } catch (error) {
    console.error('Error saving medicines to localStorage:', error)
  }
}

// Initial sample data (now empty)
const initialMedicines = []

// Initialize medicines from localStorage or use initial data
const initializeMedicines = () => {
  const stored = loadMedicinesFromStorage()
  // If localStorage is empty, return an empty array instead of populating with initialMedicines
  if (stored.length === 0) {
    return []
  }
  return stored
}

const useMedicineStore = create((set, get) => {
  const medicines = initializeMedicines()

  return {
    // State
    medicines,
    searchTerm: '',
    selectedBrand: '',
    selectedGenericName: '',
    selectedExpiryFilter: '',
    selectedCategory: '',
    selectedStockRange: '',
    isAddModalOpen: false,
    editingMedicine: null,

    // Actions
    setSearchTerm: (term) => set({ searchTerm: term }),
    setSelectedBrand: (brand) => set({ selectedBrand: brand }),
    setSelectedGenericName: (genericName) => set({ selectedGenericName: genericName }),
    setSelectedExpiryFilter: (expiryFilter) => set({ selectedExpiryFilter: expiryFilter }),
    setSelectedCategory: (category) => set({ selectedCategory: category }),
    setSelectedStockRange: (stockRange) => set({ selectedStockRange: stockRange }),
    setIsAddModalOpen: (isOpen) => set({ isAddModalOpen: isOpen }),
    setEditingMedicine: (medicine) => set({ editingMedicine: medicine }),

    // Medicine CRUD operations
    addMedicine: (medicineData) => {
      const newMedicine = {
        ...medicineData,
        id: Date.now(), // Simple ID generation
        createdAt: new Date().toISOString()
      }
      
      set((state) => {
        const updatedMedicines = [...state.medicines, newMedicine]
        saveMedicinesToStorage(updatedMedicines)
        return { 
          medicines: updatedMedicines, 
          isAddModalOpen: false,
          editingMedicine: null
        }
      })
    },

    updateMedicine: (id, medicineData) => {
      set((state) => {
        const updatedMedicines = state.medicines.map(medicine =>
          medicine.id === id 
            ? { ...medicine, ...medicineData, updatedAt: new Date().toISOString() }
            : medicine
        )
        saveMedicinesToStorage(updatedMedicines)
        return { 
          medicines: updatedMedicines, 
          editingMedicine: null,
          isAddModalOpen: false
        }
      })
    },

    deleteMedicine: (id) => {
      set((state) => {
        const updatedMedicines = state.medicines.filter(medicine => medicine.id !== id)
        saveMedicinesToStorage(updatedMedicines)
        return { medicines: updatedMedicines }
      })
    },

    // Computed values - now as a getter that returns filtered medicines
    get filteredMedicines() {
      const { medicines, searchTerm, selectedBrand, selectedGenericName, selectedExpiryFilter, selectedCategory, selectedStockRange } = get()
      
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
          const lowStockThreshold = medicine.lowStockThreshold || 50
          if (selectedStockRange === 'Out of Stock') {
            matchesStockRange = medicine.quantity === 0
          } else if (selectedStockRange === 'Low Stock') {
            matchesStockRange = medicine.quantity > 0 && medicine.quantity <= lowStockThreshold
          } else if (selectedStockRange === 'Medium Stock') {
            matchesStockRange = medicine.quantity > lowStockThreshold && medicine.quantity <= (lowStockThreshold * 2)
          } else if (selectedStockRange === 'High Stock') {
            matchesStockRange = medicine.quantity > (lowStockThreshold * 2)
          } else if (selectedStockRange === 'In Stock') {
            matchesStockRange = medicine.quantity > lowStockThreshold
          }
        }
        
        return matchesSearch && matchesBrand && matchesGenericName && matchesCategory && matchesExpiry && matchesStockRange
      })
    },

    // Keep the function version for backward compatibility
    getFilteredMedicines: () => {
      const { medicines, searchTerm, selectedBrand, selectedGenericName, selectedExpiryFilter, selectedCategory, selectedStockRange } = get()
      
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
          const lowStockThreshold = medicine.lowStockThreshold || 50
          if (selectedStockRange === 'Out of Stock') {
            matchesStockRange = medicine.quantity === 0
          } else if (selectedStockRange === 'Low Stock') {
            matchesStockRange = medicine.quantity > 0 && medicine.quantity <= lowStockThreshold
          } else if (selectedStockRange === 'Medium Stock') {
            matchesStockRange = medicine.quantity > lowStockThreshold && medicine.quantity <= (lowStockThreshold * 2)
          } else if (selectedStockRange === 'High Stock') {
            matchesStockRange = medicine.quantity > (lowStockThreshold * 2)
          } else if (selectedStockRange === 'In Stock') {
            matchesStockRange = medicine.quantity > lowStockThreshold
          }
        }
        
        return matchesSearch && matchesBrand && matchesGenericName && matchesCategory && matchesExpiry && matchesStockRange
      })
    },

    getStockStats: () => {
      const { medicines } = get()
      
      return {
        total: medicines.length,
        inStock: medicines.filter(m => m.quantity > (m.lowStockThreshold || 50)).length,
        lowStock: medicines.filter(m => m.quantity > 0 && m.quantity <= (m.lowStockThreshold || 50)).length,
        outOfStock: medicines.filter(m => m.quantity === 0).length
      }
    },

    // Deduct stock
    deductStock: (id, quantityToDeduct) => {
      set((state) => {
        const updatedMedicines = state.medicines.map(medicine => {
          if (medicine.id === id) {
            return { ...medicine, quantity: medicine.quantity - quantityToDeduct }
          }
          return medicine
        })
        saveMedicinesToStorage(updatedMedicines)
        return { medicines: updatedMedicines }
      })
    },

    // Restore stock
    restoreStock: (id, quantityToRestore) => {
      set((state) => {
        const updatedMedicines = state.medicines.map(medicine => {
          if (medicine.id === id) {
            return { ...medicine, quantity: medicine.quantity + quantityToRestore }
          }
          return medicine
        })
        saveMedicinesToStorage(updatedMedicines)
        return { medicines: updatedMedicines }
      })
    },

    // Reset to initial data
    resetToInitialData: () => {
      saveMedicinesToStorage(initialMedicines)
      set({ medicines: initialMedicines })
    }
  }
})

export default useMedicineStore

