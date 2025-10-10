import Header from "@/components/Header";
import CookieBanner from "@/components/CookieBanner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Search, UserPlus } from "lucide-react";

const Kollegaer = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CookieBanner />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Kollegaer
          </h1>
          <p className="text-muted-foreground">
            Administrer dine kollegaer og se deres turnuser
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Search className="h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Søk etter kollegaer..." 
                  className="flex-1"
                />
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Mine kollegaer
              </h2>
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Du har ingen kollegaer ennå</p>
                <p className="text-sm mt-1">Begynn å legge til kollegaer for å se deres turnuser</p>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Inviter kollegaer
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Del lenke eller QR-kode med nye kollegaer
              </p>
              <Button className="w-full">
                Generer invitasjon
              </Button>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Ventende forespørsler</h3>
              <p className="text-sm text-muted-foreground">
                Ingen ventende forespørsler
              </p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Kollegaer;
