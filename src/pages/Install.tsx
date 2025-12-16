import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Download, Share, Plus, MoreVertical, Check, Smartphone, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const Install = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Detect platform
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua));
    setIsAndroid(/Android/.test(ua));

    // Listen for install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-hero text-primary-foreground p-6 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-primary blur-3xl" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-primary/20">
              <Building2 className="w-6 h-6" />
            </div>
            <h1 className="font-display text-2xl font-bold">FlatFinder</h1>
          </div>
          <p className="text-primary-foreground/70 text-sm">
            Install the app on your phone
          </p>
        </div>
      </header>

      <main className="px-4 -mt-6 pb-8">
        {isInstalled ? (
          <Card className="p-6 text-center animate-slide-up">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-success" />
            </div>
            <h2 className="font-display text-xl font-semibold mb-2">Already Installed!</h2>
            <p className="text-muted-foreground mb-6">
              FlatFinder is already installed on your device. You can find it on your home screen.
            </p>
            <Button
              onClick={() => navigate(user ? '/' : '/auth')}
              className="gradient-primary text-primary-foreground"
            >
              Open App
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Card>
        ) : deferredPrompt ? (
          <Card className="p-6 text-center animate-slide-up">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <Download className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-display text-xl font-semibold mb-2">Install FlatFinder</h2>
            <p className="text-muted-foreground mb-6">
              Add FlatFinder to your home screen for quick access and offline use.
            </p>
            <Button
              onClick={handleInstall}
              className="w-full gradient-primary text-primary-foreground h-12"
            >
              <Download className="w-5 h-5 mr-2" />
              Install App
            </Button>
          </Card>
        ) : (
          <div className="space-y-4 animate-slide-up">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Smartphone className="w-6 h-6 text-primary" />
                <h2 className="font-display text-lg font-semibold">Install on Your Phone</h2>
              </div>
              
              {isIOS ? (
                <div className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    Follow these steps to install FlatFinder on your iPhone:
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        1
                      </div>
                      <div>
                        <p className="font-medium">Tap the Share button</p>
                        <p className="text-sm text-muted-foreground">
                          Look for the <Share className="w-4 h-4 inline" /> icon at the bottom of Safari
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        2
                      </div>
                      <div>
                        <p className="font-medium">Scroll down and tap "Add to Home Screen"</p>
                        <p className="text-sm text-muted-foreground">
                          Look for the <Plus className="w-4 h-4 inline" /> icon
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        3
                      </div>
                      <div>
                        <p className="font-medium">Tap "Add"</p>
                        <p className="text-sm text-muted-foreground">
                          The app will appear on your home screen
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : isAndroid ? (
                <div className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    Follow these steps to install FlatFinder on your Android phone:
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        1
                      </div>
                      <div>
                        <p className="font-medium">Tap the menu button</p>
                        <p className="text-sm text-muted-foreground">
                          Look for <MoreVertical className="w-4 h-4 inline" /> in the top right of Chrome
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        2
                      </div>
                      <div>
                        <p className="font-medium">Tap "Install app" or "Add to Home screen"</p>
                        <p className="text-sm text-muted-foreground">
                          You may see a prompt at the bottom too
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        3
                      </div>
                      <div>
                        <p className="font-medium">Tap "Install"</p>
                        <p className="text-sm text-muted-foreground">
                          The app will appear in your app drawer
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    Open this page on your mobile device to install FlatFinder:
                  </p>
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <p className="font-mono text-sm break-all">
                      {window.location.origin}/install
                    </p>
                  </div>
                </div>
              )}
            </Card>

            <Button
              variant="outline"
              onClick={() => navigate(user ? '/' : '/auth')}
              className="w-full"
            >
              Continue in Browser
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Install;
