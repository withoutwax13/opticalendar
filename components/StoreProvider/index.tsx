"use client";
import React, { useState } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import store, { persistor } from "@/store/store";

const storeProvider = (PropComponent) => {
  const ProviderComponent = () => {
    const [rehydrated, setRehydrated] = useState(false);
    return (
      <Provider store={store}>
        <PersistGate
          loading={null}
          persistor={persistor}
          onBeforeLift={() => setRehydrated(true)}
        >
          {rehydrated ? <PropComponent rehydrated={rehydrated} /> : null}
        </PersistGate>
      </Provider>
    );
  };
  return ProviderComponent;
};

export default storeProvider;
