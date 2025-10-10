import Header from "@/components/Header";
import CookieBanner from "@/components/CookieBanner";
import CalendarGrid from "@/components/Calendar/CalendarGrid";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar as CalendarIcon, Bell } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CookieBanner />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Min Turnuskalender
          </h1>
          <p className="text-muted-foreground">
            Oversikt over turnuser, kollegaer og planlegging
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <CalendarIcon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Mine turnuser</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Ingen turnuser registrert ennå
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Legg til turnus
            </Button>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Users className="h-5 w-5 text-accent" />
              </div>
              <h3 className="font-semibold">Kollegaer</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Del kalenderen din med kollegaer
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Finn kollegaer
            </Button>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-shift-blue/10">
                <Bell className="h-5 w-5 text-shift-blue" />
              </div>
              <h3 className="font-semibold">Varsler</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Ingen nye varsler
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Se innstillinger
            </Button>
          </Card>
        </div>

        <CalendarGrid />
      </main>
    </div>
  );
};

export default Index;
