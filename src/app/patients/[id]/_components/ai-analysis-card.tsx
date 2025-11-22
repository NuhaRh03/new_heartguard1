'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { WandSparkles, TriangleAlert, ShieldCheck } from 'lucide-react';
import type { Patient } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface AIAnalysisCardProps {
  patient: Patient;
}

export function AIAnalysisCard({ patient }: AIAnalysisCardProps) {
  const result = patient.aiAnalysis;

  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <WandSparkles className="text-primary" />
          AI Analysis
        </CardTitle>
        <CardDescription>
          Automatically analyzing sensor data for hidden patterns and potential issues.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!result && (
          <div className="flex items-center justify-center space-x-2 py-8">
            <WandSparkles className="animate-pulse text-primary" />
            <p className="text-sm text-muted-foreground">Waiting for first sensor reading...</p>
          </div>
        )}
        
        {result && (
          <div className='space-y-4'>
            <Alert variant={result.alertTriggered ? "destructive" : "default"} className={!result.alertTriggered ? 'bg-accent/20 rounded-xl' : 'rounded-xl'}>
              {result.alertTriggered ? <TriangleAlert className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4 text-accent" />}
              <AlertTitle>Analysis Complete</AlertTitle>
              <AlertDescription>{result.explanation}</AlertDescription>
            </Alert>
            
            <div className='space-y-2'>
              <div className='flex justify-between items-center text-sm'>
                <span className='font-medium'>Anomaly Level</span>
                <Badge variant={result.alertTriggered ? 'destructive' : 'secondary'} className={!result.alertTriggered ? 'bg-accent text-accent-foreground' : ''}>{result.anomalyLevel.toFixed(1)} / 10</Badge>
              </div>
              <Progress value={result.anomalyLevel * 10} />
               <p className="text-xs text-muted-foreground text-right">
                Last analyzed: {formatDistanceToNow(new Date(result.analyzedAt), { addSuffix: true })}
               </p>
            </div>

          </div>
        )}
      </CardContent>
    </Card>
  );
}

    