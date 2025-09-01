// iOS WebKit types for Capacitor
declare global {
  interface Window {
    webkit?: {
      messageHandlers?: {
        [key: string]: {
          postMessage: (message: any) => void;
        };
      };
    };
    hideLoading?: () => void;
  }
}

export {};