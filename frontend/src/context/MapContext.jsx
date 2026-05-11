import React, { createContext, useContext, useState, useRef } from 'react';

const MapContext = createContext(null);

export function MapProvider({ children }) {
  const [selectedCountryId, setSelectedCountryIdState] = useState(null);
  const [isPanelOpen, setIsPanelOpenState] = useState(false);
  const mapRef = useRef(null);

  function setSelectedCountryId(id) {
    setSelectedCountryIdState(id);
  }

  function setIsPanelOpen(open) {
    setIsPanelOpenState(open);
    if (!open) setSelectedCountryIdState(null);
  }

  return (
    <MapContext.Provider value={{
      selectedCountryId,
      setSelectedCountryId,
      isPanelOpen,
      setIsPanelOpen,
      mapRef,
    }}>
      {children}
    </MapContext.Provider>
  );
}

export function useMap() {
  return useContext(MapContext);
}
