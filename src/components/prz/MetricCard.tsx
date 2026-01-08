import type { LucideProps } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  maxValue?: number;
  description: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;
}

export function MetricCard({ title, value, maxValue = 1, description, icon: Icon }: MetricCardProps) {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  const progressValue = (numericValue / maxValue) * 100;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Icon className="h-5 w-5 text-muted-foreground" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow justify-between">
        <div>
          <div
            className={cn(
              'text-5xl font-bold font-headline mb-2',
              progressValue > 90 && 'text-green-500',
              progressValue < 60 && progressValue > 30 && 'text-yellow-500',
              progressValue <= 30 && 'text-destructive'
            )}
          >
            {value}
          </div>
          <Progress value={progressValue} className="h-2 mb-4" />
        </div>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
