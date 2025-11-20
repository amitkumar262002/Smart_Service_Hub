import { useCallback, useState, useEffect } from 'react';

// Advanced Features Hook - Comprehensive utilities
export const useAdvancedFeatures = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);

  // Theme Management
  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
    localStorage.setItem('theme', theme === 'light' ? 'dark' : 'light');
  }, [theme]);

  // Notification System
  const addNotification = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration = 3000) => {
    const id = Date.now();
    const notification = { id, message, type, timestamp: new Date() };
    
    setNotifications(prev => [...prev, notification]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
    
    return id;
  }, []);

  const removeNotification = useCallback((id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Online/Offline Detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      addNotification('✅ Back online', 'success', 2000);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      addNotification('❌ You are offline', 'warning', 0);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [addNotification]);

  // Device Detection
  useEffect(() => {
    const detectDevice = () => {
      const ua = navigator.userAgent;
      let device = 'desktop';
      
      if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua.toLowerCase())) {
        device = 'mobile';
      } else if (/tablet|ipad|playbook|silk/i.test(ua.toLowerCase())) {
        device = 'tablet';
      }

      setDeviceInfo({
        type: device,
        userAgent: ua,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack
      });
    };

    detectDevice();
  }, []);

  // Local Storage Management
  const setLocalStorage = useCallback((key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Storage error:', error);
    }
  }, []);

  const getLocalStorage = useCallback((key: string, defaultValue: any = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Storage error:', error);
      return defaultValue;
    }
  }, []);

  const removeLocalStorage = useCallback((key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Storage error:', error);
    }
  }, []);

  // Debounce Hook
  const debounce = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }, []);

  // Throttle Hook
  const throttle = useCallback((func: Function, limit: number) => {
    let inThrottle: boolean;
    return (...args: any[]) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }, []);

  // Copy to Clipboard
  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      addNotification('✅ Copied to clipboard', 'success', 2000);
      return true;
    } catch (error) {
      addNotification('❌ Failed to copy', 'error', 2000);
      return false;
    }
  }, [addNotification]);

  // Format Date
  const formatDate = useCallback((date: Date | string, format: string = 'short'): string => {
    const d = new Date(date);
    
    if (format === 'short') {
      return d.toLocaleDateString();
    } else if (format === 'long') {
      return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } else if (format === 'time') {
      return d.toLocaleTimeString();
    } else if (format === 'full') {
      return d.toLocaleString();
    }
    
    return d.toString();
  }, []);

  // Format Currency
  const formatCurrency = useCallback((amount: number, currency: string = 'INR'): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }, []);

  // Validate Email
  const validateEmail = useCallback((email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }, []);

  // Validate Phone
  const validatePhone = useCallback((phone: string): boolean => {
    const regex = /^[0-9]{10}$/;
    return regex.test(phone.replace(/\D/g, ''));
  }, []);

  // Generate UUID
  const generateUUID = useCallback((): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }, []);

  return {
    // Theme
    theme,
    toggleTheme,
    
    // Notifications
    notifications,
    addNotification,
    removeNotification,
    
    // Network
    isOnline,
    
    // Device
    deviceInfo,
    
    // Storage
    setLocalStorage,
    getLocalStorage,
    removeLocalStorage,
    
    // Utilities
    debounce,
    throttle,
    copyToClipboard,
    formatDate,
    formatCurrency,
    validateEmail,
    validatePhone,
    generateUUID
  };
};
