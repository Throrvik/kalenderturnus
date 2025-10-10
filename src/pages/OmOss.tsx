import { useState } from "react";
import Header from "@/components/Header";
import CookieBanner from "@/components/CookieBanner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, Users, Share2, Bell, Mail, MapPin, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const OmOss = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: "Melding mottatt!",
      description: "Takk for at du kontaktet oss. Vi kommer tilbake til deg snart.",
    });
    
    setFormData({ name: "", email: "", message: "" });
  };

  const features = [
    {
      icon: Calendar,
      title: "Turnusplanlegging",
      description: "Enkelt å holde oversikt over din og kollegaenes turnuser",
    },
    {
      icon: Users,
      title: "Kollegadeling",
      description: "Del kalenderen din og se når kollegaene dine jobber",
    },
    {
      icon: Share2,
      title: "Inviter andre",
      description: "Send lenke eller QR-kode til nye kollegaer",
    },
    {
      icon: Bell,
      title: "Varsler",
      description: "Få beskjed om endringer i turnuser og kollegaforespørsler",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CookieBanner />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Om TurnusKalender
            </h1>
            <p className="text-xl text-muted-foreground">
              Gjør turnusplanlegging enklere for deg og dine kollegaer
            </p>
          </div>

          <Card className="p-8 mb-12">
            <h2 className="text-2xl font-bold mb-4">Vårt formål</h2>
            <p className="text-muted-foreground mb-4">
              TurnusKalender ble opprettet for å gjøre det enklere for folk som jobber i turnus 
              å holde oversikt over arbeidstider og koordinere med kollegaer. Vi vet at turnusarbeid 
              kan være krevende, og ønsker å gjøre planleggingen så smidig som mulig.
            </p>
            <p className="text-muted-foreground">
              Med vår app kan du enkelt se din egen turnus, dele den med kollegaer, og holde oversikt 
              over når dere er på jobb sammen. Dette gjør det lettere å planlegge både arbeid og fritid.
            </p>
          </Card>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10 flex-shrink-0">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <Card className="p-8 mb-12 text-center bg-primary/5">
            <h2 className="text-2xl font-bold mb-4">Kom i gang i dag</h2>
            <p className="text-muted-foreground mb-6">
              Registrer deg gratis og begynn å organisere turnusene dine
            </p>
            <Link to="/innlogging">
              <Button size="lg">
                Opprett konto
              </Button>
            </Link>
          </Card>

          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-8">Kontakt oss</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-8">
                <h3 className="text-xl font-bold mb-6">Send oss en melding</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Navn</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">E-post</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">Melding</Label>
                    <Textarea
                      id="message"
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Send melding
                  </Button>
                </form>
              </Card>

              <div className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10 flex-shrink-0">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">E-post</h3>
                      <p className="text-sm text-muted-foreground">
                        kontakt@turnuskalender.no
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-accent/10 flex-shrink-0">
                      <Clock className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Åpningstider</h3>
                      <p className="text-sm text-muted-foreground">
                        Mandag - Fredag: 09:00 - 17:00<br />
                        Lørdag - Søndag: Stengt
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-shift-blue/10 flex-shrink-0">
                      <MapPin className="h-6 w-6 text-shift-blue" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Adresse</h3>
                      <p className="text-sm text-muted-foreground">
                        Oslo, Norge
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OmOss;
