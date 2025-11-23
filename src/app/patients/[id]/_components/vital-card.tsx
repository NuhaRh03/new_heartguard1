
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { Line, LineChart, XAxis, YAxis, CartesianGrid } from "recharts";

interface VitalCardProps {
  title: string;
  value: number;
  unit: string;
  Icon: React.ElementType;
  data: any[];
  dataKey: string;
  color: string;
  normalRange: [number, number];
  showXAxis?: boolean;
}

const chartConfig = {
  value: {
    label: "Value",
  },
};

export function VitalCard({
  title,
  value,
  unit,
  Icon,
  data,
  dataKey,
  color,
  normalRange,
  showXAxis = false,
}: VitalCardProps) {
  const isAbnormal = value < normalRange[0] || value > normalRange[1];

  return (
    <Card className="rounded-xl flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div>
            <div
              className={cn(
                "text-2xl font-bold transition-colors",
                isAbnormal ? "text-destructive" : ""
              )}
               style={!isAbnormal ? { color } : {}}
            >
              {value.toFixed(showXAxis ? 0 : 1)}
              <span className="text-xs text-muted-foreground ml-1">{unit}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Normal: {normalRange[0]}-{normalRange[1]} {unit}
            </p>
        </div>
          <div className={cn("h-24 w-full mt-4", showXAxis && "h-40")}>
            <ChartContainer config={chartConfig} className="h-full w-full">
              <LineChart
                data={data}
                margin={{ top: 5, right: 10, left: -30, bottom: showXAxis ? 5 : -10 }}
              >
                {showXAxis && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />}
                <XAxis
                  dataKey="timestamp"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  hide={!showXAxis}
                />
                 <YAxis 
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false} 
                  tickLine={false}
                  domain={['dataMin - 5', 'dataMax + 5']}
                  hide={!showXAxis}
                 />
                <ChartTooltip
                    cursor={{stroke: 'hsl(var(--border))', strokeWidth: 1, strokeDasharray: '3 3'}}
                    content={<ChartTooltipContent 
                      hideLabel 
                      formatter={(value, name, props) => (
                         <div className="flex flex-col">
                            <span className="text-xs">{props.payload.timestamp}</span>
                            <span className="font-bold">{`${(value as number).toFixed(1)} ${unit}`}</span>
                         </div>
                      )}
                      />}
                />
                <Line
                  dataKey={dataKey}
                  type="monotone"
                  stroke={color}
                  strokeWidth={2}
                  dot={showXAxis ? { r: 3, fill: color } : false}
                />
              </LineChart>
            </ChartContainer>
          </div>
      </CardContent>
    </Card>
  );
}
