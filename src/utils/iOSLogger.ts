// iOS-specific logging utility
export const iOSLogger = {
  log: (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const logMessage = `📱 [${timestamp}] ${message}`;
    
    console.log(logMessage, data || '');
    
    // Try to send to native iOS if available
    if (typeof window !== 'undefined' && window.webkit?.messageHandlers?.iosLogger) {
      try {
        window.webkit.messageHandlers.iosLogger.postMessage({
          message: logMessage,
          data: data ? JSON.stringify(data) : null,
          timestamp
        });
      } catch (e) {
        console.log("📱 Failed to send to native iOS logger:", e);
      }
    }
  },
  
  error: (message: string, error?: any) => {
    const timestamp = new Date().toISOString();
    const logMessage = `🚨 [${timestamp}] ERROR: ${message}`;
    
    console.error(logMessage, error || '');
    
    // Try to send to native iOS if available
    if (typeof window !== 'undefined' && window.webkit?.messageHandlers?.iosLogger) {
      try {
        window.webkit.messageHandlers.iosLogger.postMessage({
          level: 'error',
          message: logMessage,
          error: error ? error.toString() : null,
          timestamp
        });
      } catch (e) {
        console.error("📱 Failed to send error to native iOS logger:", e);
      }
    }
  }
};

// Global error handler for iOS
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    iOSLogger.error('Global JavaScript Error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack
    });
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    iOSLogger.error('Unhandled Promise Rejection', {
      reason: event.reason?.toString(),
      stack: event.reason?.stack
    });
  });
}