"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { Line, LineChart, XAxis } from "recharts";

interface VitalCardProps {
  title: string;
  value: number;
  unit: string;
  Icon: React.ElementType;
  data: any[]; // The data is now a single object in an array
  dataKey: string;
  color: string;
  normalRange: [number, number];
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
  normalRange
}: VitalCardProps) {
  const isAbnormal = value < normalRange[0] || value > normalRange[1];

  return (
    <Card className="rounded-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-start justify-between">
          <div>
            <div
              className={cn(
                "text-2xl font-bold transition-colors",
                isAbnormal ? "text-destructive" : ""
              )}
            >
              {value.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">{unit}</p>
          </div>
          <div className="h-16 w-32">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <LineChart
                data={data}
                margin={{ top: 5, right: 5, left: -30, bottom: 0 }}
              >
                <XAxis
                  dataKey="timestamp"
                  tick={false}
                  axisLine={false}
                  tickLine={false}
                />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                    formatter={(value) => `${(value as number).toFixed(1)} ${unit}`}
                />
                <Line
                  dataKey={dataKey}
                  type="monotone"
                  stroke={color}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
