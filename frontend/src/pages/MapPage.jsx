import React from 'react';
import MapContainer from '../components/Map/MapContainer';
import CountryPanel from '../components/CountryPanel/CountryPanel';
import './MapPage.css';

export default function MapPage() {
  return (
    <div className="map-page">
      <MapContainer />
      <CountryPanel />
    </div>
  );
}
