import type { PrzPipelineOutput } from '@/app/actions';
import type { ZakEcho } from '@/lib/zak-echoes';
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

export function ResultsDisplay({ result, mintedEchoes }: { result: PrzPipelineOutput; mintedEchoes: ZakEcho[] }) {
  const { intentResult, deliverable, validationResult, mintingResult } = result;

  return (
    <Tabs defaultValue="validation" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="validation">Validation</TabsTrigger>
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
        <ZakEchoRegistry mintedEchoes={mintedEchoes} />
      </TabsContent>
    </Tabs>
  );
}
