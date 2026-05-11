import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useMap } from '../../context/MapContext';
import { countriesApi } from '../../services/api';
import './MapContainer.css';

// Natural Earth 110m countries — has iso_a3 property matching our countries.code column
const COUNTRIES_GEOJSON_URL =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_0_countries.geojson';

export default function MapContainer() {
  const containerRef = useRef(null);
  const { mapRef, setSelectedCountryId, setIsPanelOpen } = useMap();

  useEffect(() => {
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [20, 25],
      zoom: 2,
      minZoom: 1.5,
      // Prevent the world from repeating horizontally when scrolling
      renderWorldCopies: false,
      // Hard bounds: user can never pan outside the single world extent
      maxBounds: [[-180, -85.051129], [180, 85.051129]],
    });
    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl(), 'bottom-right');

    map.on('load', async () => {
      let interactiveCodes = [];
      const codeToId = {};

      try {
        const res = await countriesApi.list();
        interactiveCodes = res.data.map(c => c.code);
        res.data.forEach(c => { codeToId[c.code] = c.id; });
      } catch (e) {
        console.error('Failed to load interactive countries:', e);
      }

      map.addSource('country-boundaries', {
        type: 'geojson',
        data: COUNTRIES_GEOJSON_URL,
        generateId: true,
      });

      // Subtle base tint on all countries so land mass is readable on the base map
      map.addLayer({
        id: 'country-fill-base',
        type: 'fill',
        source: 'country-boundaries',
        paint: {
          'fill-color': '#c8b89a',
          'fill-opacity': 0.1,
        },
      });

      // Interactive countries: warm amber-gold; others transparent
      map.addLayer({
        id: 'country-fill',
        type: 'fill',
        source: 'country-boundaries',
        paint: {
          'fill-color': interactiveCodes.length > 0
            ? ['match', ['get', 'iso_a3'], interactiveCodes, '#c8871e', 'rgba(0,0,0,0)']
            : 'rgba(0,0,0,0)',
          'fill-opacity': 0.62,
        },
      });

      // Dark border around interactive countries only
      map.addLayer({
        id: 'country-border-interactive',
        type: 'line',
        source: 'country-boundaries',
        paint: {
          'line-color': interactiveCodes.length > 0
            ? ['match', ['get', 'iso_a3'], interactiveCodes, '#8a5a08', 'rgba(0,0,0,0)']
            : 'rgba(0,0,0,0)',
          'line-width': 1.5,
          'line-opacity': 0.85,
        },
      });

      // Hover highlight — bright gold, only when feature-state hover is true
      map.addLayer({
        id: 'country-fill-hover',
        type: 'fill',
        source: 'country-boundaries',
        paint: {
          'fill-color': '#f0d060',
          'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.78, 0],
        },
      });

      map.on('click', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['country-fill'] });
        if (!features.length) return;
        const code = features[0]?.properties?.iso_a3;
        if (!code || !codeToId[code]) return;
        setSelectedCountryId(codeToId[code]);
        setIsPanelOpen(true);
      });

      let hoveredFeatureId = null;

      map.on('mousemove', 'country-fill', (e) => {
        const feature = e.features?.[0];
        const code = feature?.properties?.iso_a3;
        const isInteractive = Boolean(code && codeToId[code]);

        map.getCanvas().style.cursor = isInteractive ? 'pointer' : '';

        if (hoveredFeatureId !== null) {
          map.setFeatureState(
            { source: 'country-boundaries', id: hoveredFeatureId },
            { hover: false }
          );
          hoveredFeatureId = null;
        }

        if (isInteractive && feature.id != null) {
          hoveredFeatureId = feature.id;
          map.setFeatureState(
            { source: 'country-boundaries', id: hoveredFeatureId },
            { hover: true }
          );
        }
      });

      map.on('mouseleave', 'country-fill', () => {
        map.getCanvas().style.cursor = '';
        if (hoveredFeatureId !== null) {
          map.setFeatureState(
            { source: 'country-boundaries', id: hoveredFeatureId },
            { hover: false }
          );
          hoveredFeatureId = null;
        }
      });
    });

    return () => {
      mapRef.current = null;
      map.remove();
    };
  }, []);

  return <div ref={containerRef} className="map-container" />;
}
