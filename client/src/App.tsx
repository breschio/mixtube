
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Mix from './pages/Mix';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from './components/ui/toaster';

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="mixtube-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mix/:id" element={<Mix />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </ThemeProvider>
  );
}

import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import { createClient } from '@supabase/supabase-js';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { ThemeProvider } from "@/components/ThemeProvider";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/mix/:id" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [supabaseClient, setSupabaseClient] = useState<ReturnType<typeof createClient> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const client = createClient(
        import.meta.env.VITE_SUPABASE_URL ?? '',
        import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''
      );
      setSupabaseClient(client);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize Supabase client');
    }
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-destructive">Configuration Error</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!supabaseClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="mixtube-ui-theme">
      <SessionContextProvider supabaseClient={supabaseClient}>
        <QueryClientProvider client={queryClient}>
          <Router />
          <Toaster />
        </QueryClientProvider>
      </SessionContextProvider>
    </ThemeProvider>
  );
}

export default App;