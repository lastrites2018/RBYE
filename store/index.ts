import create from "zustand";

interface StoreState {
  year: number;
  currentPage: string;
  searchKeyword: string;
  currentCategory: string;
  setYear: (year: number) => void;
  setCurrentPage: (currentPage: string) => void;
  setSearchKeyword: (searchKeyword: string) => void;
  setCurrentCategory: (currentCategory: string) => void;
}

export const useStore = create<StoreState>((set) => ({
  year: 0,
  currentPage: "",
  searchKeyword: "",
  currentCategory: "전체",
  setYear: (year) => set({ year }),
  setCurrentPage: (currentPage) => set({ currentPage }),
  setSearchKeyword: (searchKeyword) => set({ searchKeyword }),
  setCurrentCategory: (currentCategory) => set({ currentCategory }),
}));
