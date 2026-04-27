import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "./contexts/ThemeContext";

const Library = lazy(() => import("./pages/Library" /* webpackChunkName: "library" */));
const MetaEngine = lazy(() => import("./pages/MetaEngine" /* webpackChunkName: "meta-engine" */));
const Admin = lazy(() => import("./pages/Admin" /* webpackChunkName: "admin" */));

const queryClient = new QueryClient();

const App = () => {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background"><div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" /></div>}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/library" element={<Library />} />
                <Route path="/engine" element={<MetaEngine />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
