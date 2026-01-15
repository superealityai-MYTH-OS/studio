import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { zakEchoRegistry, type ZakEcho } from '@/lib/zak-echoes';
import { Badge } from '@/components/ui/badge';
import { BookLock, Check, Clock, TrendingUp, Sparkles } from 'lucide-react';

interface ZakEchoRegistryProps {
  mintedEchoes?: ZakEcho[];
}

export function ZakEchoRegistry({ mintedEchoes = [] }: ZakEchoRegistryProps) {
  // Combine minted echoes with static registry
  const allEchoes = [...mintedEchoes, ...zakEchoRegistry];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookLock className="text-primary" />
          ZAK Echo Library (Permanent Registry)
        </CardTitle>
        <CardDescription>
          Reusable patterns captured from high-flow task completions. {mintedEchoes.length > 0 && `${mintedEchoes.length} new echo${mintedEchoes.length === 1 ? '' : 's'} minted this session.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {allEchoes.length === 0 ? (
          <div className="text-center py-12">
            <BookLock className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No ZAK Echoes in registry yet.</p>
            <p className="text-sm text-muted-foreground mt-2">Complete tasks with flow score ≥ 0.90 to mint new echoes.</p>
          </div>
        ) : (
          allEchoes.map((echo) => (
            <div key={echo.id} className="p-4 border rounded-lg bg-card-foreground/5 relative">
              {mintedEchoes.some(e => e.id === echo.id) && (
                <Badge className="absolute top-2 right-2 bg-gradient-to-r from-primary to-accent">
                  <Sparkles className="h-3 w-3 mr-1" />
                  New
                </Badge>
              )}
              <h4 className="font-semibold text-primary mb-1">{echo.title}</h4>
              <p className="text-sm italic text-muted-foreground mb-2">"{echo.pattern}"</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                <div className="flex items-center gap-1">
                  <Check className="h-3 w-3 text-green-500" />
                  <strong>Confidence:</strong> <Badge variant="secondary">{echo.confidence}</Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-blue-500" />
                  <strong>Validated:</strong> <Badge variant="secondary">{echo.validated}</Badge>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-purple-500" />
                  <strong>Performance:</strong> <span className="text-muted-foreground">{echo.performance}</span>
                </div>
                <div className="flex items-center gap-1">
                  <strong>TTL:</strong> <Badge variant={echo.ttl === 'PERMANENT' ? 'default' : 'outline'}>{echo.ttl}</Badge>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
