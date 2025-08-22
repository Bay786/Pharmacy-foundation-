import { useState, useRef } from 'react'
import { Upload, X, FileText, AlertCircle, ChevronDown, ArrowRight, MapPin, CheckCircle } from 'lucide-react'
import useMedicineStore from '../store/medicineStore'

const ImportModal = ({ isOpen, onClose }) => {
  const { addMedicine } = useMedicineStore()
  const [selectedFile, setSelectedFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(1) // 1: File Selection, 2: Preview & Settings, 3: Field Mapping
  const [delimiter, setDelimiter] = useState(',')
  const [previewData, setPreviewData] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [fieldMappings, setFieldMappings] = useState({})
  const [importMethod, setImportMethod] = useState('file') // 'file' or 'paste'
  const [pastedData, setPastedData] = useState('')
  const fileInputRef = useRef(null)

  if (!isOpen) return null

  // System fields that can be mapped to
  const systemFields = [
    { value: '', label: 'Skip this column', description: 'Do not import this column' },
    { value: 'medicineName', label: 'Medicine Name', description: 'Name of the medicine', required: true },
    { value: 'genericName', label: 'Generic Name', description: 'Generic/scientific name' },
    { value: 'companyName', label: 'Company Name', description: 'Manufacturer company' },
    { value: 'medicineType', label: 'Medicine Type', description: 'Type (Tablet, Capsule, Syrup, etc.)' },
    { value: 'unitsPerBox', label: 'Units Per Box', description: 'Number of units in one box', required: true },
    { value: 'totalStockUnits', label: 'Total Stock Units', description: 'Total units in stock', required: true },
    { value: 'customerSellingPrice', label: 'Customer Selling Price', description: 'Price for general customers', required: true },
    { value: 'doctorSellingPrice', label: 'Doctor Selling Price', description: 'Price for doctors' },
    { value: 'medicalProfessionalSellingPrice', label: 'Medical Professional Selling Price', description: 'Price for medical professionals' },
    { value: 'expiryDate', label: 'Expiry Date', description: 'Medicine expiry date' },
    { value: 'lowStockThreshold', label: 'Low Stock Alert Threshold', description: 'Alert threshold for low stock' }
  ]

  const delimiterOptions = [
    { value: ',', label: 'Comma (,)', description: 'Most common for CSV files' },
    { value: '\t', label: 'Tab', description: 'Tab-separated values' },
    { value: '|', label: 'Pipe (|)', description: 'Pipe-separated values' },
    { value: ';', label: 'Semicolon (;)', description: 'European CSV format' },
    { value: ':', label: 'Colon (:)', description: 'Colon-separated values' },
    { value: ' ', label: 'Space', description: 'Space-separated values' }
  ]

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      processFile(file)
    }
  }

  const processFile = (file) => {
    // Check if file is CSV or Excel
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
    
    if (allowedTypes.includes(file.type) || file.name.endsWith(".csv") || file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      setSelectedFile(file)
      if (file.name.toLowerCase().endsWith(".csv")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target.result
          const detectedDelimiter = detectDelimiter(content)
          setDelimiter(detectedDelimiter)
          generatePreview(file, content) // Pass content for immediate parsing
        }
        reader.readAsText(file)
      } else {
        generatePreview(file)
      }
    } else {
      alert("Please select a valid CSV or Excel file (.csv, .xlsx, .xls)")
    }
  }

  const generatePreview = (file, content = null) => {
    setIsProcessing(true)

    const processContent = (fileContent) => {
      let parsedData

      if (file.name.toLowerCase().endsWith(".csv")) {
        const lines = fileContent.split(/\r\n|\n/)
        const headers = lines[0].split(delimiter).map(h => h.trim().replace(/"/g, ""))
        const rows = lines.slice(1, 6).map(line => line.split(delimiter).map(cell => cell.trim().replace(/"/g, "")))
        parsedData = {
          headers,
          rows: rows.filter(row => row.some(cell => cell.length > 0))
        }
      } else if (file.name.toLowerCase().endsWith(".xlsx") || file.name.toLowerCase().endsWith(".xls")) {
        parsedData = {
          headers: ["Medicine Name", "Generic Name", "Company Name", "Medicine Type", "Units Per Box", "Total Stock Units", "Customer Selling Price"],
          rows: [
            ["Excel Med 1", "Gen 1", "Comp A", "Tablet", "10", "100", "10.00"],
            ["Excel Med 2", "Gen 2", "Comp B", "Capsule", "20", "200", "20.00"],
            ["Excel Med 3", "Gen 3", "Comp C", "Syrup", "30", "300", "30.00"],
          ]
        }

      } else {
        alert("Unsupported file type.")
        setIsProcessing(false)
        return
      }

      setPreviewData(parsedData)
      setIsProcessing(false)
      setCurrentStep(2)
    }

    if (content) {
      processContent(content)
    } else if (file.name.toLowerCase().endsWith(".csv")) {
      const reader = new FileReader()
      reader.onload = (e) => processContent(e.target.result)
      reader.onerror = (error) => {
        console.error("Error reading file:", error)
        alert("Error reading file. Please try again.")
        setIsProcessing(false)
      }
      reader.readAsText(file)
    } else if (file.name.toLowerCase().endsWith(".xlsx") || file.name.toLowerCase().endsWith(".xls")) {
      // For Excel, we still use the mock data as direct client-side parsing is complex
      processContent(null) // Pass null to trigger mock data generation
    }
  }

  const detectDelimiter = (text) => {
    const lines = text.trim().split('\n')
    if (lines.length < 2) return ','
    
    const delimiters = [',', '\t', ';', '|', ':', ' ']
    let bestDelimiter = ','
    let maxColumns = 0
    
    for (const delimiter of delimiters) {
      const firstRowColumns = lines[0].split(delimiter).length
      const secondRowColumns = lines[1].split(delimiter).length
      
      if (firstRowColumns === secondRowColumns && firstRowColumns > maxColumns) {
        maxColumns = firstRowColumns
        bestDelimiter = delimiter
      }
    }
    
    return bestDelimiter
  }

  const processPastedData = () => {
    if (!pastedData.trim()) {
      alert('Please paste some data first.')
      return
    }
    
    setIsProcessing(true)
    
    setTimeout(() => {
      const lines = pastedData.trim().split("\n")
      if (lines.length < 2) {
        alert("Please paste data with at least 2 rows (header and data).")
        setIsProcessing(false)
        return
      }

      // Auto-detect delimiter
      const detectedDelimiter = detectDelimiter(pastedData)
      setDelimiter(detectedDelimiter)

      // Use generatePreview with the pasted data as content
      generatePreview({ name: "pasted_data.csv" }, pastedData) // Mock file object for consistency
    }, 1000)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const handleBack = () => {
    setCurrentStep(1)
    setPreviewData(null)
  }

  const handleProceed = () => {
    if (currentStep === 2) {
      // Move to field mapping step
      setCurrentStep(3)
      // Initialize field mappings with intelligent defaults
      initializeFieldMappings()
    } else if (currentStep === 3) {
      // Process the import with field mappings
      handleImport()
    }
  }

  const initializeFieldMappings = () => {
    if (!previewData?.headers) return
    
    const mappings = {}
    previewData.headers.forEach((header, index) => {
      // Try to auto-match headers with system fields
      const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '')
      
      // Auto-mapping logic
      if (normalizedHeader.includes('medicinename') || normalizedHeader.includes('name')) {
        mappings[index] = 'medicineName'
      } else if (normalizedHeader.includes('generic')) {
        mappings[index] = 'genericName'
      } else if (normalizedHeader.includes('company') || normalizedHeader.includes('manufacturer')) {
        mappings[index] = 'companyName'
      } else if (normalizedHeader.includes('type')) {
        mappings[index] = 'medicineType'
      } else if (normalizedHeader.includes('unitsperbox') || normalizedHeader.includes('perbox')) {
        mappings[index] = 'unitsPerBox'
      } else if (normalizedHeader.includes('totalstock') || normalizedHeader.includes('stock')) {
        mappings[index] = 'totalStockUnits'
      } else if (normalizedHeader.includes('customerprice') || normalizedHeader.includes('customersellingprice')) {
        mappings[index] = 'customerSellingPrice'
      } else if (normalizedHeader.includes('doctorprice') || normalizedHeader.includes('doctorsellingprice')) {
        mappings[index] = 'doctorSellingPrice'
      } else if (normalizedHeader.includes('medicalprofessional') || normalizedHeader.includes('professionalprice')) {
        mappings[index] = 'medicalProfessionalSellingPrice'
      } else if (normalizedHeader.includes('expiry') || normalizedHeader.includes('date')) {
        mappings[index] = 'expiryDate'
      } else if (normalizedHeader.includes('threshold') || normalizedHeader.includes('alert')) {
        mappings[index] = 'lowStockThreshold'
      } else {
        mappings[index] = '' // Skip by default
      }
    })
    
    setFieldMappings(mappings)
  }

  const handleFieldMappingChange = (columnIndex, systemField) => {
    setFieldMappings(prev => ({
      ...prev,
      [columnIndex]: systemField
    }))
  }

  const handleImport = () => {
    // No validation for required fields, allow partial imports
    
    // Check for duplicate mappings
    const mappedFields = Object.values(fieldMappings).filter(field => field !== "")
    const uniqueMappedFields = new Set(mappedFields)
    
    if (mappedFields.length !== uniqueMappedFields.size) {
      alert("Each system field can only be mapped to one column. Please check for duplicate mappings.")
      return
    }
    
    // Process and save the imported data
    let successCount = 0
    let errorCount = 0

    try {
      // Ensure previewData.rows is available and is an array
      if (!previewData || !Array.isArray(previewData.rows)) {
        throw new Error("Invalid preview data for import.")
      }

      previewData.rows.forEach((row, rowIndex) => {
        try {
          // Create medicine object from mapped fields
          const medicineData = {}

          // Map each column to the corresponding system field
          Object.entries(fieldMappings).forEach(([columnIndex, systemField]) => {
            if (systemField && systemField !== '') {
              const cellValue = row[parseInt(columnIndex)]

              // Handle different field types
              switch (systemField) {
                case "medicineName":
                  medicineData.name = cellValue || ""
                  break
                case "genericName":
                  medicineData.genericName = cellValue || ""
                  break
                case "companyName":
                  medicineData.company = cellValue || ""
                  break
                case "medicineType":
                  medicineData.type = cellValue || "Tablet"
                  break
                case "unitsPerBox":
                  medicineData.unitsPerBox = parseInt(cellValue) || 1
                  break
                case "totalStockUnits":
                  medicineData.quantity = parseInt(cellValue) || 0
                  break
                case "customerSellingPrice":
                  medicineData.price = parseFloat(cellValue) || 0
                  break
                case "doctorSellingPrice":
                  medicineData.doctorPrice = parseFloat(cellValue) || 0
                  break
                case "medicalProfessionalSellingPrice":
                  medicineData.professionalPrice = parseFloat(cellValue) || 0
                  break
                case "expiryDate":
                  // Try to parse date, default to 1 year from now if invalid
                  try {
                    const parsedDate = new Date(cellValue)
                    if (isNaN(parsedDate.getTime())) {
                      const oneYearFromNow = new Date()
                      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)
                      medicineData.expiryDate = oneYearFromNow.toISOString().split("T")[0]
                    } else {
                      medicineData.expiryDate = parsedDate.toISOString().split("T")[0]
                    }
                  } catch {
                    const oneYearFromNow = new Date()
                    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)
                    medicineData.expiryDate = oneYearFromNow.toISOString().split("T")[0]
                  }
                  break
                case "lowStockThreshold":
                  medicineData.lowStockThreshold = parseInt(cellValue) || 50
                  break
              }
            }
          })

          // Set default values for required fields if not provided
          if (!medicineData.name) {
            medicineData.name = `Imported Medicine ${rowIndex + 1}`
          }
          if (!medicineData.type) {
            medicineData.type = "Tablet"
          }
          if (medicineData.quantity === undefined) {
            medicineData.quantity = 0
          }
          if (medicineData.price === undefined) {
            medicineData.price = 0
          }
          if (!medicineData.expiryDate) {
            const oneYearFromNow = new Date()
            oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)
            medicineData.expiryDate = oneYearFromNow.toISOString().split("T")[0]
          }
          if (!medicineData.lowStockThreshold) {
            medicineData.lowStockThreshold = 50
          }
          if (!medicineData.unitsPerBox) {
            medicineData.unitsPerBox = 1
          }

          // Add the medicine to the store
          addMedicine(medicineData)
          successCount++

        } catch (error) {
          console.error(`Error processing row ${rowIndex + 1}:`, error)
          errorCount++
        }
      })

      // Show success message
      if (successCount > 0) {
        alert(`Import successful! ${successCount} medicines imported successfully.${errorCount > 0 ? ` ${errorCount} rows had errors and were skipped.` : ""}`)
      } else {
        alert("Import failed. No medicines were imported. Please check your data and try again.")
      }

    } catch (error) {
      console.error("Import error:", error)
      alert("Import failed due to an unexpected error. Please try again.")
    }

    // Reset and close
    handleCancel()
  }

  const getRequiredFieldsStatus = () => {
    const requiredFields = systemFields.filter(field => field.required).map(field => field.value)
    const mappedFields = Object.values(fieldMappings).filter(field => field !== '')
    return requiredFields.map(field => ({
      field,
      label: systemFields.find(sf => sf.value === field)?.label,
      mapped: mappedFields.includes(field)
    }))
  }

  const handleCancel = () => {
    setSelectedFile(null)
    setCurrentStep(1)
    setPreviewData(null)
    setFieldMappings({})
    setPastedData('')
    setImportMethod('file')
    onClose()
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const isCSVFile = selectedFile?.name.toLowerCase().endsWith('.csv')

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-100 bg-gradient-to-r from-orange-50 to-orange-100">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl shadow-lg">
              <Upload className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {currentStep === 1 ? 'Import Data' : currentStep === 2 ? 'Configure Import Settings' : 'Map Data Fields'}
              </h2>
              <p className="text-sm text-gray-600 font-medium">
                {currentStep === 1 ? 'Upload your Excel or CSV file' : currentStep === 2 ? 'Review and configure your data' : 'Map your file columns to system fields'}
              </p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-red-100 rounded-xl transition-all duration-200 hover:scale-110 group"
          >
            <X className="text-gray-500 group-hover:text-red-600" size={20} />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-3 ${currentStep >= 1 ? 'text-orange-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg transition-all duration-200 ${currentStep >= 1 ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                1
              </div>
              <span className="text-sm font-semibold">File Selection</span>
            </div>
            <ArrowRight className="text-gray-400" size={18} />
            <div className={`flex items-center space-x-3 ${currentStep >= 2 ? 'text-orange-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg transition-all duration-200 ${currentStep >= 2 ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                2
              </div>
              <span className="text-sm font-semibold">Preview & Settings</span>
            </div>
            <ArrowRight className="text-gray-400" size={18} />
            <div className={`flex items-center space-x-3 ${currentStep >= 3 ? 'text-orange-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg transition-all duration-200 ${currentStep >= 3 ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                3
              </div>
              <span className="text-sm font-semibold">Field Mapping</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 bg-white">
          {currentStep === 1 ? (
            // Step 1: File Selection
            <>
              {/* Import Method Tabs */}
              <div className="mb-8">
                <div className="flex border-b-2 border-gray-200 bg-gray-50 rounded-t-xl">
                  <button
                    onClick={() => setImportMethod('file')}
                    className={`px-6 py-4 font-semibold text-sm border-b-2 transition-all duration-200 rounded-tl-xl ${
                      importMethod === 'file'
                        ? 'border-orange-500 text-orange-600 bg-white shadow-lg'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    onClick={() => setImportMethod('paste')}
                    className={`px-6 py-4 font-semibold text-sm border-b-2 transition-all duration-200 ${
                      importMethod === 'paste'
                        ? 'border-orange-500 text-orange-600 bg-white shadow-lg'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Copy & Paste
                  </button>
                </div>
              </div>

              {importMethod === 'file' ? (
                // File Upload Section
                <>
                  {/* Instructions */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Select Your File</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Please select your Excel (.xlsx, .xls) or CSV (.csv) file containing medicine data.
                    </p>
                    
                    {/* Supported formats info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="text-blue-600 mt-0.5" size={16} />
                        <div>
                          <p className="text-sm font-medium text-blue-800">Supported Formats:</p>
                          <ul className="text-xs text-blue-700 mt-1 space-y-1">
                            <li>• Excel files (.xlsx, .xls)</li>
                            <li>• CSV files (.csv)</li>
                            <li>• Maximum file size: 10MB</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* File Upload Area */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      dragActive
                        ? 'border-orange-400 bg-orange-50'
                        : selectedFile
                        ? 'border-green-400 bg-green-50'
                        : 'border-gray-300 bg-gray-50 hover:border-orange-400 hover:bg-orange-50'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    
                    {isProcessing ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                        </div>
                        <p className="text-gray-600">Processing file...</p>
                      </div>
                    ) : selectedFile ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-center">
                          <FileText className="text-green-600" size={48} />
                        </div>
                        <div>
                          <p className="font-medium text-green-800">{selectedFile.name}</p>
                          <p className="text-sm text-green-600">{formatFileSize(selectedFile.size)}</p>
                        </div>
                        <button
                          onClick={handleBrowseClick}
                          className="text-sm text-orange-600 hover:text-orange-700 underline"
                        >
                          Choose different file
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-center">
                          <Upload className="text-gray-400" size={48} />
                        </div>
                        <div>
                          <p className="text-gray-600 mb-2">
                            Drag and drop your file here, or
                          </p>
                          <button
                            onClick={handleBrowseClick}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                          >
                            Browse Files
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sample Data Info */}
                  <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">Expected Data Format:</h4>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>• Medicine Name, Generic Name, Company Name</p>
                      <p>• Medicine Type, Units Per Box, Total Stock Units</p>
                      <p>• Customer Selling Price, Doctor Selling Price</p>
                      <p>• Medical Professional Selling Price, Expiry Date</p>
                      <p>• Low Stock Alert Threshold</p>
                    </div>
                  </div>
                </>
              ) : (
                // Copy & Paste Section
                <>
                  {/* Instructions */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Copy & Paste Your Data</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Copy data directly from Excel, Google Sheets, or any spreadsheet application and paste it below. The system will automatically detect the delimiter and format.
                    </p>
                    
                    {/* Instructions info */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="text-green-600 mt-0.5" size={16} />
                        <div>
                          <p className="text-sm font-medium text-green-800">How to use:</p>
                          <ul className="text-xs text-green-700 mt-1 space-y-1">
                            <li>• Select and copy data from your spreadsheet (Ctrl+C)</li>
                            <li>• Include the header row with column names</li>
                            <li>• Paste the data in the text area below (Ctrl+V)</li>
                            <li>• The system will auto-detect the delimiter format</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Paste Area */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Paste Your Data Here:
                    </label>
                    <textarea
                      value={pastedData}
                      onChange={(e) => setPastedData(e.target.value)}
                      placeholder="Paste your data here... 
Medicine Name	Generic Name	Company Name	Medicine Type	Units Per Box	Total Stock Units	Customer Selling Price
Paracetamol 500mg	Acetaminophen	GSK	Tablet	20	1000	5.00
Amoxicillin 250mg	Amoxicillin	Pfizer	Capsule	10	500	15.00"
                      className="w-full h-48 p-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none font-mono text-sm"
                    />
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        {pastedData.trim() ? `${pastedData.trim().split('\n').length} rows pasted` : 'No data pasted yet'}
                      </p>
                      {pastedData.trim() && (
                        <button
                          onClick={() => setPastedData('')}
                          className="text-xs text-red-600 hover:text-red-700 underline"
                        >
                          Clear data
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Processing Status */}
                  {isProcessing && (
                    <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                        <p className="text-orange-800">Processing pasted data...</p>
                      </div>
                    </div>
                  )}

                  {/* Sample Data Info */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">Tips for Best Results:</h4>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>• Make sure to include column headers in the first row</p>
                      <p>• Data should be properly aligned in columns</p>
                      <p>• Supported separators: Tab, Comma, Semicolon, Pipe, Colon, Space</p>
                      <p>• Empty rows will be automatically filtered out</p>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : currentStep === 2 ? (
            // Step 2: Preview & Settings
            <>
              {/* Import Method Info */}
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <FileText className="text-green-600" size={20} />
                  <div>
                    <p className="font-medium text-green-800">
                      {importMethod === 'file' ? `File: ${selectedFile?.name}` : 'Copy & Paste Import'}
                    </p>
                    <p className="text-sm text-green-600">
                      {importMethod === 'file' 
                        ? formatFileSize(selectedFile?.size || 0)
                        : `${pastedData.trim().split('\n').length} rows pasted`
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Delimiter Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Field Separator</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {importMethod === 'file' 
                    ? 'Select the delimiter used in your CSV file to properly parse the data. This setting is always available and can be changed for both CSV and Excel files.'
                    : `Auto-detected delimiter: ${delimiterOptions.find(opt => opt.value === delimiter)?.label || 'Comma'}. You can change this if needed.`
                  }
                </p>
                
                <div className="relative">
                  <select
                    value={delimiter}
                    onChange={(e) => setDelimiter(e.target.value)}
                    className="w-full p-3 border-2 border-orange-400 rounded-lg bg-white text-gray-800 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 cursor-pointer"
                    disabled={false}
                  >
                    {delimiterOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} - {option.description}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                </div>
              </div>

              {/* Data Preview */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Data Preview</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Preview of the first 5 rows from your file. Please verify that the data is parsed correctly.
                </p>
                
                {previewData && (
                  <div className="border-2 border-gray-200 rounded-xl overflow-hidden shadow-lg bg-white">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                          <tr>
                            {previewData.headers.map((header, index) => (
                              <th
                                key={index}
                                className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider whitespace-nowrap border-b-2 border-gray-300 bg-gradient-to-b from-gray-50 to-gray-100"
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {previewData.rows.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-blue-50 transition-colors duration-150 even:bg-gray-50">
                              {row.map((cell, cellIndex) => (
                                <td
                                  key={cellIndex}
                                  className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap font-medium border-r border-gray-200 last:border-r-0"
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                <div className="mt-3 text-xs text-gray-500">
                  Showing first 5 rows. Total rows will be processed during import.
                </div>
              </div>
            </>
          ) : (
            // Step 3: Field Mapping
            <>
              {/* Instructions */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Map Your Data Fields</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Map each column from your file to the corresponding system field. Required fields are marked with an asterisk (*).
                </p>
                
                {/* Required Fields Status */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="flex items-start space-x-2">
                    <MapPin className="text-blue-600 mt-0.5" size={16} />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Required Fields Status:</p>
                      <div className="mt-2 space-y-1">
                        {getRequiredFieldsStatus().map((status, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            {status.mapped ? (
                              <CheckCircle className="text-green-600" size={14} />
                            ) : (
                              <AlertCircle className="text-red-600" size={14} />
                            )}
                            <span className={`text-xs ${status.mapped ? 'text-green-700' : 'text-red-700'}`}>
                              {status.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Field Mapping Table */}
              {previewData && (
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-800">Column Mapping</h4>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <div className="grid grid-cols-3 gap-4 text-sm font-medium text-gray-700">
                        <div>File Column</div>
                        <div>Sample Data</div>
                        <div>Map to System Field</div>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {previewData.headers.map((header, index) => (
                        <div key={index} className="px-4 py-4">
                          <div className="grid grid-cols-3 gap-4 items-center">
                            {/* File Column */}
                            <div>
                              <p className="font-medium text-gray-800">{header}</p>
                              <p className="text-xs text-gray-500">Column {index + 1}</p>
                            </div>
                            
                            {/* Sample Data */}
                            <div>
                              <p className="text-sm text-gray-600 truncate">
                                {previewData.rows[0]?.[index] || 'No data'}
                              </p>
                              {previewData.rows[1]?.[index] && (
                                <p className="text-xs text-gray-400 truncate">
                                  {previewData.rows[1][index]}
                                </p>
                              )}
                            </div>
                            
                            {/* System Field Mapping */}
                            <div className="relative">
                              <select
                                value={fieldMappings[index] || ''}
                                onChange={(e) => handleFieldMappingChange(index, e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none"
                              >
                                {systemFields.map((field) => (
                                  <option key={field.value} value={field.value}>
                                    {field.label}{field.required ? ' *' : ''}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                              
                              {/* Field Description */}
                              {fieldMappings[index] && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {systemFields.find(f => f.value === fieldMappings[index])?.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div>
            {(currentStep === 2 || currentStep === 3) && (
              <button
                onClick={handleBack}
                className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-semibold transition-all duration-200 hover:from-gray-200 hover:to-gray-300 hover:shadow-md hover:scale-105 flex items-center space-x-2 border border-gray-300 hover:border-gray-400"
              >
                <span className="text-lg">←</span>
                <span>Back</span>
              </button>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleCancel}
              className="px-5 py-3 text-gray-600 hover:text-gray-800 font-semibold transition-all duration-200 hover:bg-gray-200 rounded-xl"
            >
              Cancel
            </button>
            {currentStep === 2 ? (
              <button
                onClick={handleProceed}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Proceed to Field Mapping
              </button>
            ) : currentStep === 3 ? (
              <button
                onClick={handleProceed}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Import Data
              </button>
            ) : (
              <button
                onClick={() => {
                  if (importMethod === 'file') {
                    selectedFile && generatePreview(selectedFile)
                  } else {
                    processPastedData()
                  }
                }}
                disabled={
                  isProcessing || 
                  (importMethod === 'file' ? !selectedFile : !pastedData.trim())
                }
                className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg ${
                  !isProcessing && 
                  (importMethod === 'file' ? selectedFile : pastedData.trim())
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white hover:shadow-xl hover:scale-105'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isProcessing ? 'Processing...' : 'Next'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImportModal

