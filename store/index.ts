import { observable } from "mobx";

export const createStore = () => {
  const store = {
    year: observable.box(0),
    setYear(year: number) {
      store.year.set(year);
    },
    currentPage: observable.box(""),
    setCurrentPage(currentPage: string) {
      store.currentPage.set(currentPage);
    },
    searchKeyword: observable.box(""),
    setSearchKeyword(searchKeyword: string) {
      store.searchKeyword.set(searchKeyword);
    },
    currentCategory: observable.box("전체"),
    setCurrentCategory(currentCategory: string) {
      store.currentCategory.set(currentCategory);
    }
  };

  return store;
};

export type TStore = ReturnType<typeof createStore>;
