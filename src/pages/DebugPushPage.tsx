import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

const DebugPushPage = () => {
  const { toast } = useToast();
  const [debugResults, setDebugResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runComprehensiveDebug = async () => {
    setLoading(true);
    try {
      console.log('🔧 Starting comprehensive debug...');
      
      const { data, error } = await supabase.functions.invoke('comprehensive-push-debug', {
        body: {
          action: 'full_debug',
          platform_info: {
            platform: Capacitor.getPlatform(),
            isNative: Capacitor.isNativePlatform(),
            userAgent: navigator.userAgent,
            isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent)
          }
        }
      });
      
      console.log('🔧 Debug data:', data);
      console.log('🔧 Debug error:', error);
      
      setDebugResults({ data, error });
      
      if (error) {
        toast({
          title: "❌ Debug Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "✅ Debug Complete",
          description: "Δείτε τα αποτελέσματα παρακάτω"
        });
      }
    } catch (error) {
      console.error('🔧 Exception:', error);
      toast({
        title: "❌ Exception",
        description: error.message,
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const testTokenSave = async () => {
    try {
      // First check permissions
      const permStatus = await PushNotifications.checkPermissions();
      console.log('🔧 Permissions:', permStatus);
      
      if (permStatus.receive !== 'granted') {
        const requested = await PushNotifications.requestPermissions();
        console.log('🔧 Requested permissions:', requested);
      }
      
      // Try to register
      await PushNotifications.register();
      
      toast({
        title: "🔧 Token Registration",
        description: "Δοκιμάζουμε να καταχωρήσουμε token...",
      });
    } catch (error) {
      console.error('🔧 Token test error:', error);
      toast({
        title: "❌ Token Test Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">🔧 Push Notifications Debug</h1>
      
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Platform Info</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p><strong>Platform:</strong> {Capacitor.getPlatform()}</p>
            <p><strong>Native:</strong> {Capacitor.isNativePlatform().toString()}</p>
            <p><strong>iOS:</strong> {/iPad|iPhone|iPod/.test(navigator.userAgent).toString()}</p>
            <p><strong>User Agent:</strong> {navigator.userAgent}</p>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button 
            onClick={runComprehensiveDebug} 
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Running...' : 'Run Comprehensive Debug'}
          </Button>
          
          <Button 
            onClick={testTokenSave} 
            variant="outline"
            className="flex-1"
          >
            Test Token Registration
          </Button>
        </div>

        {debugResults && (
          <Card>
            <CardHeader>
              <CardTitle>Debug Results</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-96">
                {JSON.stringify(debugResults, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DebugPushPage;