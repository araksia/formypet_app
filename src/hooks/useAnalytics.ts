import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { FirebaseAnalytics } from '@capacitor-community/firebase-analytics';

export const useAnalytics = () => {
  useEffect(() => {
    // Initialize Firebase Analytics only on mobile platforms
    if (Capacitor.isNativePlatform()) {
      initializeAnalytics();
    }
  }, []);

  const initializeAnalytics = async () => {
    try {
      await FirebaseAnalytics.enable();
      console.log('📊 Firebase Analytics enabled');
    } catch (error) {
      console.error('Analytics initialization error:', error);
    }
  };

  const trackEvent = async (eventName: string, parameters?: any) => {
    if (!Capacitor.isNativePlatform()) {
      console.log(`📊 Analytics (web): ${eventName}`, parameters);
      return;
    }

    try {
      await FirebaseAnalytics.logEvent({
        name: eventName,
        params: parameters || {}
      });
      console.log(`📊 Analytics tracked: ${eventName}`, parameters);
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  };

  const trackScreenView = async (screenName: string, screenClass?: string) => {
    if (!Capacitor.isNativePlatform()) {
      console.log(`📊 Analytics (web): screen_view - ${screenName}`);
      return;
    }

    try {
      await FirebaseAnalytics.logEvent({
        name: 'screen_view',
        params: {
          screen_name: screenName,
          screen_class: screenClass || screenName
        }
      });
      console.log(`📊 Screen view tracked: ${screenName}`);
    } catch (error) {
      console.error('Screen view tracking error:', error);
    }
  };

  const setUserId = async (userId: string) => {
    if (!Capacitor.isNativePlatform()) {
      console.log(`📊 Analytics (web): user_id set - ${userId}`);
      return;
    }

    try {
      await FirebaseAnalytics.setUserId({
        userId: userId
      });
      console.log(`📊 User ID set: ${userId}`);
    } catch (error) {
      console.error('Set user ID error:', error);
    }
  };

  const setUserProperty = async (name: string, value: string) => {
    if (!Capacitor.isNativePlatform()) {
      console.log(`📊 Analytics (web): user property - ${name}: ${value}`);
      return;
    }

    try {
      await FirebaseAnalytics.setUserProperty({
        name: name,
        value: value
      });
      console.log(`📊 User property set: ${name} = ${value}`);
    } catch (error) {
      console.error('Set user property error:', error);
    }
  };

  return {
    trackEvent,
    trackScreenView,
    setUserId,
    setUserProperty
  };
};

// Pre-defined event tracking functions for common actions
export const analyticsEvents = {
  // Pet management
  PET_ADDED: 'pet_added',
  PET_EDITED: 'pet_edited',
  PET_DELETED: 'pet_deleted',
  
  // Events
  EVENT_CREATED: 'event_created',
  EVENT_COMPLETED: 'event_completed',
  EVENT_DELETED: 'event_deleted',
  
  // Expenses
  EXPENSE_ADDED: 'expense_added',
  EXPENSE_EDITED: 'expense_edited',
  EXPENSE_DELETED: 'expense_deleted',
  
  // Medical records
  MEDICAL_RECORD_ADDED: 'medical_record_added',
  MEDICAL_RECORD_VIEWED: 'medical_record_viewed',
  
  // Navigation
  SCREEN_VIEW: 'screen_view',
  
  // Push notifications
  NOTIFICATION_RECEIVED: 'notification_received',
  NOTIFICATION_OPENED: 'notification_opened',
  
  // Authentication
  USER_LOGIN: 'login',
  USER_SIGNUP: 'sign_up',
  USER_LOGOUT: 'logout'
};