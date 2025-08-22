import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const usePharmacyStore = create(
  persist(
    (set, get) => ({
      pharmacyDetails: {
        name: '',
        logo: '',
        address: '',
        contactNumber: '',
        email: '',
        description: '',
        licenseNumber: '',
        ownerName: '',
        openingHours: '',
        closingHours: '',
        socialMedia: {
          facebook: '',
          instagram: '',
          twitter: '',
          website: ''
        }
      },

      // Update pharmacy details
      updatePharmacyDetails: (details) => {
        set((state) => ({
          pharmacyDetails: {
            ...state.pharmacyDetails,
            ...details
          }
        }))
      },

      // Update specific field
      updateField: (field, value) => {
        set((state) => ({
          pharmacyDetails: {
            ...state.pharmacyDetails,
            [field]: value
          }
        }))
      },

      // Update social media links
      updateSocialMedia: (platform, url) => {
        set((state) => ({
          pharmacyDetails: {
            ...state.pharmacyDetails,
            socialMedia: {
              ...state.pharmacyDetails.socialMedia,
              [platform]: url
            }
          }
        }))
      },

      // Reset to default values
      resetPharmacyDetails: () => {
        set({
          pharmacyDetails: {
            name: '',
            logo: '',
            address: '',
            contactNumber: '',
            email: '',
            description: '',
            licenseNumber: '',
            ownerName: '',
            openingHours: '',
            closingHours: '',
            socialMedia: {
              facebook: '',
              instagram: '',
              twitter: '',
              website: ''
            }
          }
        })
      },

      // Get pharmacy details
      getPharmacyDetails: () => get().pharmacyDetails,

      // Check if pharmacy details are complete
      isPharmacyDetailsComplete: () => {
        const details = get().pharmacyDetails
        return !!(
          details.name &&
          details.address &&
          details.contactNumber &&
          details.email &&
          details.ownerName
        )
      }
    }),
    {
      name: 'pharmacy-details-storage',
      version: 1
    }
  )
)

export default usePharmacyStore

