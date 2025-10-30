import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

interface LocationContextType {
  location: Location | null;
  isLoading: boolean;
  error: string | null;
  requestLocation: () => Promise<void>;
  updateLocation: (location: Location) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [location, setLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Charger la localisation sauvegardée au démarrage
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      try {
        setLocation(JSON.parse(savedLocation));
      } catch (err) {
        console.error('Erreur lors du chargement de la localisation:', err);
      }
    }
  }, []);

  const getAddressFromCoords = async (lat: number, lng: number): Promise<string> => {
    // TODO: Connecter à votre service de géocodage inverse
    // Exemple avec une API comme Google Maps ou OpenStreetMap
    try {
      // const response = await fetch(
      //   `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      // );
      // const data = await response.json();
      // return data.display_name;

      // VERSION DÉMO
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (err) {
      console.error('Erreur lors de la récupération de l\'adresse:', err);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  const requestLocation = async () => {
    if (!navigator.geolocation) {
      const errorMsg = 'La géolocalisation n\'est pas supportée par votre navigateur';
      setError(errorMsg);
      toast({
        title: 'Erreur',
        description: errorMsg,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const address = await getAddressFromCoords(latitude, longitude);
        
        const newLocation: Location = {
          latitude,
          longitude,
          address,
        };

        setLocation(newLocation);
        localStorage.setItem('userLocation', JSON.stringify(newLocation));
        setIsLoading(false);

        toast({
          title: 'Localisation activée',
          description: 'Votre position a été mise à jour',
        });
      },
      (err) => {
        let errorMsg = 'Impossible de récupérer votre position';
        
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMsg = 'Vous avez refusé l\'accès à votre position';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMsg = 'Informations de position indisponibles';
            break;
          case err.TIMEOUT:
            errorMsg = 'La demande de position a expiré';
            break;
        }

        setError(errorMsg);
        setIsLoading(false);

        toast({
          title: 'Erreur de localisation',
          description: errorMsg,
          variant: 'destructive',
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const updateLocation = (newLocation: Location) => {
    setLocation(newLocation);
    localStorage.setItem('userLocation', JSON.stringify(newLocation));
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        isLoading,
        error,
        requestLocation,
        updateLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation doit être utilisé dans un LocationProvider');
  }
  return context;
};
