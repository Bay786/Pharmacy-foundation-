import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import usePharmacyStore from '../store/pharmacyStore'

// Design 1: Classical Invoice Design - Implementing exact specifications
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 20, // A4 margins (20mm)
    fontFamily: 'Helvetica',
    position: 'relative',
    fontSize: 10,
    lineHeight: 1.4,
  },
  watermark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(-45deg)',
    fontSize: 20, // 20pt as specified
    color: '#6C757D',
    opacity: 0.5,
    zIndex: -1,
    fontWeight: 'bold'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#DEE2E6',
    borderBottomStyle: 'solid'
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1
  },
  logo: {
    width: 45,
    height: 45,
    marginRight: 12
  },
  companyInfo: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    flex: 1
  },
  companyName: {
    fontSize: 20, // 20pt as specified
    fontWeight: 'bold',
    color: '#000000', // Black as specified
    marginBottom: 6
  },
  companyDetails: {
    fontSize: 10, // 10pt as specified
    color: '#6C757D', // Light gray as specified
    lineHeight: 1.4,
    fontWeight: 'normal' // Arial Regular
  },
  operatingHours: {
    fontSize: 10,
    color: '#6C757D', // Light gray as specified
    marginTop: 4,
    fontWeight: 'normal' // Arial Regular
  },
  ownerInfo: {
    fontSize: 10,
    color: '#6C757D', // Light gray as specified
    marginTop: 4,
    fontWeight: 'normal' // Arial Regular
  },
  invoiceInfo: {
    flexDirection: 'column',
    alignItems: 'flex-end'
  },
  invoiceTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007BFF',
    marginBottom: 8
  },
  invoiceDetails: {
    fontSize: 10,
    color: '#000000',
    textAlign: 'right',
    lineHeight: 1.4,
    fontWeight: 'normal'
  },
  customerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderWidth: 1,
    borderColor: '#DEE2E6',
    borderStyle: 'solid'
  },
  customerInfo: {
    flexDirection: 'column'
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8
  },
  customerDetails: {
    fontSize: 10,
    color: '#000000',
    lineHeight: 1.4,
    fontWeight: 'normal'
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderColor: '#DEE2E6',
    marginBottom: 20
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row'
  },
  tableColHash: {
    width: '5%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#DEE2E6',
    backgroundColor: '#F8F9FA',
    padding: 8
  },
  tableColMedicineHeader: {
    width: '30%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#DEE2E6',
    backgroundColor: '#F8F9FA',
    padding: 8
  },
  tableColQuantityHeader: {
    width: '15%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#DEE2E6',
    backgroundColor: '#F8F9FA',
    padding: 8
  },
  tableColUnitPriceHeader: {
    width: '15%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#DEE2E6',
    backgroundColor: '#F8F9FA',
    padding: 8
  },
  tableColDiscountHeader: {
    width: '10%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#DEE2E6',
    backgroundColor: '#F8F9FA',
    padding: 8
  },
  tableColTotalHeader: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#DEE2E6',
    backgroundColor: '#F8F9FA',
    padding: 8
  },
  tableColHashData: {
    width: '5%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#DEE2E6',
    padding: 8,
    minHeight: 40
  },
  tableColMedicineData: {
    width: '30%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#DEE2E6',
    padding: 8,
    minHeight: 40
  },
  tableColQuantityData: {
    width: '15%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#DEE2E6',
    padding: 8,
    minHeight: 40
  },
  tableColUnitPriceData: {
    width: '15%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#DEE2E6',
    padding: 8,
    minHeight: 40
  },
  tableColDiscountData: {
    width: '10%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#DEE2E6',
    padding: 8,
    minHeight: 40
  },
  tableColTotalData: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#DEE2E6',
    padding: 8,
    minHeight: 40
  },
  tableCellHeader: {
    fontSize: 12, // 12pt bold for headers
    fontWeight: 'bold',
    color: '#000000', // Black as specified
    textAlign: 'center'
  },
  tableCell: {
    fontSize: 10,
    color: '#000000',
    textAlign: 'center',
    lineHeight: 1.3
  },
  tableCellRight: {
    fontSize: 10,
    color: '#000000',
    textAlign: 'right',
    fontWeight: 'normal'
  },
  medicineName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000000', // Black for brand name as specified
    marginBottom: 2,
    textAlign: 'left'
  },
  genericName: {
    fontSize: 10, // 10pt as specified
    fontStyle: 'italic',
    color: '#6C757D', // Light gray for generic as specified
    fontWeight: 'normal',
    textAlign: 'left'
  },
  quantityMain: {
    fontSize: 10, // 10pt as specified
    fontWeight: 'bold',
    color: '#28A745', // Green as specified
    marginBottom: 2,
    textAlign: 'center'
  },
  quantityType: {
    fontSize: 8, // 8pt as specified
    color: '#28A745', // Green as specified
    fontWeight: 'normal',
    textAlign: 'center'
  },
  summary: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderWidth: 1,
    borderColor: '#DEE2E6',
    borderStyle: 'solid'
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
    marginBottom: 6,
    paddingHorizontal: 8
  },
  summaryLabel: {
    fontSize: 10,
    color: '#000000',
    fontWeight: 'normal'
  },
  summaryValue: {
    fontSize: 10,
    color: '#000000',
    fontWeight: 'normal'
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
    marginTop: 10,
    paddingTop: 10,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#DEE2E6',
    borderTopStyle: 'solid'
  },
  totalLabel: {
    fontSize: 14, // 14pt bold for total
    color: '#28A745', // Green as specified
    fontWeight: 'bold'
  },
  totalValue: {
    fontSize: 14, // 14pt bold for total
    color: '#28A745', // Green as specified
    fontWeight: 'bold'
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    textAlign: 'center',
    fontSize: 8,
    color: '#6C757D',
    borderTopWidth: 1,
    borderTopColor: '#DEE2E6',
    borderTopStyle: 'solid',
    paddingTop: 10,
    lineHeight: 1.3,
    fontStyle: 'italic'
  },
  pageNumber: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 8, // 8pt as specified
    color: '#6C757D' // Light gray as specified
  },
  thankYou: {
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 15,
    fontSize: 12,
    color: '#28A745',
    fontWeight: 'bold'
  }
})

