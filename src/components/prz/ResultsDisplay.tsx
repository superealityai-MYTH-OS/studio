import type { PrzPipelineOutput } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MetricCard } from '@/components/prz/MetricCard';
import { ZakEchoRegistry } from '@/components/prz/ZakEchoRegistry';
import { Badge } from '@/components/ui/badge';
import { FileText, Lightbulb, Bot, CheckCircle, XCircle, Gauge, Zap, Waypoints } from 'lucide-react';

function getTierBadgeVariant(tier: string): 'default' | 'secondary' | 'destructive' {
  if (tier.includes('GREEN LANE')) return 'default';
  if (tier.includes('MONITORED')) return 'secondary';
  return 'destructive';
}

export function ResultsDisplay({ result }: { result: PrzPipelineOutput }) {
  const { intentResult, zakEchoSearchResult, deliverable, validationResult, mintingResult } = result;

  return (
    <Tabs defaultValue="validation" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="validation">Validation</TabsTrigger>
        <TabsTrigger value="patterns">Pattern Match</TabsTrigger>
        <TabsTrigger value="deliverable">Deliverable</TabsTrigger>
        <TabsTrigger value="registry">ZAK Echo Registry</TabsTrigger>
      </TabsList>

      <TabsContent value="validation" className="mt-6">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="text-primary" />
                PRZ Validation Metrics
              </CardTitle>
              <CardDescription>
                Post-delivery audit based on simulated multi-model consensus.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <MetricCard
                  title="Flow Score"
                  value={validationResult.flow.toFixed(2)}
                  maxValue={1}
                  description="Overall quality (Resonance × Conductivity)."
                  icon={Gauge}
                />
                <MetricCard
                  title="Resonance"
                  value={validationResult.resonance.toFixed(2)}
                  maxValue={1}
                  description="Consistency across validators."
                  icon={Zap}
                />
                <MetricCard
                  title="Conductivity"
                  value={validationResult.conductivity.toFixed(2)}
                  maxValue={1}
                  description="Average trust level of validators."
                  icon={Waypoints}
                />
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="font-medium">Result:</span>
                <Badge variant={getTierBadgeVariant(validationResult.tier)} className="text-sm">
                  {validationResult.tier}
                </Badge>
                <span className="text-muted-foreground">|</span>
                <span className="font-medium">Validator Consensus:</span>
                <Badge variant="outline">{validationResult.validatorConsensus}</Badge>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="text-primary" />
                  Intent Decoder
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><strong>Intent:</strong> {intentResult.intent}</p>
                <p><strong>Confidence:</strong> {(intentResult.confidenceScore * 100).toFixed(0)}%</p>
                <p><strong>Domain:</strong> {intentResult.domain}</p>
                <p><strong>Complexity:</strong> {intentResult.complexity}</p>
                <p><strong>Classification:</strong> {intentResult.intentClassification}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="text-primary" />
                  ZAK Echo Minting
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                {mintingResult.echoMinted ? (
                  <CheckCircle className="h-10 w-10 text-green-500" />
                ) : (
                  <XCircle className="h-10 w-10 text-destructive" />
                )}
                <div>
                  <p className="font-semibold">{mintingResult.echoMinted ? 'New ZAK Echo Minted!' : 'No New Echo Minted'}</p>
                  <p className="text-sm text-muted-foreground">
                    {mintingResult.echoMinted
                      ? `ID: ${mintingResult.echoId}`
                      : `Flow score of ${validationResult.flow.toFixed(2)} was below the 0.90 threshold.`}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="patterns" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Waypoints className="text-accent" />
              Harmonic Pattern Matching
            </CardTitle>
            <CardDescription>
              Searches ZAK Echo Registry using harmonic field similarity detection (threshold: 0.85+)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {zakEchoSearchResult.appliedPattern ? (
              <div className="space-y-4">
                <div className="p-4 border-2 border-accent rounded-lg bg-accent/10">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-2">Pattern Applied Successfully!</h4>
                      <p className="text-sm mb-3">
                        <strong>Pattern:</strong> "{zakEchoSearchResult.appliedPattern}"
                      </p>
                      <div className="flex flex-wrap gap-3 text-sm">
                        <Badge variant="default">
                          Confidence: {(zakEchoSearchResult.bestMatch!.matchConfidence * 100).toFixed(1)}%
                        </Badge>
                        <Badge variant="secondary">
                          Echo ID: {zakEchoSearchResult.bestMatch!.echo.id}
                        </Badge>
                        <Badge variant="outline">
                          Title: {zakEchoSearchResult.bestMatch!.echo.title}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                
                {zakEchoSearchResult.matches.length > 1 && (
                  <div>
                    <h4 className="font-semibold mb-3">Other Matches Found:</h4>
                    <div className="space-y-2">
                      {zakEchoSearchResult.matches.slice(1, 4).map((match) => (
                        <div key={match.echo.id} className="p-3 border rounded-lg bg-muted/30">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium text-sm">{match.echo.title}</span>
                            <Badge variant="outline" className="ml-2">
                              {(match.matchConfidence * 100).toFixed(1)}%
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground italic">"{match.echo.pattern}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 border rounded-lg bg-muted/30 text-center">
                <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="font-semibold mb-2">No Pattern Match Above Threshold</p>
                <p className="text-sm text-muted-foreground mb-4">
                  No patterns in the registry matched with confidence ≥ 0.85
                </p>
                {zakEchoSearchResult.bestMatch && (
                  <p className="text-xs text-muted-foreground">
                    Best match: "{zakEchoSearchResult.bestMatch.echo.title}" 
                    ({(zakEchoSearchResult.bestMatch.matchConfidence * 100).toFixed(1)}%)
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="deliverable" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="text-primary" />
              Completed Deliverable
            </CardTitle>
            <CardDescription>
              This artifact was generated to 100% completion without interruption.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none p-4 bg-muted/50 rounded-lg whitespace-pre-wrap">
              {deliverable}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="registry" className="mt-6">
        <ZakEchoRegistry />
      </TabsContent>
    </Tabs>
  );
}
