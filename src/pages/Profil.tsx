import Header from "@/components/Header";
import CookieBanner from "@/components/CookieBanner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, LogIn } from "lucide-react";
import { Link } from "react-router-dom";

const Profil = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CookieBanner />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="p-12 text-center">
            <User className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
            <h1 className="text-3xl font-bold mb-4">Min profil</h1>
            <p className="text-muted-foreground mb-8">
              Du må være innlogget for å se din profil
            </p>
            <Link to="/innlogging">
              <Button size="lg" className="gap-2">
                <LogIn className="h-5 w-5" />
                Logg inn
              </Button>
            </Link>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profil;
