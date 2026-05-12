import React, { useState } from 'react';
import MapContainer from '../components/Map/MapContainer';
import CountryPanel from '../components/CountryPanel/CountryPanel';
import TimelineSidebar from '../components/Timeline/TimelineSidebar';
import EventSidePanel from '../components/Timeline/EventSidePanel';
import './MapPage.css';

export default function MapPage() {
  const [selectedEventId, setSelectedEventId] = useState(null);

  return (
    <div className="map-page">
      <TimelineSidebar onEventClick={e => setSelectedEventId(e.id)} />

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
    </div>
  );
}