const InvoicePDF = ({ billData }) => {
  const { pharmacyDetails } = usePharmacyStore()
  
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`

  // Calculate totals
  const subtotal = billData.items.reduce((sum, item) => sum + item.totalPrice, 0)
  const discountAmount = (subtotal * (billData.discount || 0)) / 100
  const total = subtotal - discountAmount

  // Default pharmacy details if not set
  const defaultPharmacy = {
    name: 'Faisal Pharmacy',
    address: 'Pakistan post office amin pur banglow Faisalabad,\nPost office code 38200',
    contactNumber: '03092112139',
    email: 'pakistancountry1000@gmail.com',
    ownerName: 'Faisal bin Nawaz',
    licenseNumber: '88888888',
    openingHours: '06:00',
    closingHours: '20:00',
    description: 'How are you'
  }

  // Use custom details if available, otherwise use defaults
  const displayName = pharmacyDetails.name || defaultPharmacy.name
  const displayAddress = pharmacyDetails.address || defaultPharmacy.address
  const displayContact = pharmacyDetails.contactNumber || defaultPharmacy.contactNumber
  const displayEmail = pharmacyDetails.email || defaultPharmacy.email
  const displayOwner = pharmacyDetails.ownerName || defaultPharmacy.ownerName
  const displayLicense = pharmacyDetails.licenseNumber || defaultPharmacy.licenseNumber
  const displayDescription = pharmacyDetails.description || defaultPharmacy.description

  // Format operating hours with bold styling
  const operatingHours = (pharmacyDetails.openingHours && pharmacyDetails.closingHours) 
    ? `Hours: ${pharmacyDetails.openingHours} - ${pharmacyDetails.closingHours}`
    : `Hours: ${defaultPharmacy.openingHours} - ${defaultPharmacy.closingHours}`

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* Watermark - "Sample" as specified */}
        <Text style={styles.watermark}>Sample</Text>

        {/* Header - Following Design 1 specifications */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            {pharmacyDetails.logo && (
              <Image style={styles.logo} src={pharmacyDetails.logo} />
            )}
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>{displayName}</Text>
              <Text style={styles.companyDetails}>
                {displayAddress}{
                  displayLicense && `\nLicense: ${displayLicense}`
                }
              </Text>
              <Text style={styles.companyDetails}>
                Phone: {displayContact}
              </Text>
              <Text style={styles.companyDetails}>
                Email: {displayEmail}
              </Text>
              <Text style={styles.companyDetails}>
                {operatingHours}
              </Text>
              {displayOwner && (
                <Text style={styles.companyDetails}>
                  Owner: {displayOwner}
                </Text>
              )}
              {displayDescription && (
                <Text style={styles.companyDetails}>
                  {displayDescription}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.invoiceInfo}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceDetails}>
              Invoice #: {invoiceNumber}{
                currentDate && `\nDate: ${currentDate}`
              }{
                new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US') && `\nDue Date: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US')}`
              }
            </Text>
          </View>
        </View>

        {/* Customer Information */}
        <View style={styles.customerSection}>
          <View style={styles.customerInfo}>
            <Text style={styles.sectionTitle}>Bill To:</Text>
            <Text style={styles.customerDetails}>
              {billData.customerName || 'Walk-in Customer'}{
                billData.customerPhone && `\nPhone: ${billData.customerPhone}`
              }
            </Text>
          </View>
          <View style={styles.customerInfo}>
            <Text style={styles.sectionTitle}>Payment Terms:</Text>
            <Text style={styles.customerDetails}>
              Payment Method: Cash\nCurrency: PKR
            </Text>
          </View>
        </View>

        {/* Items Table - Following Design 1 column specifications */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableRow}>
            <View style={styles.tableColHash}>
              <Text style={styles.tableCellHeader}>#</Text>
            </View>
            <View style={styles.tableColMedicineHeader}>
              <Text style={styles.tableCellHeader}>Medicine Name</Text>
            </View>
            <View style={styles.tableColQuantityHeader}>
              <Text style={styles.tableCellHeader}>Quantity</Text>
            </View>
            <View style={styles.tableColUnitPriceHeader}>
              <Text style={styles.tableCellHeader}>Unit Price</Text>
            </View>
            <View style={styles.tableColDiscountHeader}>
              <Text style={styles.tableCellHeader}>Discount</Text>
            </View>
            <View style={styles.tableColTotalHeader}>
              <Text style={styles.tableCellHeader}>Total</Text>
            </View>
          </View>

          {/* Table Rows */}
          {billData.items.map((item, index) => (
            <View style={styles.tableRow} key={index}>
              <View style={styles.tableColHashData}>
                <Text style={styles.tableCell}>{index + 1}</Text>
              </View>
              <View style={styles.tableColMedicineData}>
                <Text style={styles.medicineName}>
                  {item.name}
                </Text>
                <Text style={styles.genericName}>
                  {item.genericName ? `Generic: ${item.genericName}` : ''}
                </Text>
              </View>
              <View style={styles.tableColQuantityData}>
                <Text style={styles.quantityMain}>
                  {item.quantity}
                </Text>
                <Text style={styles.quantityType}>
                  {item.quantityType === 'boxes' ? 'Boxes Quantity' : 'Pieces Quantity'}
                </Text>
              </View>
              <View style={styles.tableColUnitPriceData}>
                <Text style={styles.tableCellRight}>PKR {item.price.toFixed(2)}</Text>
              </View>
              <View style={styles.tableColDiscountData}>
                <Text style={styles.tableCell}>{item.discount || 0}%</Text>
              </View>
              <View style={styles.tableColTotalData}>
                <Text style={styles.tableCellRight}>PKR {item.totalPrice.toFixed(2)}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Summary - Following Design 1 specifications */}
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>PKR {subtotal.toFixed(2)}</Text>
          </View>
          {billData.discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Medicine Discounts:</Text>
              <Text style={styles.summaryValue}>-PKR {discountAmount.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalValue}>PKR {total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Thank You Message */}
        <Text style={styles.thankYou}>
          Thank you for your business!
        </Text>

        <Text style={styles.footer}>
          This is a computer-generated invoice. No signature required.\nFor any queries, please contact us at {displayEmail} or {displayContact}
        </Text>
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `Page ${pageNumber} of ${totalPages}`
        )} fixed />
      </Page>
    </Document>
  )
}

export default InvoicePDF


