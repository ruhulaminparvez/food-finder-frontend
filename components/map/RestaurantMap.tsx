'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Restaurant, Location } from '@/types';

interface RestaurantMapProps {
  restaurants: Restaurant[];
  center?: Location;
  onMarkerClick?: (restaurant: Restaurant) => void;
  height?: string;
}

// Fix for default marker icon in Leaflet with Next.js
// @ts-expect-error - Leaflet internal property that needs to be deleted for Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function RestaurantMap({
  restaurants,
  center,
  onMarkerClick,
  height = '400px',
}: RestaurantMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clean up previous map instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Clear previous markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const defaultCenter = center || { lat: 39.9042, lng: 116.4074 }; // Beijing default
    const zoomLevel = restaurants.length === 1 ? 15 : 13;

    // Initialize Leaflet map
    const map = L.map(mapRef.current, {
      center: [defaultCenter.lat, defaultCenter.lng],
      zoom: zoomLevel,
      zoomControl: true,
    });

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    // Add markers for each restaurant
    restaurants.forEach((restaurant) => {
      // Validate location data
      if (!restaurant.location || typeof restaurant.location.lat !== 'number' || typeof restaurant.location.lng !== 'number') {
        console.warn(`Restaurant ${restaurant.name} has invalid location data:`, restaurant.location);
        return;
      }

      // Create custom icon
      const customIcon = L.icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      // Create marker
      const marker = L.marker([restaurant.location.lat, restaurant.location.lng], {
        icon: customIcon,
      }).addTo(map);

      // Create popup content
      const popupContent = `
        <div style="padding: 8px; min-width: 150px;">
          <h3 style="font-weight: 600; margin: 0 0 4px 0; font-size: 14px;">${restaurant.name}</h3>
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">${restaurant.cuisineType}</p>
          <p style="margin: 0; font-size: 12px;">${restaurant.rating.average.toFixed(1)} ⭐</p>
        </div>
      `;

      marker.bindPopup(popupContent);

      // Add click handler
      if (onMarkerClick) {
        marker.on('click', () => {
          onMarkerClick(restaurant);
        });
      }

      markersRef.current.push(marker);
    });

    // Fit bounds if multiple restaurants
    if (restaurants.length > 1) {
      const validRestaurants = restaurants.filter(
        (r) => r.location && typeof r.location.lat === 'number' && typeof r.location.lng === 'number'
      );
      if (validRestaurants.length > 0) {
        const bounds = L.latLngBounds(
          validRestaurants.map((r) => [r.location.lat, r.location.lng] as [number, number])
        );
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }

    return () => {
      // Cleanup on unmount
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
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
