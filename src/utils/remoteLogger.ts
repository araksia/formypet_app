import { supabase } from "@/integrations/supabase/client";

export interface RemoteLogData {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  component?: string;
  metadata?: Record<string, any>;
}

class RemoteLogger {
  private enabled = true;
  private buffer: RemoteLogData[] = [];
  private maxBufferSize = 50;
  private flushInterval = 5000; // 5 seconds

  constructor() {
    this.setupPeriodicFlush();
    this.setupBeforeUnload();
  }

  private setupPeriodicFlush() {
    setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  private setupBeforeUnload() {
    window.addEventListener('beforeunload', () => {
      this.flush();
    });
  }

  async log(data: RemoteLogData) {
    if (!this.enabled) return;

    // Add to buffer
    this.buffer.push({
      ...data,
      metadata: {
        ...data.metadata,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      }
    });

    // Flush if buffer is full
    if (this.buffer.length >= this.maxBufferSize) {
      await this.flush();
    }

    // Also log to console for immediate visibility
    const consoleMessage = `🚀 ForMyPet Remote: [${data.level.toUpperCase()}] ${data.component ? `${data.component}: ` : ''}${data.message}`;
    console.log(consoleMessage, data.metadata);
  }

  async flush() {
    if (this.buffer.length === 0) return;

    const logsToSend = [...this.buffer];
    this.buffer = [];

    try {
      for (const logData of logsToSend) {
        await supabase.functions.invoke('collect-debug-logs', {
          body: logData
        });
      }
    } catch (error) {
      console.error('💥 ForMyPet: Failed to send remote logs:', error);
      // Put failed logs back in buffer (up to max size)
      this.buffer.unshift(...logsToSend.slice(0, this.maxBufferSize - this.buffer.length));
    }
  }

  info(message: string, component?: string, metadata?: Record<string, any>) {
    return this.log({ level: 'info', message, component, metadata });
  }

  warn(message: string, component?: string, metadata?: Record<string, any>) {
    return this.log({ level: 'warn', message, component, metadata });
  }

  error(message: string, component?: string, metadata?: Record<string, any>) {
    return this.log({ level: 'error', message, component, metadata });
  }

  debug(message: string, component?: string, metadata?: Record<string, any>) {
    return this.log({ level: 'debug', message, component, metadata });
  }

  disable() {
    this.enabled = false;
  }

  enable() {
    this.enabled = true;
  }
}

export const remoteLogger = new RemoteLogger();