import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

interface ViewsData {
  name: string;
  dailyViews: number;
  totalViews: number;
}

interface ViewsChartProps {
  data: ViewsData[];
}

export function ViewsChart({ data }: ViewsChartProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">조회수</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }}
            formatter={(value: number, name: string) => {
              if (name === "totalViews") return [`총 조회수: ${value}`, "총 조회수"];
              if (name === "dailyViews") return [`1일 조회수: ${value}`, "1일 조회수"];
              return [value, name];
            }}
          />
          <Legend
            formatter={(value) => {
              if (value === "totalViews") return "총 조회수";
              if (value === "dailyViews") return "1일 조회수";
              return value;
            }}
          />
          <Bar dataKey="dailyViews" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="totalViews" fill="#f97316" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

