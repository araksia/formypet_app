import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Capacitor } from '@capacitor/core';
import { iOSPushDebug } from '@/utils/iOSPushDebug';
import { supabase } from '@/integrations/supabase/client';

const DebugPushPage = () => {
  const { toast } = useToast();
  const [debugData, setDebugData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const isIOS = Capacitor.getPlatform() === 'ios';
  const isNative = Capacitor.isNativePlatform();

  const handleDebugStatus = async () => {
    setLoading(true);
    try {
      const result = await iOSPushDebug.debugTokenStatus();
      setDebugData(result);
      
      if (result.success) {
        toast({
          title: "✅ Debug Complete",
          description: `Found ${result.tokens?.length || 0} iOS tokens`,
          duration: 5000
        });
      } else {
        toast({
          title: "❌ Debug Failed",
          description: result.error,
          variant: "destructive",
          duration: 5000
        });
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: error.message,
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForceRefresh = async () => {
    setLoading(true);
    try {
      const result = await iOSPushDebug.forceTokenRefresh();
      
      if (result.success) {
        toast({
          title: "✅ Force Refresh Started",
          description: "Περιμένετε για το token...",
          duration: 5000
        });
        // Refresh debug data after a delay
        setTimeout(() => {
          handleDebugStatus();
        }, 3000);
      } else {
        toast({
          title: "❌ Force Refresh Failed",
          description: result.error,
          variant: "destructive",
          duration: 5000
        });
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: error.message,
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckTokens = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "❌ No User",
          description: "Πρέπει να είστε συνδεδεμένοι",
          variant: "destructive",
          duration: 5000
        });
        return;
      }

      const { data: tokens, error } = await supabase
        .from('push_notification_tokens')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        toast({
          title: "❌ Database Error",
          description: error.message,
          variant: "destructive",
          duration: 5000
        });
        return;
      }

      const iosTokens = tokens?.filter(t => t.platform === 'ios') || [];
      const androidTokens = tokens?.filter(t => t.platform === 'android') || [];

      toast({
        title: "📊 Token Count",
        description: `iOS: ${iosTokens.length} tokens, Android: ${androidTokens.length} tokens`,
        duration: 8000
      });

      setDebugData(prev => ({
        ...prev,
        allTokens: tokens,
        iosTokens,
        androidTokens
      }));

    } catch (error) {
      toast({
        title: "❌ Error",
        description: error.message,
        variant: "destructive",
        duration: 5000
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <h1 className="text-3xl font-bold">🍎 iOS Push Debug</h1>
        <Badge variant={isIOS ? 'default' : 'secondary'}>
          {Capacitor.getPlatform()}
        </Badge>
        <Badge variant={isNative ? 'default' : 'outline'}>
          {isNative ? 'Native' : 'Web'}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform Information</CardTitle>
          <CardDescription>
            Current platform and capabilities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>Platform: <Badge>{Capacitor.getPlatform()}</Badge></div>
          <div>Native: <Badge variant={isNative ? 'default' : 'outline'}>{isNative ? 'Yes' : 'No'}</Badge></div>
          <div>iOS: <Badge variant={isIOS ? 'default' : 'outline'}>{isIOS ? 'Yes' : 'No'}</Badge></div>
          <div>User Agent: <code className="text-sm bg-muted p-1 rounded">{navigator.userAgent}</code></div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Debug Actions</CardTitle>
            <CardDescription>
              iOS push notification debugging tools
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleDebugStatus} 
              disabled={loading || !isIOS}
              className="w-full"
            >
              🔍 Debug Token Status
            </Button>
            
            <Button 
              onClick={handleForceRefresh} 
              disabled={loading || !isIOS}
              variant="outline"
              className="w-full"
            >
              🔄 Force Token Refresh
            </Button>

            <Separator />

            <Button 
              onClick={handleCheckTokens} 
              disabled={loading}
              variant="secondary"
              className="w-full"
            >
              📊 Check All Tokens
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Debug Results</CardTitle>
            <CardDescription>
              Latest debug information
            </CardDescription>
          </CardHeader>
          <CardContent>
            {debugData ? (
              <div className="space-y-4">
                <div>
                  <strong>Success:</strong> <Badge variant={debugData.success ? 'default' : 'destructive'}>
                    {debugData.success ? 'Yes' : 'No'}
                  </Badge>
                </div>
                
                {debugData.error && (
                  <div>
                    <strong>Error:</strong> <span className="text-destructive">{debugData.error}</span>
                  </div>
                )}

                {debugData.user && (
                  <div>
                    <strong>User:</strong> {debugData.user.email}
                  </div>
                )}

                {debugData.tokens && (
                  <div>
                    <strong>iOS Tokens:</strong> <Badge>{debugData.tokens.length}</Badge>
                    {debugData.tokens.map((token: any, index: number) => (
                      <div key={index} className="text-sm bg-muted p-2 rounded mt-1">
                        <div>ID: {token.id}</div>
                        <div>Created: {new Date(token.created_at).toLocaleString()}</div>
                        <div>Updated: {new Date(token.updated_at).toLocaleString()}</div>
                        <div>Active: <Badge variant={token.is_active ? 'default' : 'secondary'}>
                          {token.is_active ? 'Yes' : 'No'}
                        </Badge></div>
                      </div>
                    ))}
                  </div>
                )}

                {debugData.permissions && (
                  <div>
                    <strong>Permissions:</strong> <Badge variant={debugData.permissions.receive === 'granted' ? 'default' : 'destructive'}>
                      {debugData.permissions.receive}
                    </Badge>
                  </div>
                )}

                {debugData.allTokens && (
                  <div>
                    <strong>All Tokens:</strong>
                    <div className="text-sm space-y-1 mt-1">
                      <div>iOS: <Badge>{debugData.iosTokens?.length || 0}</Badge></div>
                      <div>Android: <Badge>{debugData.androidTokens?.length || 0}</Badge></div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">Δεν υπάρχουν debug δεδομένα ακόμα</p>
            )}
          </CardContent>
        </Card>
      </div>

      {!isIOS && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-800">⚠️ Not on iOS</CardTitle>
            <CardDescription>
              Αυτή η σελίδα είναι για iOS debugging. Ανοίξτε την εφαρμογή σε iPhone για τις πλήρεις δυνατότητες.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
};

export default DebugPushPage;