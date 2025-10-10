import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Cookie } from "lucide-react";

const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookieConsent", "declined");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-5">
      <Card className="max-w-4xl mx-auto p-6 shadow-medium">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <Cookie className="h-8 w-8 text-primary flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">Vi bruker cookies</h3>
            <p className="text-sm text-muted-foreground">
              Vi bruker cookies for å forbedre brukeropplevelsen og lagre preferansene dine. 
              Ved å fortsette å bruke siden godtar du vår bruk av cookies.
            </p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={handleDecline}
              className="flex-1 md:flex-initial"
            >
              Avslå
            </Button>
            <Button
              onClick={handleAccept}
              className="flex-1 md:flex-initial"
            >
              Godta
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CookieBanner;
