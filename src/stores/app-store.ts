import { create } from "zustand";
import { User, Prompt, AIModel } from "@/types";
import { mockUser, mockPrompts } from "@/lib/mock-data";

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  prompts: Prompt[];
  selectedModels: AIModel[];
  sidebarOpen: boolean;
  theme: "dark" | "light";

  setUser: (user: User | null) => void;
  login: () => void;
  logout: () => void;
  toggleModel: (model: AIModel) => void;
  setSelectedModels: (models: AIModel[]) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleTheme: () => void;
}

const savedTheme = (typeof window !== "undefined" && localStorage.getItem("promptlab-theme")) as "dark" | "light" | null;

export const useAppStore = create<AppState>((set) => ({
  user: mockUser,
  isAuthenticated: true,
  prompts: mockPrompts,
  selectedModels: ["gemini", "gpt-4"],
  sidebarOpen: true,
  theme: savedTheme || "dark",

  setUser: (user) => set({ user }),
  login: () => set({ isAuthenticated: true, user: mockUser }),
  logout: () => set({ isAuthenticated: false, user: null }),
  toggleModel: (model) =>
    set((state) => ({
      selectedModels: state.selectedModels.includes(model)
        ? state.selectedModels.filter((m) => m !== model)
        : [...state.selectedModels, model],
    })),
  setSelectedModels: (models) => set({ selectedModels: models }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleTheme: () =>
    set((state) => {
      const next = state.theme === "dark" ? "light" : "dark";
      localStorage.setItem("promptlab-theme", next);
      return { theme: next };
    }),
}));
