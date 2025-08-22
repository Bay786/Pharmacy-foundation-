import { useState, useRef } from 'react'
import { 
  ShoppingCart, 
  User, 
  Phone, 
  Calendar, 
  Plus, 
  Minus, 
  Trash2, 
  Save, 
  Receipt,
  Package,
  DollarSign,
  Percent,
  FileText,
  Download,
  Users,
  Stethoscope,
  Hospital
} from 'lucide-react'
import { PDFDownloadLink, pdf } from '@react-pdf/renderer'
import useBillStore from '../store/billStore'
import useMedicineStore from '../store/medicineStore'
import MedicineSearchBar from '../components/MedicineSearchBar'
import InvoicePDF from '../components/InvoicePDF'

const BillGenerator = () => {
  const {
    currentBill,
    selectedProduct,
    selectedQuantity,
    temporaryBills,
    setCustomerDetails,
    setSelectedProduct,
    setSelectedQuantity,
    addItemToBill,
    removeItemFromBill,
    removeSpecificItem,
    updateItemQuantity,
    updateItemDiscount,
    setDiscount,
    saveTemporaryBill,
    clearCurrentBill,
    loadTemporaryBill,
    deleteTemporaryBill
  } = useBillStore()

  // Create ref for MedicineSearchBar to access clearSearch function
  const medicineSearchRef = useRef(null)

  const { medicines } = useMedicineStore()
  const [showSavedBills, setShowSavedBills] = useState(false)

  const availableMedicines = medicines.filter(medicine => medicine.quantity > 0)

  const handleCustomerNameChange = (e) => {
    setCustomerDetails(e.target.value, currentBill.customerPhone, currentBill.customerType)
  }

  const handleCustomerPhoneChange = (e) => {
    setCustomerDetails(currentBill.customerName, e.target.value, currentBill.customerType)
  }

  const handleCustomerTypeChange = (e) => {
    setCustomerDetails(currentBill.customerName, currentBill.customerPhone, e.target.value)
  }

  const handleMedicineSelect = (medicine) => {
    setSelectedProduct(medicine)
  }

  const [unitQuantity, setUnitQuantity] = useState("")
  const [boxQuantity, setBoxQuantity] = useState("")
  const [stockAlert, setStockAlert] = useState("")

  const handleUnitQuantityChange = (e) => {
    const value = e.target.value
    setUnitQuantity(value)
    const quantity = parseInt(value) || 0
    const boxQty = parseInt(boxQuantity) || 0
    checkStockAvailability(quantity, boxQty)
  }

  const handleBoxQuantityChange = (e) => {
    const value = e.target.value
    setBoxQuantity(value)
    const quantity = parseInt(value) || 0
    const unitQty = parseInt(unitQuantity) || 0
    checkStockAvailability(unitQty, quantity)
  }

  const getIndexColor = (index) => {
    // Consistent black background with white text for all numbers
    return 'bg-black text-white hover:bg-gray-800 transition-colors duration-200'
  }

  const formatTooltipInfo = (item) => {
    const boxes = Math.ceil(item.quantity / (item.unitsPerBox || 1))
    const expiryDate = item.expiryDate || 'N/A'
    return `Brand: ${item.name} | Generic: ${item.genericName || 'N/A'} | Company: ${item.companyName || 'N/A'} | Units: ${item.quantity} | Boxes: ${boxes} | Expiry: ${expiryDate}`
  }

  const checkStockAvailability = (units, boxes) => {
    if (!selectedProduct) {
      setStockAlert("")
      return
    }
    
    const availableStock = selectedProduct.quantity
    const unitsPerBox = selectedProduct.unitsPerBox || 1
    const availableBoxes = Math.floor(availableStock / unitsPerBox)
    const threshold = selectedProduct.lowStockThreshold || 50
    
    // Calculate total units requested
    const totalUnitsFromBoxes = boxes * unitsPerBox
    const totalRequested = units + totalUnitsFromBoxes
    
    if (totalRequested > availableStock) {
      if (availableStock === 0) {
        setStockAlert(`❌ This medicine is Out of Stock. You cannot add any quantity.`)
      } else if (availableStock <= threshold) {
        setStockAlert(`⚠️ Low Stock Alert! Available: ${availableStock} units (${availableBoxes} boxes). You can add maximum ${availableStock} units or ${availableBoxes} boxes.`)
      } else {
        setStockAlert(`⚠️ Insufficient stock. Available: ${availableStock} units (${availableBoxes} boxes). You can add maximum ${availableStock} units or ${availableBoxes} boxes.`)
      }
    } else if (availableStock <= threshold && totalRequested > 0) {
      setStockAlert(`⚠️ Low Stock Warning! Available: ${availableStock} units (${availableBoxes} boxes). This medicine is running low.`)
    } else {
      setStockAlert("")
    }
  }

  // Helper function to get price and discount based on customer type
  const getPriceAndDiscountForCustomerType = (medicine, customerType) => {
    let sellingPrice = 0
    let discountPercentage = 0

    switch (customerType) {
      case 'Doctor':
        sellingPrice = medicine.doctorSellingPrice || medicine.customerSellingPrice || 0
        discountPercentage = medicine.doctorDiscountPercentage || 0
        break
      case 'Medical Professional':
        sellingPrice = medicine.medicalProfessionalSellingPrice || medicine.customerSellingPrice || 0
        discountPercentage = medicine.medicalProfessionalDiscountPercentage || 0
        break
      default: // General Customer
        sellingPrice = medicine.customerSellingPrice || 0
        discountPercentage = medicine.customerDiscountPercentage || 0
        break
    }
    return { sellingPrice, discountPercentage }
  }

  const handleAddToBill = () => {
    const unitQty = parseInt(unitQuantity) || 0
    const boxQty = parseInt(boxQuantity) || 0
    
    if (unitQty === 0 && boxQty === 0) {
      alert('Please enter at least one quantity (units or boxes)')
      return
    }
    
    if (!selectedProduct) {
      alert('Please select a medicine first')
      return
    }
    
    // Check stock availability before adding
    const availableStock = selectedProduct.quantity
    const unitsPerBox = selectedProduct.unitsPerBox || 1
    const totalUnitsFromBoxes = boxQty * unitsPerBox
    const totalRequested = unitQty + totalUnitsFromBoxes
    
    if (availableStock === 0) {
      alert('❌ This medicine is Out of Stock. You cannot add any quantity.')
      return
    }
    
    if (totalRequested > availableStock) {
      const availableBoxes = Math.floor(availableStock / unitsPerBox)
      alert(`⚠️ Insufficient stock! Available: ${availableStock} units (${availableBoxes} boxes). Please reduce the quantity.`)
      return
    }
    
    // Get price and discount based on selected customer type
    const { sellingPrice, discountPercentage } = getPriceAndDiscountForCustomerType(
      selectedProduct,
      currentBill.customerType
    )

    addItemToBill(unitQty, boxQty, sellingPrice, discountPercentage)
    setUnitQuantity("")
    setBoxQuantity("")
    setStockAlert("")
    
    // Clear search suggestions and selected medicine after adding to bill
    if (medicineSearchRef.current) {
      medicineSearchRef.current.clearSearch()
    }
  }

  // PDF Generation Function
  const generatePDF = async () => {
    if (currentBill.items.length === 0) {
      alert('Please add items to the bill before generating PDF')
      return
    }

    try {
      const billData = {
        customerName: currentBill.customerName,
        customerPhone: currentBill.customerPhone,
        customerType: currentBill.customerType,
        items: currentBill.items.map(item => ({
          name: item.name,
          genericName: item.genericName,
          quantityType: item.quantityType,
          quantity: item.quantity,
          price: item.unitPrice, // This will now be the customerSellingPrice
          discount: item.discount, // Corrected from item.discountPercentage
          totalPrice: item.total
        })),
        discount: currentBill.discountPercentage,
        subtotal: currentBill.subtotal,
        grandTotal: currentBill.grandTotal
      }

      const blob = await pdf(<InvoicePDF billData={billData} />).toBlob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `invoice-${Date.now()}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Receipt className="text-green-600" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Bill Generator</h1>
                <p className="text-gray-500">Create and manage customer bills</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowSavedBills(!showSavedBills)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {showSavedBills ? 'Hide' : 'Show'} Saved Bills
              </button>
              <button
                onClick={clearCurrentBill}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Clear Bill
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Customer Details & Product Selection */}
          <div className="space-y-6">
            {/* Customer Details */}
            <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="text-blue-600" size={20} />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Customer Details</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={currentBill.customerName}
                      onChange={handleCustomerNameChange}
                      placeholder="Enter customer name"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="tel"
                      value={currentBill.customerPhone}
                      onChange={handleCustomerPhoneChange}
                      placeholder="Enter phone number"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Type
                  </label>
                  <div className="relative">
                    <select
                      value={currentBill.customerType}
                      onChange={handleCustomerTypeChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    >
                      <option value="General Customer">👥 General Customer</option>
                      <option value="Doctor">👨‍⚕️ Doctor</option>
                      <option value="Medical Professional">🏥 Medical Professional</option>
                    </select>
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9l4.95 4.95z"/></svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="date"
                      value={currentBill.date}
                      readOnly
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Product Selection */}
            <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Package className="text-green-600" size={20} />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Product Selection</h2>
              </div>

              <div className="space-y-4">
                <MedicineSearchBar
                  ref={medicineSearchRef}
                  medicines={availableMedicines}
                  onMedicineSelect={handleMedicineSelect}
                  selectedMedicine={selectedProduct}
                  customerType={currentBill.customerType} // Pass customerType to MedicineSearchBar
                />

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Sell by Piece
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={selectedProduct?.quantity || 999}
                    value={unitQuantity}
                    onChange={handleUnitQuantityChange}
                    placeholder="Enter pieces (e.g., 5)"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 text-gray-800 font-medium"
                  />
                  <p className="text-xs text-gray-600 mt-2 font-medium">Enter number of individual pieces (e.g., tablets, capsules).</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Sell by Box
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={boxQuantity}
                    onChange={handleBoxQuantityChange}
                    placeholder="Enter boxes (e.g., 2)"
                    className="w-full px-4 py-3 bg-blue-50 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 text-gray-800 font-medium"
                  />
                  <p className="text-xs text-gray-600 mt-2 font-medium">Enter number of boxes or packs.</p>
                </div>

                {stockAlert && (
                  <div className="p-3 bg-red-100 border border-red-300 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="text-red-600">⚠️</div>
                      <p className="text-sm text-red-700 font-medium">{stockAlert}</p>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleAddToBill}
                  disabled={!selectedProduct}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus size={18} />
                  <span>Add to Bill</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Bill Preview */}
          <div className="space-y-4 md:space-y-6">
            {/* Bill Items */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 md:p-6">
              <div className="flex items-center space-x-3 mb-4 md:mb-6">
                <div className="p-2 md:p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl shadow-md">
                  <ShoppingCart className="text-white" size={20} />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-800">Bill Preview</h2>
                  <p className="text-xs md:text-sm text-gray-600">Review your selected items</p>
                </div>
              </div>

              {currentBill.items.length === 0 ? (
                <div className="text-center py-8 md:py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <div className="p-3 md:p-4 bg-gradient-to-r from-gray-400 to-blue-400 rounded-full w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 flex items-center justify-center">
                    <ShoppingCart className="text-white" size={24} />
                  </div>
                  <p className="text-gray-600 font-semibold text-base md:text-lg">No items added to bill yet</p>
                  <p className="text-gray-500 text-sm mt-2">Start by searching and adding medicines above</p>
                </div>
              ) : (
                <div className="space-y-3 md:space-y-4">
                  {currentBill.items.map((item, index) => (
                    <div key={item.itemId} className="bg-white rounded-xl shadow-md border border-gray-200 p-3 md:p-4 hover:shadow-lg transition-all duration-200">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {/* Black Index Badge with Enhanced Tooltip */}
                            <div className="relative group">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${getIndexColor(index)} cursor-help shadow-md`}>
                                {index + 1}
                              </div>
                              {/* Enhanced Tooltip */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-4 py-3 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-20 shadow-xl border border-gray-700">
                                <div className="font-semibold text-center mb-1">Medicine Details</div>
                                <div className="text-gray-200">{formatTooltipInfo(item)}</div>
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                              </div>
                            </div>
                            <h4 className="font-bold text-gray-800 text-sm md:text-base">{item.name}</h4>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2 md:p-3 mb-2">
                            <div className="text-xs md:text-sm font-medium text-gray-700">
                              <span className="text-green-600">PKR {item.unitPrice?.toFixed(2)}</span> × <span className="text-blue-600">{item.quantity}</span>
                              {item.displayText && (
                                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                  {item.displayText}
                                </span>
                              )}
                              {item.discountPercentage > 0 && (
                                <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                                  {item.discountPercentage}% OFF
                                </span>
                              )}
                            </div>
                            {item.discountPercentage > 0 && (
                              <div className="text-xs text-gray-600 mt-1">
                                <span className="text-gray-500">Subtotal:</span> <span className="text-green-600">PKR {item.subtotal?.toFixed(2)}</span> 
                                <span className="text-gray-500 mx-1">-</span> 
                                <span className="text-orange-600">PKR {item.discountAmount?.toFixed(2)}</span> 
                                <span className="text-gray-500 mx-1">=</span> 
                                <span className="text-blue-600 font-medium">PKR {item.total?.toFixed(2)}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <label className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">Discount %:</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              value={item.discountPercentage || 0}
                              onChange={(e) => updateItemDiscount(item.itemId, parseFloat(e.target.value) || 0)}
                              className="w-16 md:w-20 px-2 py-1 text-xs md:text-sm border border-gray-300 rounded focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-all"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between md:justify-end space-x-2 md:space-x-3 md:ml-4">
                          <div className="text-right">
                            <div className="text-lg md:text-xl font-bold text-blue-600">
                              PKR {item.total?.toFixed(2)}
                            </div>
                          </div>
                          <button
                            onClick={() => removeSpecificItem(item.itemId)}
                            className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bill Summary */}
            {currentBill.items.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 md:p-6">
                <div className="flex items-center space-x-3 mb-4 md:mb-6">
                  <div className="p-2 md:p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl shadow-md">
                    <DollarSign className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-800">Bill Summary</h3>
                    <p className="text-xs md:text-sm text-gray-600">Final calculation breakdown</p>
                  </div>
                </div>
                
                <div className="space-y-3 md:space-y-4 bg-gray-50 rounded-xl p-3 md:p-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-700 font-medium flex items-center text-sm md:text-base">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                      Subtotal:
                    </span>
                    <span className="text-base md:text-lg font-bold text-gray-800">PKR {currentBill.subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-orange-600 font-medium flex items-center text-sm md:text-base">
                      <div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
                      Medicine Discounts:
                    </span>
                    <span className="text-base md:text-lg font-bold text-orange-600">- PKR {currentBill.discount.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-700 font-medium flex items-center text-sm md:text-base">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      After Discount:
                    </span>
                    <span className="text-base md:text-lg font-bold text-green-600">PKR {(currentBill.subtotal - currentBill.discount).toFixed(2)}</span>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-3 md:p-4 mt-4 border border-green-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg md:text-xl font-bold text-gray-800 flex items-center">
                        <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mr-3"></div>
                        Grand Total:
                      </span>
                      <span className="text-xl md:text-2xl font-bold text-blue-600">
                        PKR {currentBill.grandTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={saveTemporaryBill}
                  className="w-full mt-4 md:mt-6 flex items-center justify-center space-x-2 md:space-x-3 px-4 md:px-6 py-3 md:py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm md:text-base"
                >
                  <Save size={18} />
                  <span>Save Temporary Bill</span>
                </button>

                <button
                  onClick={generatePDF}
                  className="w-full mt-3 md:mt-4 flex items-center justify-center space-x-2 md:space-x-3 px-4 md:px-6 py-3 md:py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl hover:from-green-600 hover:to-teal-600 transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm md:text-base"
                >
                  <FileText size={18} />
                  <span>Generate PDF Invoice</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BillGenerator



