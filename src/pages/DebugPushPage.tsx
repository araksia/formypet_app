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

  const testFirebaseConfig = async () => {
    setLoading(true);
    try {
      const result = await supabase.functions.invoke('test-firebase-config');
      console.log('Firebase test result:', result);
      
      if (result.error) {
        toast({
          title: "❌ Firebase Test Failed",
          description: result.error.message,
          variant: "destructive"
        });
      } else {
        const { firebase, tokens, notification } = result.data;
        
        let description = `Firebase: ${firebase.success ? '✅' : '❌'}, Tokens: ${tokens.count}`;
        if (notification) {
          description += `, Notification: ${notification.pushError ? '❌' : '✅'}`;
        }
        
        toast({
          title: firebase.success ? "✅ Firebase OK" : "❌ Firebase Problem",
          description: description,
          variant: firebase.success ? "default" : "destructive"
        });
      }
      
      setDebugResults(result);
    } catch (error) {
      console.error('Firebase test error:', error);
      toast({
        title: "❌ Firebase Test Error", 
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const triggerNotifications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('trigger-notifications', {
        body: {}
      });
      
      if (error) {
        console.error('Trigger notifications error:', error);
        toast({
          title: "❌ Notification Trigger Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        console.log('Trigger notifications success:', data);
        toast({
          title: "✅ Notification Check",
          description: "Έλεγχος για ειδοποιήσεις ολοκληρώθηκε!",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "❌ Unexpected Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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
            onClick={testFirebaseConfig} 
            variant="outline"
            className="flex-1"
            disabled={loading}
          >
            🔥 Test Firebase Config
          </Button>
        </div>

        <Button 
          onClick={triggerNotifications}
          disabled={loading}
          className="w-full"
          variant="secondary"
        >
          🔔 Check & Send Notifications Now
        </Button>

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