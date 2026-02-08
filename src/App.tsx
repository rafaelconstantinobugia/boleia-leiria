import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminProvider } from "./contexts/AdminContext";
import Index from "./pages/Index";
import NovoPedido from "./pages/NovoPedido";
import NovaOferta from "./pages/NovaOferta";
import PedidoCriado from "./pages/PedidoCriado";
import OfertaCriada from "./pages/OfertaCriada";
import EditarPedido from "./pages/EditarPedido";
import EditarOferta from "./pages/EditarOferta";
import Pedidos from "./pages/Pedidos";
import Ofertas from "./pages/Ofertas";
import Coordenacao from "./pages/Coordenacao";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AdminProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/novo-pedido" element={<NovoPedido />} />
            <Route path="/nova-oferta" element={<NovaOferta />} />
            <Route path="/pedido-criado/:token" element={<PedidoCriado />} />
            <Route path="/oferta-criada/:token" element={<OfertaCriada />} />
            <Route path="/editar/pedido/:token" element={<EditarPedido />} />
            <Route path="/editar/oferta/:token" element={<EditarOferta />} />
            <Route path="/pedidos" element={<Pedidos />} />
            <Route path="/ofertas" element={<Ofertas />} />
            <Route path="/coordenacao" element={<Coordenacao />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AdminProvider>
  </QueryClientProvider>
);

export default App;
