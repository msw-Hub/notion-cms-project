import { create } from 'zustand'

// 모바일 폭에서 Sheet로 열고 닫는 사이드바 상태. 새로고침 유지가 필요 없어 persist는 쓰지 않는다.
interface SidebarState {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}))
