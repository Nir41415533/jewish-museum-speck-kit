import React from 'react';
import { useMap } from '../context/MapContext';
import MapContainer from '../components/Map/MapContainer';
import CountryPanel from '../components/CountryPanel/CountryPanel';
import TimelineSidebar from '../components/Timeline/TimelineSidebar';
import EventSidePanel from '../components/Timeline/EventSidePanel';
import SoldierSidePanel from '../components/Timeline/SoldierSidePanel';
import './MapPage.css';

export default function MapPage() {
  const { selectedEventId, setSelectedEventId, selectedSoldierId, setSelectedSoldierId } = useMap();

  return (
    <div className="map-page">
      <TimelineSidebar onEventClick={e => { setSelectedSoldierId(null); setSelectedEventId(e.id); }} />

      <div className="map-area">
        <MapContainer />
        <CountryPanel />
      </div>

      {selectedEventId && (
        <EventSidePanel
          eventId={selectedEventId}
          onClose={() => setSelectedEventId(null)}
        />
      )}

      {selectedSoldierId && (
        <SoldierSidePanel
          soldierId={selectedSoldierId}
          onClose={() => setSelectedSoldierId(null)}
        />
      )}
    </div>
  );
}
