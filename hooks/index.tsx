import React from "react";
import { storeContext } from "../context";
import { TStore } from "../store";
import { useObserver } from "mobx-react-lite";

export const useStoreData = <Selection, ContextData, Store>(
  context: React.Context<ContextData>,
  storeSelector: (contextData: ContextData) => Store,
  dataSelector: (store: Store) => Selection
) => {
  const value = React.useContext(context);
  if (!value) {
    throw new Error();
  }
  const store = storeSelector(value);
  return useObserver(() => {
    return dataSelector(store);
  });
};

export const useRootData = <Selection, _>(
  dataSelector: (store: TStore) => Selection
) => useStoreData(storeContext, contextData => contextData!, dataSelector);
