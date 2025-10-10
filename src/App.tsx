import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import OmOss from "./pages/OmOss";
import Kollegaer from "./pages/Kollegaer";
import Profil from "./pages/Profil";
import Innlogging from "./pages/Innlogging";
import NotFound from "./pages/NotFound";
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/om-oss" element={<OmOss />} />
          <Route path="/kollegaer" element={<Kollegaer />} />
          <Route path="/profil" element={<Profil />} />
          <Route path="/innlogging" element={<Innlogging />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
