import { create } from 'zustand'

const useNavigationStore = create((set) => ({
  currentPage: 'dashboard',
  setCurrentPage: (page) => set({ currentPage: page }),
}))

export default useNavigationStore

