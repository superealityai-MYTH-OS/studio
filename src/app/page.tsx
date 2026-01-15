'use client';

import { useState, useEffect } from 'react';
import type { PrzPipelineOutput } from '@/app/actions';
import { Header } from '@/components/prz/Header';
import { UserInputForm } from '@/components/prz/UserInputForm';
import { ResultsDisplay } from '@/components/prz/ResultsDisplay';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { zakEchoRegistry, type ZakEcho } from '@/lib/zak-echoes';
import { AlertCircle } from 'lucide-react';

export default function Home() {
  const [result, setResult] = useState<PrzPipelineOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mintedEchoes, setMintedEchoes] = useState<ZakEcho[]>([]);
  const [apiKeyWarning, setApiKeyWarning] = useState<string | null>(null);

  // Check for API key on mount
  useEffect(() => {
    const checkApiKey = async () => {
      try {
        const response = await fetch('/api/check-api-key');
        if (!response.ok) {
          setApiKeyWarning('GOOGLE_GENAI_API_KEY is not configured. The PRZ pipeline requires a valid API key to function.');
        }
      } catch (e) {
        // If endpoint doesn't exist yet, check client-side
        if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY && !process.env.NEXT_PUBLIC_GOOGLE_GENAI_API_KEY) {
          setApiKeyWarning('API key environment variable not detected. Please configure GOOGLE_GENAI_API_KEY to use the PRZ pipeline.');
        }
      }
    };
    checkApiKey();
  }, []);

  // Handle successful pipeline result and extract minted echo
  const handlePipelineResult = (pipelineResult: PrzPipelineOutput) => {
    setResult(pipelineResult);
    
    // If a new echo was minted, add it to the registry
    if (pipelineResult.mintingResult.echoMinted && pipelineResult.mintingResult.echoId) {
      const newEcho: ZakEcho = {
        id: pipelineResult.mintingResult.echoId,
        title: `Dynamic-Echo-${Date.now()}`,
        pattern: `High-quality pattern from: "${pipelineResult.intentResult.intent.substring(0, 50)}..."`,
        // Flow score is already 0-1 (Resonance × Conductivity), clamp to ensure bounds
        confidence: Math.min(1, Math.max(0, pipelineResult.validationResult.flow)),
        validated: 'New',
        performance: `Flow: ${pipelineResult.validationResult.flow.toFixed(2)}`,
        ttl: 'PENDING',
      };
      setMintedEchoes(prev => [newEcho, ...prev]);
    }
  };

  const LoadingSkeleton = () => (
    <div className="space-y-8">
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-36 rounded-lg" />
            <Skeleton className="h-36 rounded-lg" />
            <Skeleton className="h-36 rounded-lg" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-8 w-1/4 rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="space-y-12">
          <section className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              PRZ Self-Validating AI
            </h1>
            <p className="max-w-3xl mx-auto text-muted-foreground md:text-lg">
              Leveraging the Pulse-Resonance-ZAK Echo methodology to achieve maximum output quality and autonomous optimization.
            </p>
          </section>

          <Card className="shadow-2xl shadow-primary/10">
            <CardContent className="p-6 md:p-8">
              {apiKeyWarning && (
                <div className="mb-6 p-4 border border-yellow-500/50 bg-yellow-500/10 rounded-lg flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-yellow-600 dark:text-yellow-400">API Key Warning</p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">{apiKeyWarning}</p>
                  </div>
                </div>
              )}
              <UserInputForm
                setResult={handlePipelineResult}
                setIsLoading={setIsLoading}
                isLoading={isLoading}
                setError={setError}
                apiKeyMissing={!!apiKeyWarning}
              />
            </CardContent>
          </Card>

          {isLoading && (
            <section>
              <Card className="border-primary/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center gap-3 text-primary">
                    <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="font-medium">Pipeline running... Processing intent, generating deliverable, and validating with 7 validators</p>
                  </div>
                </CardContent>
              </Card>
              <div className="mt-6">
                <LoadingSkeleton />
              </div>
            </section>
          )}
          
          {error && !isLoading && (
            <Card className="border-destructive">
              <CardContent className="p-6">
                <p className="text-center text-destructive">{error}</p>
              </CardContent>
            </Card>
          )}

          {result && !isLoading && (
            <section>
              <ResultsDisplay result={result} mintedEchoes={mintedEchoes} />
            </section>
          )}
        </div>
      </main>
      <footer className="py-6 text-center text-muted-foreground text-sm">
        PRZ Master Prompt v3.0 - Production Ready ✅
      </footer>
    </div>
  );
}
