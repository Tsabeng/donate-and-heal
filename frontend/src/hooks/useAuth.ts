// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { authService } from '@/services/auth';

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      console.error("Auth failed:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();

    // Écoute les changements dans localStorage (autres onglets ou après register)
    const handleStorageChange = () => {
      const token = localStorage.getItem('authToken');
      const userType = localStorage.getItem('userType');
      if (token && userType) {
        loadUser();
      } else {
        setUser(null);
        setLoading(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Vérifie aussi à chaque focus (retour sur l'onglet)
    window.addEventListener('focus', loadUser);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', loadUser);
    };
  }, []);

  return { user, loading, refetch: loadUser, logout: authService.logout };
};