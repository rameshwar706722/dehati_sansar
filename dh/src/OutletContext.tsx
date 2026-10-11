import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchLocationsFromDB } from './services/api';

export interface HubOutlet {
  id: string; // 'all' or store_id string
  name: string;
  cityName: string;
  phone?: string;
  lat: number;
  lng: number;
}

const ALL_OUTLET_DEFAULT: HubOutlet = {
  id: 'all',
  name: 'All Outlets',
  cityName: 'All',
  lat: 25.0,
  lng: 77.5,
};

interface UserCoordinates {
  latitude: number;
  longitude: number;
}

interface OutletContextType {
  outlets: HubOutlet[];
  selectedOutlet: HubOutlet;
  setSelectedOutlet: (outlet: HubOutlet) => void;
  detectAutoLocation: () => void;
  isLocating: boolean;
  locationError: string | null;
  loadingLocations: boolean;
  userCoords: UserCoordinates | null;
  getDistanceKmFromHub: (lat?: number, lng?: number) => number | null;
}

const OutletContext = createContext<OutletContextType | undefined>(undefined);

// Haversine formula for exact KM distance
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in KM
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

export const OutletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [outlets, setOutlets] = useState<HubOutlet[]>([ALL_OUTLET_DEFAULT]);
  const [selectedOutlet, setSelectedOutletState] = useState<HubOutlet>(ALL_OUTLET_DEFAULT);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<UserCoordinates | null>(null);

  const setSelectedOutlet = (outlet: HubOutlet) => {
    setSelectedOutletState(outlet);
    localStorage.setItem('dehati_selected_outlet_id', outlet.id);
  };

  // Helper to compute KM from user to any hub coordinates
  const getDistanceKmFromHub = (targetLat?: number, targetLng?: number): number | null => {
    if (!userCoords || targetLat == null || targetLng == null) return null;
    return calculateDistanceKm(userCoords.latitude, userCoords.longitude, targetLat, targetLng);
  };

  // Fetch Outlets from MySQL
  useEffect(() => {
    const loadDBLocations = async () => {
      try {
        const data = await fetchLocationsFromDB();
        const formatted: HubOutlet[] = [
          ALL_OUTLET_DEFAULT,
          ...data.map((row) => ({
            id: String(row.store_id),
            name: row.store_name,
            cityName: row.city_name,
            phone: row.phone,
            lat: Number(row.lat),
            lng: Number(row.lng),
          })),
        ];

        setOutlets(formatted);

        const savedId = localStorage.getItem('dehati_selected_outlet_id');
        const match = formatted.find((o) => o.id === savedId);
        if (match) {
          setSelectedOutletState(match);
        } else if (formatted.length > 1) {
          setSelectedOutletState(formatted[1]);
        }
      } catch (err: any) {
        console.error('Failed to load locations from database', err);
      } finally {
        setLoadingLocations(false);
      }
    };

    loadDBLocations();
  }, []);

  // GPS Auto-detect
  const detectAutoLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    const physicalHubs = outlets.filter((o) => o.id !== 'all');
    if (physicalHubs.length === 0) return;

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserCoords({ latitude, longitude });

        let nearest = physicalHubs[0];
        let minDistance = calculateDistanceKm(latitude, longitude, nearest.lat, nearest.lng);

        for (let i = 1; i < physicalHubs.length; i++) {
          const d = calculateDistanceKm(latitude, longitude, physicalHubs[i].lat, physicalHubs[i].lng);
          if (d < minDistance) {
            minDistance = d;
            nearest = physicalHubs[i];
          }
        }

        setSelectedOutlet(nearest);
        setIsLocating(false);
      },
      (err) => {
        setLocationError(err.message || 'Unable to retrieve location');
        setIsLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <OutletContext.Provider
      value={{
        outlets,
        selectedOutlet,
        setSelectedOutlet,
        detectAutoLocation,
        isLocating,
        locationError,
        loadingLocations,
        userCoords,
        getDistanceKmFromHub,
      }}
    >
      {children}
    </OutletContext.Provider>
  );
};

export const useOutlet = () => {
  const context = useContext(OutletContext);
  if (!context) throw new Error('useOutlet must be used within an OutletProvider');
  return context;
};