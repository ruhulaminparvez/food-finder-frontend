'use client';

import { useEffect, useRef } from 'react';
import { Restaurant, Location } from '@/types';

interface RestaurantMapProps {
  restaurants: Restaurant[];
  center?: Location;
  onMarkerClick?: (restaurant: Restaurant) => void;
  height?: string;
}

// Minimal MapCN type definitions
interface MapCNMap {
  remove: () => void;
}

interface MapCNMarker {
  setLngLat: (coordinates: [number, number]) => MapCNMarker;
  addTo: (map: MapCNMap) => MapCNMarker;
  setPopup: (popup: MapCNPopup) => MapCNMarker;
  getElement: () => HTMLElement;
}

interface MapCNPopup {
  setHTML: (html: string) => MapCNPopup;
}

interface MapCN {
  Map: new (options: {
    container: HTMLElement;
    center: [number, number];
    zoom: number;
    style: string;
  }) => MapCNMap;
  Marker: new (options: { color: string }) => MapCNMarker;
  Popup: new (options: { offset: number }) => MapCNPopup;
}

export default function RestaurantMap({
  restaurants,
  center,
  onMarkerClick,
  height = '400px',
}: RestaurantMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<MapCNMap | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize MapCN
    const initMap = async () => {
      try {
        // MapCN script loading
        if (!window.mapcn) {
          const script = document.createElement('script');
          script.src = 'https://api.mapcn.com/map/v1.0/map.js';
          script.async = true;
          document.head.appendChild(script);

          script.onload = () => {
            createMap();
          };
        } else {
          createMap();
        }
      } catch (error) {
        console.error('Error loading MapCN:', error);
      }
    };

    const createMap = () => {
      if (!mapRef.current || !window.mapcn) return;

      const mapcn = window.mapcn; // Type guard
      const defaultCenter = center || { lat: 39.9042, lng: 116.4074 }; // Beijing default

      // Initialize MapCN map
      const map = new mapcn.Map({
        container: mapRef.current,
        center: [defaultCenter.lng, defaultCenter.lat],
        zoom: 13,
        style: 'mapcn://styles/default',
      });

      mapInstanceRef.current = map;

      // Add markers for each restaurant
      restaurants.forEach((restaurant) => {
        // Validate location data
        if (!restaurant.location || typeof restaurant.location.lat !== 'number' || typeof restaurant.location.lng !== 'number') {
          console.warn(`Restaurant ${restaurant.name} has invalid location data:`, restaurant.location);
          return;
        }

        const marker = new mapcn.Marker({
          color: '#3B82F6',
        })
          .setLngLat([restaurant.location.lng, restaurant.location.lat])
          .addTo(map);

        // Create popup
        const popup = new mapcn.Popup({ offset: 25 }).setHTML(
          `<div class="p-2">
            <h3 class="font-semibold">${restaurant.name}</h3>
            <p class="text-sm text-gray-600">${restaurant.cuisineType}</p>
            <p class="text-sm">${restaurant.rating.average.toFixed(1)} ⭐</p>
          </div>`
        );

        marker.setPopup(popup);

        if (onMarkerClick) {
          marker.getElement().addEventListener('click', () => {
            onMarkerClick(restaurant);
          });
        }
      });
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, [restaurants, center, onMarkerClick]);

  return (
    <div
      ref={mapRef}
      style={{ height, width: '100%' }}
      className="rounded-lg overflow-hidden border border-gray-300"
    />
  );
}

// Extend Window interface for MapCN
declare global {
  interface Window {
    mapcn?: MapCN;
  }
}
