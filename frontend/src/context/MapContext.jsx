import React, { createContext, useContext, useState, useRef } from 'react';

const MapContext = createContext(null);

export function MapProvider({ children }) {
  const [selectedCountryId,  setSelectedCountryIdState]  = useState(null);
  const [isPanelOpen,        setIsPanelOpenState]        = useState(false);
  const [selectedEventId,    setSelectedEventId]         = useState(null);
  const [selectedSoldierId,  setSelectedSoldierId]       = useState(null);
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
      selectedEventId,
      setSelectedEventId,
      selectedSoldierId,
      setSelectedSoldierId,
      mapRef,
    }}>
      {children}
    </MapContext.Provider>
  );
}

export function useMap() {
  return useContext(MapContext);
}
