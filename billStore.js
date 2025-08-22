import { create } from 'zustand'
import useMedicineStore from './medicineStore'

// Helper functions for localStorage
const loadBillsFromStorage = () => {
  try {
    const stored = localStorage.getItem('temporaryBills')
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error loading bills from localStorage:', error)
    return []
  }
}

const saveBillsToStorage = (bills) => {
  try {
    localStorage.setItem('temporaryBills', JSON.stringify(bills))
  } catch (error) {
    console.error('Error saving bills to localStorage:', error)
  }
}

const useBillStore = create((set, get) => ({
  // Current bill state
  currentBill: {
    id: null,
    customerName: '',
    customerPhone: '',
    customerType: 'General Customer', // Default customer type
    date: new Date().toISOString().split('T')[0],
    items: [],
    subtotal: 0,
    discount: 0,
    tax: 0,
    grandTotal: 0
  },

  // Temporary bills storage
  temporaryBills: loadBillsFromStorage(),

  // Product selection state
  selectedProduct: null,
  selectedQuantity: 1,

  // Actions
  setCustomerDetails: (name, phone, type) => {
    set((state) => ({
      currentBill: {
        ...state.currentBill,
        customerName: name,
        customerPhone: phone,
        customerType: type
      }
    }))
  },

  setSelectedProduct: (product) => {
    set({ selectedProduct: product })
  },

  setSelectedQuantity: (quantity) => {
    set({ selectedQuantity: quantity })
  },

  addItemToBill: (unitQuantity = 0, boxQuantity = 0, sellingPrice, discountPercentage) => {
    const { selectedProduct, currentBill } = get()
    const deductStock = useMedicineStore.getState().deductStock
    
    if (!selectedProduct || (unitQuantity <= 0 && boxQuantity <= 0)) return

    // Determine which quantity to use - prioritize units if both are provided
    let finalQuantity, finalPrice, quantityType, displayText, calculatedUnitPrice
    
    if (unitQuantity > 0) {
      // Calculate price for units: (Selling Price ÷ Units per Box) × Number of Units
      calculatedUnitPrice = sellingPrice / (selectedProduct.unitsPerBox || 1)
      finalQuantity = unitQuantity
      finalPrice = calculatedUnitPrice * unitQuantity
      quantityType = 'units'
      displayText = `${unitQuantity} units`
      deductStock(selectedProduct.id, unitQuantity)
    } else if (boxQuantity > 0) {
      // Calculate price for boxes: Selling Price × Number of Boxes
      calculatedUnitPrice = sellingPrice
      finalQuantity = boxQuantity
      finalPrice = sellingPrice * boxQuantity
      quantityType = 'boxes'
      displayText = `${boxQuantity} boxes`
      deductStock(selectedProduct.id, boxQuantity * (selectedProduct.unitsPerBox || 1))
    }

    // Always add as new item (separate entries for each addition)
    const itemSubtotal = finalPrice
    const discountAmount = itemSubtotal * (discountPercentage / 100)
    const itemTotal = itemSubtotal - discountAmount

    const newItem = {
      id: selectedProduct.id,
      itemId: Date.now() + Math.random(), // Unique identifier for each entry
      name: selectedProduct.name,
      genericName: selectedProduct.genericName || 'N/A',
      companyName: selectedProduct.companyName || 'N/A',
      unitPrice: calculatedUnitPrice,
      quantity: finalQuantity,
      quantityType: quantityType,
      displayText: displayText,
      subtotal: itemSubtotal,
      discountPercentage: discountPercentage,
      discountAmount: discountAmount,
      total: itemTotal
    }
    
    const updatedItems = [...currentBill.items, newItem]

    // Calculate totals
    const subtotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0)
    const totalDiscountAmount = updatedItems.reduce((sum, item) => sum + item.discountAmount, 0)
    const afterDiscount = subtotal - totalDiscountAmount
    const tax = 0
    const grandTotal = afterDiscount

    set((state) => ({
      currentBill: {
        ...state.currentBill,
        items: updatedItems,
        subtotal,
        discount: totalDiscountAmount,
        tax,
        grandTotal
      },
      selectedProduct: null,
      selectedQuantity: 1
    }))
  },

  removeItemFromBill: (itemId) => {
    set((state) => {
      const updatedItems = state.currentBill.items.filter(item => item.id !== itemId)
      const subtotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0)
      const totalDiscountAmount = updatedItems.reduce((sum, item) => sum + item.discountAmount, 0)
      const afterDiscount = subtotal - totalDiscountAmount
      const tax = 0
      const grandTotal = afterDiscount

      return {
        currentBill: {
          ...state.currentBill,
          items: updatedItems,
          subtotal,
          discount: totalDiscountAmount,
          tax,
          grandTotal
        }
      }
    })
  },

  removeSpecificItem: (itemId) => {
    set((state) => {
      const { restoreStock } = useMedicineStore.getState()
      const itemToRemove = state.currentBill.items.find(item => item.itemId === itemId)

      if (itemToRemove) {
        // Restore stock based on quantityType
        if (itemToRemove.quantityType === 'units') {
          restoreStock(itemToRemove.id, itemToRemove.quantity)
        } else if (itemToRemove.quantityType === 'boxes') {
          // Assuming unitsPerBox is available in the medicine item or can be fetched
          const medicine = useMedicineStore.getState().medicines.find(m => m.id === itemToRemove.id)
          if (medicine && medicine.unitsPerBox) {
            restoreStock(itemToRemove.id, itemToRemove.quantity * medicine.unitsPerBox)
          }
        }
      }

      const updatedItems = state.currentBill.items.filter(item => item.itemId !== itemId)
      const subtotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0)
      const totalDiscountAmount = updatedItems.reduce((sum, item) => sum + item.discountAmount, 0)
      const afterDiscount = subtotal - totalDiscountAmount
      const tax = 0
      const grandTotal = afterDiscount

      return {
        currentBill: {
          ...state.currentBill,
          items: updatedItems,
          subtotal,
          discount: totalDiscountAmount,
          tax,
          grandTotal
        }
      }
    })
  },

  updateItemQuantity: (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      get().removeSpecificItem(itemId)
      return
    }

    set((state) => {
      const updatedItems = state.currentBill.items.map(item => {
        if (item.itemId === itemId) {
          const itemSubtotal = item.unitPrice * newQuantity
          const discountAmount = itemSubtotal * (item.discountPercentage / 100)
          const itemTotal = itemSubtotal - discountAmount
          
          const newDisplayText = item.quantityType === 'units' 
            ? `${newQuantity} units` 
            : `${newQuantity} boxes`
          
          return { 
            ...item, 
            quantity: newQuantity,
            displayText: newDisplayText,
            subtotal: itemSubtotal,
            discountAmount: discountAmount,
            total: itemTotal 
          }
        }
        return item
      })
      
      const subtotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0)
      const totalDiscountAmount = updatedItems.reduce((sum, item) => sum + item.discountAmount, 0)
      const afterDiscount = subtotal - totalDiscountAmount
      const tax = 0
      const grandTotal = afterDiscount

      return {
        currentBill: {
          ...state.currentBill,
          items: updatedItems,
          subtotal,
          discount: totalDiscountAmount,
          tax,
          grandTotal
        }
      }
    })
  },

  updateItemDiscount: (itemId, newDiscountPercentage) => {
    set((state) => {
      const updatedItems = state.currentBill.items.map(item => {
        if (item.itemId === itemId) {
          const itemSubtotal = item.unitPrice * item.quantity
          const discountAmount = itemSubtotal * (newDiscountPercentage / 100)
          const itemTotal = itemSubtotal - discountAmount
          
          return { 
            ...item, 
            discountPercentage: newDiscountPercentage,
            subtotal: itemSubtotal,
            discountAmount: discountAmount,
            total: itemTotal 
          }
        }
        return item
      })
      
      const subtotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0)
      const totalDiscountAmount = updatedItems.reduce((sum, item) => sum + item.discountAmount, 0)
      const afterDiscount = subtotal - totalDiscountAmount
      const tax = 0
      const grandTotal = afterDiscount

      return {
        currentBill: {
          ...state.currentBill,
          items: updatedItems,
          subtotal,
          discount: totalDiscountAmount,
          tax,
          grandTotal
        }
      }
    })
  },

  setDiscount: (discount) => {
    set((state) => {
      const grandTotal = state.currentBill.subtotal - discount
      return {
        currentBill: {
          ...state.currentBill,
          discount,
          grandTotal
        }
      }
    })
  },

  saveTemporaryBill: () => {
    const { currentBill, temporaryBills } = get()
    
    if (currentBill.items.length === 0) {
      alert('Cannot save empty bill')
      return
    }

    const billToSave = {
      ...currentBill,
      id: Date.now(),
      savedAt: new Date().toISOString()
    }

    const updatedBills = [...temporaryBills, billToSave]
    saveBillsToStorage(updatedBills)

    set({
      temporaryBills: updatedBills,
      currentBill: {
        id: null,
        customerName: '',
        customerPhone: '',
        customerType: 'General Customer', // Reset customer type on save
        date: new Date().toISOString().split('T')[0],
        items: [],
        subtotal: 0,
        discount: 0,
        tax: 0,
        grandTotal: 0
      }
    })

    alert('Bill saved successfully!')
  },

  loadTemporaryBill: (billId) => {
    const { temporaryBills } = get()
    const bill = temporaryBills.find(b => b.id === billId)
    
    if (bill) {
      set({
        currentBill: { ...bill }
      })
    }
  },

  deleteTemporaryBill: (billId) => {
    set((state) => {
      const updatedBills = state.temporaryBills.filter(bill => bill.id !== billId)
      saveBillsToStorage(updatedBills)
      return {
        temporaryBills: updatedBills
      }
    })
  },

  clearCurrentBill: () => {
    set({
      currentBill: {
        id: null,
        customerName: '',
        customerPhone: '',
        customerType: 'General Customer', // Reset customer type on clear
        date: new Date().toISOString().split('T')[0],
        items: [],
        subtotal: 0,
        discount: 0,
        tax: 0,
        grandTotal: 0
      }
    })
  }
}))

export default useBillStore







