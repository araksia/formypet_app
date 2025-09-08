import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function NotificationTestPage() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testNotifications = async () => {
    setTesting(true);
    try {
      console.log('🧪 Testing notification system...');
      
      // Test the notification scheduler
      const { data, error } = await supabase.functions.invoke('setup-notification-scheduler', {
        body: {}
      });
      
      if (error) {
        throw error;
      }
      
      setResult(data);
      toast.success('Notification system tested successfully!');
      console.log('✅ Test result:', data);
      
    } catch (error) {
      console.error('❌ Test failed:', error);
      toast.error('Notification test failed: ' + (error as Error).message);
    } finally {
      setTesting(false);
    }
  };

  const triggerScheduledCheck = async () => {
    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-scheduled-events', {
        body: {}
      });
      
      if (error) throw error;
      
      toast.success('Scheduled events check triggered!');
      setResult(data);
      
    } catch (error) {
      console.error('❌ Trigger failed:', error);
      toast.error('Failed to trigger check: ' + (error as Error).message);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🔔 Notification System Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Button 
              onClick={testNotifications} 
              disabled={testing}
              className="w-full"
            >
              {testing ? 'Testing...' : '🧪 Test Notification System'}
            </Button>
            
            <Button 
              onClick={triggerScheduledCheck} 
              disabled={testing}
              variant="outline"
              className="w-full"
            >
              {testing ? 'Triggering...' : '⏰ Trigger Scheduled Check'}
            </Button>
          </div>
          
          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-4 rounded overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}