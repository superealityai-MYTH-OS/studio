'use client';

import { useState } from 'react';
import type { PrzPipelineOutput } from '@/app/actions';
import { Header } from '@/components/prz/Header';
import { UserInputForm } from '@/components/prz/UserInputForm';
import { ResultsDisplay } from '@/components/prz/ResultsDisplay';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  const [result, setResult] = useState<PrzPipelineOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
              <UserInputForm
                setResult={setResult}
                setIsLoading={setIsLoading}
                isLoading={isLoading}
                setError={setError}
              />
            </CardContent>
          </Card>

          {isLoading && (
            <section>
              <LoadingSkeleton />
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
              <ResultsDisplay result={result} />
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
