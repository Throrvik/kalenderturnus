import Header from "@/components/Header";
import CookieBanner from "@/components/CookieBanner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogIn, UserPlus } from "lucide-react";

const Innlogging = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CookieBanner />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Velkommen</h1>
            <p className="text-muted-foreground">
              Logg inn eller opprett en ny konto
            </p>
          </div>

          <Card className="p-6">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Logg inn</TabsTrigger>
                <TabsTrigger value="register">Registrer</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="login-email">E-post</Label>
                  <Input id="login-email" type="email" placeholder="din@epost.no" />
                </div>
                <div>
                  <Label htmlFor="login-password">Passord</Label>
                  <Input id="login-password" type="password" />
                </div>
                <Button className="w-full gap-2">
                  <LogIn className="h-4 w-4" />
                  Logg inn
                </Button>
                <Button variant="link" className="w-full">
                  Glemt passord?
                </Button>
              </TabsContent>
              
              <TabsContent value="register" className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="register-name">Navn</Label>
                  <Input id="register-name" placeholder="Ditt navn" />
                </div>
                <div>
                  <Label htmlFor="register-email">E-post</Label>
                  <Input id="register-email" type="email" placeholder="din@epost.no" />
                </div>
                <div>
                  <Label htmlFor="register-password">Passord</Label>
                  <Input id="register-password" type="password" />
                </div>
                <div>
                  <Label htmlFor="register-confirm">Bekreft passord</Label>
                  <Input id="register-confirm" type="password" />
                </div>
                <Button className="w-full gap-2">
                  <UserPlus className="h-4 w-4" />
                  Opprett konto
                </Button>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Innlogging;
