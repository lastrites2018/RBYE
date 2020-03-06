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
    }
  };

  return store;
};

export type TStore = ReturnType<typeof createStore>;
