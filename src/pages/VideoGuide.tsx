import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import ScreenRecordingGuide from '@/components/ScreenRecordingGuide';
import { Link } from 'react-router-dom';
import { Play, Camera, Download, FileVideo } from 'lucide-react';

const VideoGuide = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <Header title="Video & Demo Guide" />
      
      <div className="container mx-auto px-4 py-6">
        {/* Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center">🎬 Δημιουργία Video Demo για ForMyPet</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground text-lg">
              Όλα τα εργαλεία που χρειάζεστε για να δημιουργήσετε εντυπωσιακά videos της εφαρμογής
            </p>
            
            <div className="grid sm:grid-cols-3 gap-4 mt-6">
              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-4 text-center">
                  <Play className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">Interactive Demo</h3>
                  <p className="text-sm text-muted-foreground mb-3">Live walkthrough με animation</p>
                  <Button asChild size="sm">
                    <Link to="/demo">Άνοιγμα Demo</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-4 text-center">
                  <Camera className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">Screenshots</h3>
                  <p className="text-sm text-muted-foreground mb-3">High-quality images για κάθε screen</p>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/screenshots">Προβολή Screenshots</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-4 text-center">
                  <FileVideo className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">Screen Recording</h3>
                  <p className="text-sm text-muted-foreground mb-3">Οδηγίες για κάθε πλατφόρμα</p>
                  <Button size="sm" variant="outline">Οδηγός Recording</Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Screen Recording Guide */}
        <ScreenRecordingGuide />

        {/* Export & Distribution */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>📤 Export & Διανομή</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="formats">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="formats">Formats</TabsTrigger>
                <TabsTrigger value="platforms">Platforms</TabsTrigger>
                <TabsTrigger value="optimization">Optimization</TabsTrigger>
              </TabsList>
              
              <TabsContent value="formats" className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">Video Formats</h4>
                      <ul className="text-sm space-y-1">
                        <li>• <strong>MP4 (H.264):</strong> Universal compatibility</li>
                        <li>• <strong>MOV:</strong> Best για macOS</li>
                        <li>• <strong>WebM:</strong> Web optimization</li>
                        <li>• <strong>GIF:</strong> Σύντομα clips</li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">Resolutions</h4>
                      <ul className="text-sm space-y-1">
                        <li>• <strong>1080p (1920x1080):</strong> Standard HD</li>
                        <li>• <strong>1440p (2560x1440):</strong> High quality</li>
                        <li>• <strong>Mobile (390x844):</strong> iPhone mockup</li>
                        <li>• <strong>Square (1080x1080):</strong> Social media</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="platforms" className="space-y-4">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="text-center">
                    <CardContent className="p-4">
                      <div className="text-2xl mb-2">📱</div>
                      <h4 className="font-semibold">App Stores</h4>
                      <p className="text-xs text-muted-foreground mt-1">Screenshots & preview videos</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="text-center">
                    <CardContent className="p-4">
                      <div className="text-2xl mb-2">🌐</div>
                      <h4 className="font-semibold">Website</h4>
                      <p className="text-xs text-muted-foreground mt-1">Hero videos & demos</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="text-center">
                    <CardContent className="p-4">
                      <div className="text-2xl mb-2">📺</div>
                      <h4 className="font-semibold">YouTube</h4>
                      <p className="text-xs text-muted-foreground mt-1">Full tutorials</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="text-center">
                    <CardContent className="p-4">
                      <div className="text-2xl mb-2">📱</div>
                      <h4 className="font-semibold">Social</h4>
                      <p className="text-xs text-muted-foreground mt-1">Short clips & teasers</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="optimization" className="space-y-4">
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-3">🚀 Performance Tips</h4>
                      <div className="grid sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <h5 className="font-medium mb-2">File Size</h5>
                          <ul className="space-y-1 text-muted-foreground">
                            <li>• Χρησιμοποιήστε H.264 codec</li>
                            <li>• 30fps για mobile demos</li>
                            <li>• Compress για web (&lt;50MB)</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium mb-2">Quality</h5>
                          <ul className="space-y-1 text-muted-foreground">
                            <li>• Bitrate: 5-10 Mbps για 1080p</li>
                            <li>• Constant Quality: CRF 18-23</li>
                            <li>• Audio: 128-192 kbps AAC</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-amber-50 border-amber-200">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-amber-900 mb-2">⚡ Quick Actions</h4>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Download Template
                        </Button>
                        <Button size="sm" variant="outline">
                          <Camera className="h-4 w-4 mr-2" />
                          Bulk Screenshots
                        </Button>
                        <Button size="sm" variant="outline">
                          <FileVideo className="h-4 w-4 mr-2" />
                          Export Settings
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VideoGuide;