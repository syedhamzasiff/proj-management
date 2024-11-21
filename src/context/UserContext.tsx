// context/UserContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { verifySession } from '@/lib/auth'; 

interface UserContextType {
  userId: string | null;
  isAuth: boolean;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserContextType>({
    userId: null,
    isAuth: false,
    loading: true,
  });

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const session = await verifySession(); 
        //console.log("session: ", session)
        setUser({ 
          userId: session.userId, 
          isAuth: session.isAuth, 
          loading: false });
      } catch (error) {
        setUser({ userId: null, isAuth: false, loading: false });
      }
    };

    fetchSession();
  }, []);

  if (user.loading) {
    return <div>Loading...</div>; 
  }

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
