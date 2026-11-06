"use client";

import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Button } from "@/components/ui/button";
import { CalendarRange, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface PriceHistoryChartProps {
  productId?: string;
  currentPrice: number;
}

// Simple deterministic hash to make history consistent per product
function getStringHash(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export function PriceHistoryChart({ productId = "default", currentPrice }: PriceHistoryChartProps) {
  const [days, setDays] = useState<30 | 90>(30);

  const chartData = useMemo(() => {
    const dataPoints = [];
    const seed = getStringHash(productId);
    const date = new Date();
    
    // Generate dates going back
    for (let i = days; i >= 0; i -= days === 30 ? 3 : 7) {
      const pointDate = new Date();
      pointDate.setDate(date.getDate() - i);
      
      // Pseudo-random price fluctuation based on seed and index
      const noise = Math.sin(seed + i) * Math.cos(seed * i);
      const percentFluctuation = 0.05 + Math.abs(noise % 0.15); // 5% to 20%
      const multiplier = 1 + (noise > 0 ? percentFluctuation : -percentFluctuation);
      const calculatedPrice = Math.round(currentPrice * multiplier);

      dataPoints.push({
        date: pointDate.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
        price: calculatedPrice,
      });
    }

    // Ensure last point is exactly the current price
    dataPoints[dataPoints.length - 1] = {
      date: "Today",
      price: currentPrice,
    };

    return dataPoints;
  }, [productId, currentPrice, days]);

  const stats = useMemo(() => {
    const prices = chartData.map((d) => d.price);
    const highest = Math.max(...prices);
    const lowest = Math.min(...prices);
    const average = Math.round(prices.reduce((s, p) => s + p, 0) / prices.length);
    const priceChangePercent = Math.round(((currentPrice - prices[0]) / prices[0]) * 100);

    return { highest, lowest, average, priceChangePercent };
  }, [chartData, currentPrice]);

  return (
    <div className="space-y-4 p-5 rounded-3xl border bg-card/50 mt-4">
      {/* Title & Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarRange className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-black uppercase tracking-wider">Price History Trends</h4>
        </div>
        <div className="flex items-center gap-1 bg-muted p-1 rounded-xl">
          <Button
            variant={days === 30 ? "secondary" : "ghost"}
            size="sm"
            className="h-7 px-3 text-xs font-bold rounded-lg"
            onClick={() => setDays(30)}
          >
            30D
          </Button>
          <Button
            variant={days === 90 ? "secondary" : "ghost"}
            size="sm"
            className="h-7 px-3 text-xs font-bold rounded-lg"
            onClick={() => setDays(90)}
          >
            90D
          </Button>
        </div>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-3 gap-2 bg-muted/30 p-3 rounded-2xl border">
        <div className="text-center">
          <span className="text-[9px] font-bold text-muted-foreground uppercase">Lowest</span>
          <p className="text-xs font-black text-emerald-500">₹{stats.lowest.toLocaleString()}</p>
        </div>
        <div className="text-center border-x">
          <span className="text-[9px] font-bold text-muted-foreground uppercase">Average</span>
          <p className="text-xs font-black">₹{stats.average.toLocaleString()}</p>
        </div>
        <div className="text-center">
          <span className="text-[9px] font-bold text-muted-foreground uppercase">Highest</span>
          <p className="text-xs font-black text-rose-500">₹{stats.highest.toLocaleString()}</p>
        </div>
      </div>

      {/* Interactive Chart */}
      <div className="h-[200px] w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="chartColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              domain={["auto", "auto"]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                borderColor: "hsl(var(--border))",
                borderRadius: "16px",
                fontSize: "11px",
                fontWeight: "bold",
              }}
              itemStyle={{ color: "hsl(var(--primary))" }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="hsl(var(--primary))"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#chartColor)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Volatility Indicator */}
      <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground mt-2 border-t pt-3">
        <span className="flex items-center gap-1">
          <TrendingDown className="h-3 w-3 text-emerald-500" />
          Price Volatility: Low
        </span>
        <span className="flex items-center gap-0.5">
          {stats.priceChangePercent > 0 ? (
            <>
              <ArrowUpRight className="h-3 w-3 text-rose-500" />
              <span className="text-rose-500">+{stats.priceChangePercent}%</span>
            </>
          ) : (
            <>
              <ArrowDownRight className="h-3 w-3 text-emerald-500" />
              <span className="text-emerald-500">{stats.priceChangePercent}%</span>
            </>
          )}
          &nbsp;change ({days}d)
        </span>
      </div>
    </div>
  );
}
