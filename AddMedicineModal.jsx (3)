import { useState, useEffect } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { X, Package, Plus, Edit, ChevronDown, ChevronUp } from 'lucide-react'
import useMedicineStore from '../store/medicineStore'
import SearchableDropdown from './SearchableDropdown'

const AddMedicineModal = () => {
  const { medicines, isAddModalOpen, setIsAddModalOpen, editingMedicine, setEditingMedicine, addMedicine, updateMedicine } = useMedicineStore()

  const [lastEditedField, setLastEditedField] = useState(null)
  const [isGeneralCustomerExpanded, setIsGeneralCustomerExpanded] = useState(true)
  const [isDoctorExpanded, setIsDoctorExpanded] = useState(false)
  const [isMedicalProfessionalExpanded, setIsMedicalProfessionalExpanded] = useState(false)

  const isEditing = !!editingMedicine

  // Find the latest version of the editing medicine from the store
  const currentEditingMedicine = isEditing ? medicines.find(m => m.id === editingMedicine.id) : null

  const validationSchema = Yup.object({
    name: Yup.string()
      .min(2, 'Medicine name must be at least 2 characters')
      .max(50, 'Medicine name must be less than 50 characters')
      .required('Medicine name is required'),
    genericName: Yup.string()
      .min(2, 'Generic name must be at least 2 characters')
      .max(50, 'Generic name must be less than 50 characters')
      .required('Generic name is required'),
    companyName: Yup.string()
      .min(2, 'Company name must be at least 2 characters')
      .max(50, 'Company name must be less than 50 characters')
      .required('Company name is required'),
    type: Yup.string()
      .min(2, 'Medicine type must be at least 2 characters')
      .required('Medicine type is required'),
    customerSellingPrice: Yup.number()
      .positive('Price must be a positive number')
      .max(999999, 'Price must be less than 1,000,000')
      .required('Customer Selling Price is required'),
    customerDiscountPercentage: Yup.number()
      .min(0, 'Discount cannot be negative')
      .max(100, 'Discount cannot exceed 100%')
      .required('Customer Discount Percentage is required'),
    doctorSellingPrice: Yup.number()
      .positive('Price must be a positive number')
      .max(999999, 'Price must be less than 1,000,000'),
    doctorDiscountPercentage: Yup.number()
      .min(0, 'Discount cannot be negative')
      .max(100, 'Discount cannot exceed 100%'),
    medicalProfessionalSellingPrice: Yup.number()
      .positive('Price must be a positive number')
      .max(999999, 'Price must be less than 1,000,000'),
    medicalProfessionalDiscountPercentage: Yup.number()
      .min(0, 'Discount cannot be negative')
      .max(100, 'Discount cannot exceed 100%'),
    purchasePrice: Yup.number()
      .min(0, 'Purchase price cannot be negative')
      .max(999999, 'Purchase price must be less than 1,000,000'),
    unitsPerBox: Yup.number()
      .positive('Units per box must be a positive number')
      .integer('Units per box must be a whole number')
      .max(99999, 'Units per box must be less than 100,000')
      .required('Units per box is required'),
    totalStockUnits: Yup.number()
      .integer('Total stock units must be a whole number')
      .min(0, 'Total stock units cannot be negative')
      .max(9999999, 'Total stock units must be less than 10,000,000')
      .test('stock-required', 'Either Total Stock Units or Total Stock Boxes is required', function(value) {
        const { totalStockBoxes } = this.parent;
        return value > 0 || totalStockBoxes > 0;
      }),
    totalStockBoxes: Yup.number()
      .integer('Total stock boxes must be a whole number')
      .min(0, 'Total stock boxes cannot be negative')
      .max(99999, 'Total stock boxes must be less than 100,000'),
    expiryDate: Yup.date()
      .min(new Date(), 'Expiry date cannot be in the past')
      .required('Expiry date is required'),
    lowStockThreshold: Yup.number()
      .integer('Low stock threshold must be a whole number')
      .min(0, 'Low stock threshold cannot be negative')
      .max(9999999, 'Low stock threshold must be less than 10,000,000')
      .test('is-less-than-total-stock', 'Low stock threshold must be less than Total Stock Units', function(value) {
        const { totalStockUnits } = this.parent;
        return value === undefined || totalStockUnits === undefined || value < totalStockUnits;
      })
  })

  const initialValues = {
    name: currentEditingMedicine?.name || '',
    genericName: currentEditingMedicine?.genericName || '',
    companyName: currentEditingMedicine?.companyName || '',
    type: currentEditingMedicine?.type || '',
    customerSellingPrice: currentEditingMedicine?.customerSellingPrice || '',
    customerDiscountPercentage: currentEditingMedicine?.customerDiscountPercentage || 0,
    doctorSellingPrice: currentEditingMedicine?.doctorSellingPrice || '',
    doctorDiscountPercentage: currentEditingMedicine?.doctorDiscountPercentage || 15,
    medicalProfessionalSellingPrice: currentEditingMedicine?.medicalProfessionalSellingPrice || '',
    medicalProfessionalDiscountPercentage: currentEditingMedicine?.medicalProfessionalDiscountPercentage || 10,
    purchasePrice: currentEditingMedicine?.purchasePrice || '',
    unitsPerBox: currentEditingMedicine?.unitsPerBox || '',
    totalStockUnits: currentEditingMedicine?.quantity || '', // Use 'quantity' for current stock
    totalStockBoxes: currentEditingMedicine?.quantity && currentEditingMedicine?.unitsPerBox ? Math.floor(currentEditingMedicine.quantity / currentEditingMedicine.unitsPerBox) : '',
    expiryDate: currentEditingMedicine?.expiryDate || '',
    lowStockThreshold: currentEditingMedicine?.lowStockThreshold || 0,
  }

  const handleFieldChange = (fieldName, value, setFieldValue, values) => {
    setFieldValue(fieldName, value)
    setLastEditedField(fieldName)

    if (fieldName === 'totalStockUnits' && value && values.unitsPerBox) {
      const calculatedBoxes = Math.floor(parseInt(value) / parseInt(values.unitsPerBox))
      setFieldValue('totalStockBoxes', calculatedBoxes)
    } else if (fieldName === 'totalStockBoxes' && value && values.unitsPerBox) {
      const calculatedUnits = parseInt(value) * parseInt(values.unitsPerBox)
      setFieldValue('totalStockUnits', calculatedUnits)
    } else if (fieldName === 'unitsPerBox' && value) {
      // Recalculate based on last edited field
      if (lastEditedField === 'totalStockBoxes' && values.totalStockBoxes) {
        const calculatedUnits = parseInt(values.totalStockBoxes) * parseInt(value)
        setFieldValue('totalStockUnits', calculatedUnits)
      } else if (lastEditedField === 'totalStockUnits' && values.totalStockUnits) {
        const calculatedBoxes = Math.floor(parseInt(values.totalStockUnits) / parseInt(value))
        setFieldValue('totalStockBoxes', calculatedBoxes)
      }
    }
  }

  const handleSubmit = (values, { setSubmitting, resetForm, setFieldError }) => {
    try {
      // Validate required fields
      if (!values.name || !values.genericName || !values.companyName || !values.type || !values.customerSellingPrice || !values.unitsPerBox) {
        alert('All required fields must be filled.')
        setSubmitting(false)
        return
      }

      // Calculate final values
      let finalTotalStockUnits = values.totalStockUnits || 0
      let finalTotalStockBoxes = values.totalStockBoxes || 0

      if (values.totalStockUnits && values.unitsPerBox) {
        finalTotalStockBoxes = Math.floor(values.totalStockUnits / values.unitsPerBox)
      } else if (values.totalStockBoxes && values.unitsPerBox) {
        finalTotalStockUnits = values.totalStockBoxes * values.unitsPerBox
      }

      const medicineData = {
        ...values,
        customerSellingPrice: parseFloat(values.customerSellingPrice) || 0,
        customerDiscountPercentage: parseFloat(values.customerDiscountPercentage) || 0,
        doctorSellingPrice: parseFloat(values.doctorSellingPrice) || 0,
        doctorDiscountPercentage: parseFloat(values.doctorDiscountPercentage) || 0,
        medicalProfessionalSellingPrice: parseFloat(values.medicalProfessionalSellingPrice) || 0,
        medicalProfessionalDiscountPercentage: parseFloat(values.medicalProfessionalDiscountPercentage) || 0,
        purchasePrice: parseFloat(values.purchasePrice) || 0,
        unitsPerBox: parseInt(values.unitsPerBox) || 1,
        totalStockUnits: parseInt(finalTotalStockUnits) || 0,
        totalStockBoxes: parseInt(finalTotalStockBoxes) || 0,
        // Keep quantity for backward compatibility
        quantity: parseInt(finalTotalStockUnits) || 0,
        id: isEditing ? editingMedicine.id : Date.now(),
        lowStockThreshold: parseInt(values.lowStockThreshold) || 50,
      }

      if (isEditing) {
        updateMedicine(editingMedicine.id, medicineData)
      } else {
        addMedicine(medicineData)
      }

      resetForm()
      handleClose()
    } catch (error) {
      console.error('Error saving medicine:', error)
      alert('Error saving medicine. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setIsAddModalOpen(false)
    setEditingMedicine(null)
  }

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }

    if (isAddModalOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isAddModalOpen])

  if (!isAddModalOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg h-[95vh] flex flex-col transform scale-95 sm:scale-100 transition-transform">
        <style jsx>{`
          @media (max-width: 640px) {
            .mobile-zoom {
              font-size: 16px;
              transform: scale(1.05);
            }
          }
        `}</style>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, errors, touched, values, setFieldValue }) => (
            <Form className="h-full flex flex-col">
              {/* Fixed Header */}
              <div className="flex-shrink-0 bg-gradient-to-r from-blue-50 via-blue-100 to-purple-50 border-b border-gray-200 shadow-sm rounded-t-xl">
                <div className="flex items-center justify-between p-4 lg:p-6">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 lg:p-3 rounded-lg ${isEditing ? 'bg-orange-100' : 'bg-blue-100'}`}>
                      {isEditing ? (
                        <Edit className="text-orange-600" size={20} />
                      ) : (
                        <Plus className="text-blue-600" size={20} />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-blue-800">
                        {isEditing ? `Edit Medicine - ${editingMedicine.name}` : 'Add New Medicine'}
                      </h3>
                      <p className="text-sm text-blue-600">
                        {isEditing ? 'Update medicine information below' : 'Enter medicine details below'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    type="button"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Scrollable Form Content */}
              <div className="flex-1 overflow-y-auto bg-gray-50 rounded-b-xl">
                <div className="p-4 lg:p-6 space-y-5">
                {/* Medicine Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    Medicine Name
                  </label>
                  <Field
                    name="name"
                    type="text"
                    placeholder="Enter medicine name"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all bg-white hover:bg-blue-50 ${
                      errors.name && touched.name ? 'border-red-300' : 'border-gray-300 hover:border-blue-300'
                    }`}
                  />
                  <p className="text-xs text-gray-600 mt-1">Enter the complete name of the medicine</p>
                  <ErrorMessage name="name" component="div" className="text-red-500 text-xs mt-1" />
                </div>

                {/* Generic Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    Generic Name
                  </label>
                  <Field
                    name="genericName"
                    type="text"
                    placeholder="Enter generic name"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base transition-all bg-white hover:bg-green-50 ${
                      errors.genericName && touched.genericName ? 'border-red-300' : 'border-gray-300 hover:border-green-300'
                    }`}
                  />
                  <p className="text-xs text-gray-600 mt-1">Enter the generic name for alternative medicine identification</p>
                  <ErrorMessage name="genericName" component="div" className="text-red-500 text-xs mt-1" />
                </div>

                {/* Company Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    Company Name (Manufacturer)
                  </label>
                  <Field
                    name="companyName"
                    type="text"
                    placeholder="Enter company name"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-base transition-all bg-white hover:bg-purple-50 ${
                      errors.companyName && touched.companyName ? 'border-red-300' : 'border-gray-300 hover:border-purple-300'
                    }`}
                  />
                  <p className="text-xs text-gray-600 mt-1">Enter the manufacturer or company name</p>
                  <ErrorMessage name="companyName" component="div" className="text-red-500 text-xs mt-1" />
                </div>

                {/* Medicine Type */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    Medicine Type
                  </label>
                  <SearchableDropdown
                    name="type"
                    value={values.type}
                    onChange={(value) => setFieldValue('type', value)}
                    error={errors.type && touched.type}
                    categories={[
                      'Capsule', 'Cream', 'Drops', 'Injection', 'Insulin', 
                      'Lotion', 'Ointment', 'Powder', 'Suspension', 'Syrup', 'Tablet'
                    ]}
                  />
                  <p className="text-xs text-gray-600 mt-1">Choose the appropriate medicine type or search for it</p>
                  <ErrorMessage name="type" component="div" className="text-red-500 text-xs mt-1" />
                </div>

                {/* General Customer Pricing */}
                <div className="border border-gray-200 rounded-xl">
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer bg-gray-50 rounded-t-xl"
                    onClick={() => setIsGeneralCustomerExpanded(!isGeneralCustomerExpanded)}
                  >
                    <h4 className="text-sm font-bold text-gray-800">👥 General Customer Pricing</h4>
                    {isGeneralCustomerExpanded ? (
                      <ChevronUp size={20} className="text-gray-600" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-600" />
                    )}
                  </div>
                  {isGeneralCustomerExpanded && (
                    <div className="p-4 space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-800 mb-2">
                          Customer Selling Price (PKR)
                        </label>
                        <Field
                          name="customerSellingPrice"
                          type="number"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all bg-white hover:bg-blue-50 ${
                            errors.customerSellingPrice && touched.customerSellingPrice ? 'border-red-300' : 'border-gray-300 hover:border-blue-300'
                          }`}
                        />
                        <p className="text-xs text-gray-600 mt-1">Enter the selling price per unit for general customers</p>
                        <ErrorMessage name="customerSellingPrice" component="div" className="text-red-500 text-xs mt-1" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-800 mb-2">
                          Customer Discount %
                        </label>
                        <div className="relative">
                          <Field
                            name="customerDiscountPercentage"
                            type="number"
                            placeholder="0"
                            min="0"
                            max="100"
                            step="0.01"
                            className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all bg-white hover:bg-blue-50 ${
                              errors.customerDiscountPercentage && touched.customerDiscountPercentage ? 'border-red-300' : 'border-gray-300 hover:border-blue-300'
                            }`}
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                            <span className="text-gray-500 font-bold text-base">%</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Enter discount in percentage for general customers (0-100%)</p>
                        <ErrorMessage name="customerDiscountPercentage" component="div" className="text-red-500 text-xs mt-1" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Doctor Pricing */}
                <div className="border border-gray-200 rounded-xl">
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer bg-gray-50 rounded-t-xl"
                    onClick={() => setIsDoctorExpanded(!isDoctorExpanded)}
                  >
                    <h4 className="text-sm font-bold text-gray-800">👨‍⚕️ Doctor Pricing</h4>
                    {isDoctorExpanded ? (
                      <ChevronUp size={20} className="text-gray-600" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-600" />
                    )}
                  </div>
                  {isDoctorExpanded && (
                    <div className="p-4 space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-800 mb-2">
                          Doctor Selling Price (PKR)
                        </label>
                        <Field
                          name="doctorSellingPrice"
                          type="number"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all bg-white hover:bg-blue-50 ${
                            errors.doctorSellingPrice && touched.doctorSellingPrice ? 'border-red-300' : 'border-gray-300 hover:border-blue-300'
                          }`}
                        />
                        <p className="text-xs text-gray-600 mt-1">Enter the selling price per unit for doctors</p>
                        <ErrorMessage name="doctorSellingPrice" component="div" className="text-red-500 text-xs mt-1" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-800 mb-2">
                          Doctor Discount %
                        </label>
                        <div className="relative">
                          <Field
                            name="doctorDiscountPercentage"
                            type="number"
                            placeholder="15"
                            min="0"
                            max="100"
                            step="0.01"
                            className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all bg-white hover:bg-blue-50 ${
                              errors.doctorDiscountPercentage && touched.doctorDiscountPercentage ? 'border-red-300' : 'border-gray-300 hover:border-blue-300'
                            }`}
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                            <span className="text-gray-500 font-bold text-base">%</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Enter discount in percentage for doctors (0-100%)</p>
                        <ErrorMessage name="doctorDiscountPercentage" component="div" className="text-red-500 text-xs mt-1" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Medical Professional Pricing */}
                <div className="border border-gray-200 rounded-xl">
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer bg-gray-50 rounded-t-xl"
                    onClick={() => setIsMedicalProfessionalExpanded(!isMedicalProfessionalExpanded)}
                  >
                    <h4 className="text-sm font-bold text-gray-800">🏥 Medical Professional Pricing</h4>
                    {isMedicalProfessionalExpanded ? (
                      <ChevronUp size={20} className="text-gray-600" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-600" />
                    )}
                  </div>
                  {isMedicalProfessionalExpanded && (
                    <div className="p-4 space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-800 mb-2">
                          Medical Professional Selling Price (PKR)
                        </label>
                        <Field
                          name="medicalProfessionalSellingPrice"
                          type="number"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all bg-white hover:bg-blue-50 ${
                            errors.medicalProfessionalSellingPrice && touched.medicalProfessionalSellingPrice ? 'border-red-300' : 'border-gray-300 hover:border-blue-300'
                          }`}
                        />
                        <p className="text-xs text-gray-600 mt-1">Enter the selling price per unit for medical professionals</p>
                        <ErrorMessage name="medicalProfessionalSellingPrice" component="div" className="text-red-500 text-xs mt-1" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-800 mb-2">
                          Medical Professional Discount %
                        </label>
                        <div className="relative">
                          <Field
                            name="medicalProfessionalDiscountPercentage"
                            type="number"
                            placeholder="10"
                            min="0"
                            max="100"
                            step="0.01"
                            className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all bg-white hover:bg-blue-50 ${
                              errors.medicalProfessionalDiscountPercentage && touched.medicalProfessionalDiscountPercentage ? 'border-red-300' : 'border-gray-300 hover:border-blue-300'
                            }`}
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                            <span className="text-gray-500 font-bold text-base">%</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Enter discount in percentage for medical professionals (0-100%)</p>
                        <ErrorMessage name="medicalProfessionalDiscountPercentage" component="div" className="text-red-500 text-xs mt-1" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Purchase Price */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    Purchase Price (PKR)
                  </label>
                  <Field
                    name="purchasePrice"
                    type="number"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-base transition-all bg-white hover:bg-purple-50 ${
                      errors.purchasePrice && touched.purchasePrice ? 'border-red-300' : 'border-gray-300 hover:border-purple-300'
                    }`}
                  />
                  <p className="text-xs text-gray-600 mt-1">Enter the purchase price per unit for reference (optional)</p>
                  <ErrorMessage name="purchasePrice" component="div" className="text-red-500 text-xs mt-1" />
                </div>

                {/* Units Per Box */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    Units Per Box
                  </label>
                  <Field
                    name="unitsPerBox"
                    type="number"
                    placeholder="1000"
                    min="1"
                    onChange={(e) => handleFieldChange('unitsPerBox', e.target.value, setFieldValue, values)}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all bg-white hover:bg-blue-50 ${
                      errors.unitsPerBox && touched.unitsPerBox ? 'border-red-300' : 'border-gray-300 hover:border-blue-300'
                    }`}
                  />
                  <p className="text-xs text-gray-600 mt-1">Enter the number of units per box</p>
                  <ErrorMessage name="unitsPerBox" component="div" className="text-red-500 text-xs mt-1" />
                </div>

                {/* Stock Management */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">
                      Total Stock Units
                    </label>
                    <Field
                      name="totalStockUnits"
                      type="number"
                      placeholder="3000"
                      min="0"
                      onChange={(e) => handleFieldChange('totalStockUnits', e.target.value, setFieldValue, values)}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base transition-all bg-white hover:bg-green-50 ${
                        lastEditedField === 'totalStockBoxes' ? 'bg-green-50 border-green-400' : ''
                      } ${
                        errors.totalStockUnits && touched.totalStockUnits ? 'border-red-300' : 'border-gray-300 hover:border-green-300'
                      }`}
                    />
                    <p className="text-xs text-gray-600 mt-1">Enter total units, boxes will auto-calculate</p>
                    <ErrorMessage name="totalStockUnits" component="div" className="text-red-500 text-xs mt-1" />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">
                      Total Stock Boxes (Optional)
                    </label>
                    <Field
                      name="totalStockBoxes"
                      type="number"
                      placeholder="3"
                      min="0"
                      onChange={(e) => handleFieldChange('totalStockBoxes', e.target.value, setFieldValue, values)}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base transition-all bg-white hover:bg-green-50 ${
                        lastEditedField === 'totalStockUnits' ? 'bg-green-50 border-green-400' : ''
                      } ${
                        errors.totalStockBoxes && touched.totalStockBoxes ? 'border-red-300' : 'border-gray-300 hover:border-green-300'
                      }`}
                    />
                    <p className="text-xs text-gray-600 mt-1">Enter total boxes if preferred</p>
                    <ErrorMessage name="totalStockBoxes" component="div" className="text-red-500 text-xs mt-1" />
                  </div>
                </div>

                {/* Low Stock Alert Threshold */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    Low Stock Alert Threshold (Units)
                  </label>
                  <Field
                    name="lowStockThreshold"
                    type="number"
                    placeholder="50"
                    min="0"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base transition-all bg-white hover:bg-orange-50 ${
                      errors.lowStockThreshold && touched.lowStockThreshold ? 'border-red-300' : 'border-gray-300 hover:border-orange-300'
                    }`}
                  />
                  <p className="text-xs text-gray-600 mt-1">Set the unit quantity at which a low stock alert will be triggered</p>
                  <ErrorMessage name="lowStockThreshold" component="div" className="text-red-500 text-xs mt-1" />
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    Expiry Date
                  </label>
                  <Field
                    name="expiryDate"
                    type="date"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all bg-white hover:bg-blue-50 ${
                      errors.expiryDate && touched.expiryDate ? 'border-red-300' : 'border-gray-300 hover:border-blue-300'
                    }`}
                  />
                  <p className="text-xs text-gray-600 mt-1">Select the expiry date</p>
                  <ErrorMessage name="expiryDate" component="div" className="text-red-500 text-xs mt-1" />
                </div>

                {/* Summary Section */}
                {(values.totalStockUnits || values.customerSellingPrice || values.customerDiscountPercentage) && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-blue-800 mb-2">Summary</h4>
                    <div className="text-xs text-blue-700 space-y-1">
                      <p>
                        <span className="font-semibold">Medicine:</span> {values.name || 'Not specified'}
                      </p>
                      <p>
                        <span className="font-semibold">Generic:</span> {values.genericName || 'Not specified'}
                      </p>
                      <p>
                        <span className="font-semibold">Company:</span> {values.companyName || 'Not specified'}
                      </p>
                      <p>
                        <span className="font-semibold">Total Stock:</span> {values.totalStockUnits || 0} units 
                        {values.totalStockBoxes ? ` (${values.totalStockBoxes} boxes)` : ''}
                      </p>
                      <p>
                        <span className="font-semibold">Customer Selling Price:</span> Rs. {values.customerSellingPrice || 0}
                      </p>
                      {values.customerDiscountPercentage && (
                        <p>
                          <span className="font-semibold">Customer Discount:</span> {values.customerDiscountPercentage}%
                        </p>
                      )}
                      {values.doctorSellingPrice && (
                        <p>
                          <span className="font-semibold">Doctor Selling Price:</span> Rs. {values.doctorSellingPrice}
                        </p>
                      )}
                      {values.doctorDiscountPercentage && (
                        <p>
                          <span className="font-semibold">Doctor Discount:</span> {values.doctorDiscountPercentage}%
                        </p>
                      )}
                      {values.medicalProfessionalSellingPrice && (
                        <p>
                          <span className="font-semibold">Medical Professional Selling Price:</span> Rs. {values.medicalProfessionalSellingPrice}
                        </p>
                      )}
                      {values.medicalProfessionalDiscountPercentage && (
                        <p>
                          <span className="font-semibold">Medical Professional Discount:</span> {values.medicalProfessionalDiscountPercentage}%
                        </p>
                      )}
                      {values.purchasePrice && (
                        <p>
                          <span className="font-semibold">Purchase Price:</span> Rs. {values.purchasePrice}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 shadow-lg">
                <div className="flex flex-col sm:flex-row gap-3 p-4 lg:p-6">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full sm:w-auto px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 font-bold transition-all text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold transition-all text-base flex items-center justify-center space-x-2 ${
                      isEditing
                        ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                        : 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer'
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        {isEditing ? <Edit size={18} /> : <Package size={18} />}
                        <span>{isEditing ? 'Update Medicine' : 'Save Medicine'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  )
}

export default AddMedicineModal


