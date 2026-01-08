import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { zakEchoRegistry } from '@/lib/zak-echoes';
import { Badge } from '@/components/ui/badge';
import { BookLock, Check, Clock, TrendingUp } from 'lucide-react';

export function ZakEchoRegistry() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookLock className="text-primary" />
          ZAK Echo Library (Permanent Registry)
        </CardTitle>
        <CardDescription>
          Reusable patterns captured from high-flow task completions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {zakEchoRegistry.map((echo) => (
          <div key={echo.id} className="p-4 border rounded-lg bg-card-foreground/5">
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
        ))}
      </CardContent>
    </Card>
  );
}
