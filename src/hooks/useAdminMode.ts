import { useState, useCallback } from 'react';

const ADMIN_PIN = '1234'; // Default PIN - can be changed

export const useAdminMode = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  const verifyPin = useCallback((pin: string): boolean => {
    const isValid = pin === ADMIN_PIN;
    if (isValid) {
      setIsAdmin(true);
    }
    return isValid;
  }, []);

  const exitAdminMode = useCallback(() => {
    setIsAdmin(false);
  }, []);

  return {
    isAdmin,
    verifyPin,
    exitAdminMode,
  };
};
