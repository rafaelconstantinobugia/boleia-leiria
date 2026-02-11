import React, { createContext, useContext, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminContextType {
  isAdmin: boolean;
  adminPin: string | null;
  login: (pin: string) => Promise<boolean>;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPin, setAdminPin] = useState<string | null>(null);

  const login = useCallback(async (pin: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-admin-pin', {
        body: { pin },
      });

      if (error) {
        console.error('Erro ao verificar PIN:', error);
        return false;
      }

      if (data?.valid) {
        setIsAdmin(true);
        setAdminPin(pin);
        return true;
      }

      return false;
    } catch (err) {
      console.error('Erro ao verificar PIN:', err);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setIsAdmin(false);
    setAdminPin(null);
  }, []);

  return (
    <AdminContext.Provider value={{ isAdmin, adminPin, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
