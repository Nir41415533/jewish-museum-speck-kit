import React from 'react';
import MapContainer from '../components/Map/MapContainer';
import CountryPanel from '../components/CountryPanel/CountryPanel';
import TimelineSidebar from '../components/Timeline/TimelineSidebar';
import './MapPage.css';

export default function MapPage() {
  return (
    <div className="map-page">
      <TimelineSidebar />
      <div className="map-area">
        <MapContainer />
        <CountryPanel />
      </div>
    </div>
  );
}
