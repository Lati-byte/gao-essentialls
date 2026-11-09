"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatPrice } from "@/lib/format";

interface DashboardChartsProps {
  revenueTrend: { date: string; revenue: number }[];
  categorySales: { category: string; sales: number }[];
  currencySymbol: string;
}

export function DashboardCharts({
  revenueTrend,
  categorySales,
  currencySymbol,
}: DashboardChartsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* 30-Day Revenue Trend */}
      <div className="card p-6">
        <div className="mb-4">
          <h2 className="font-heading text-base font-bold text-ink">30-Day Revenue Trend</h2>
          <p className="text-xs text-muted">Daily sales totals from completed orders</p>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                tickLine={false}
                stroke="#94a3b8"
                fontSize={11}
                tickMargin={8}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickFormatter={(v) => `${currencySymbol}${v}`}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(val) => [
                  formatPrice(Number(val) || 0, currencySymbol),
                  "Revenue",
                ]}
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderColor: "#e2e8f0",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#2563eb"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#revenueGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sales by Category */}
      <div className="card p-6">
        <div className="mb-4">
          <h2 className="font-heading text-base font-bold text-ink">Units Sold by Category</h2>
          <p className="text-xs text-muted">Total items purchased across all categories</p>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categorySales} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="category"
                angle={-30}
                textAnchor="end"
                interval={0}
                stroke="#94a3b8"
                fontSize={10}
                tickMargin={6}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                formatter={(val) => [`${val} units`, "Sold"]}
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderColor: "#e2e8f0",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="sales" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
