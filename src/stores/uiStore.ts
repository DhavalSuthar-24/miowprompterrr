import { create } from "zustand";

type ModalType =
  | "login"
  | "register"
  | "createPrompt"
  | "editPrompt"
  | "confirmDelete"
  | null;

interface Notification {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  duration?: number;
}

interface UIState {
  // Sidebar
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;

  // Modals
  activeModal: ModalType;
  modalData: Record<string, unknown>;

  // Notifications
  notifications: Notification[];

  // Loading
  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;

  // Actions - Sidebar
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapse: () => void;

  // Actions - Modals
  openModal: (modal: ModalType, data?: Record<string, unknown>) => void;
  closeModal: () => void;

  // Actions - Notifications
  addNotification: (notification: Omit<Notification, "id">) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  // Initial state
  globalLoading: false,
  sidebarOpen: true,
  sidebarCollapsed: false,
  activeModal: null,
  modalData: {},
  notifications: [],

  // Loading
  setGlobalLoading: (globalLoading) => set({ globalLoading }),

  // Sidebar actions
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebarCollapse: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  // Modal actions
  openModal: (activeModal, modalData = {}) => set({ activeModal, modalData }),
  closeModal: () => set({ activeModal: null, modalData: {} }),

  // Notification actions
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { ...notification, id: crypto.randomUUID() },
      ],
    })),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clearNotifications: () => set({ notifications: [] }),
}));

// Helper for quick toast-like notifications
export const toast = {
  success: (message: string) =>
    useUIStore.getState().addNotification({ type: "success", message }),
  error: (message: string) =>
    useUIStore.getState().addNotification({ type: "error", message }),
  info: (message: string) =>
    useUIStore.getState().addNotification({ type: "info", message }),
  warning: (message: string) =>
    useUIStore.getState().addNotification({ type: "warning", message }),
};
