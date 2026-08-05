import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  // ResponsiveContainer,
  // CartesianGrid,
  Tooltip,
  // Legend,
} from "recharts";
import styles from "./css/MonthlyFrequencyChart.module.css";
import type { MonthlyPullEntryType } from "../types";

interface MonthlyFrequencyChartTypes {
  data: MonthlyPullEntryType[];
}

const MonthlyFrequencyChart = ({ data }: MonthlyFrequencyChartTypes) => {
  return (
    <BarChart
      width={100}
      height={data.length * 65}
      data={data}
      layout="vertical"
      style={{
        width: "100%",
        maxWidth: "90%",
        maxHeight: "70vh",
        // aspectRatio: 1.618,
      }}
      responsive
      margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
      barCategoryGap="0%"
      barGap="10%"
    >
      <XAxis
        type="number"
        axisLine={false}
        tickLine={false}
        domain={[0, "dataMax"]}
        allowDecimals={false}
        tick={{ fontSize: 11 }}
        interval={0}
      />
      <YAxis
        type="category"
        interval={0}
        dataKey="month"
        width={90}
        axisLine={false}
        tickLine={false}
        tick={{ fontSize: 12 }}
      />
      <Tooltip cursor={{ fill: "rgba(0,0,0,0.04)" }} />
      <Bar
        dataKey="pulls"
        fill="#E2E8FF"
        stroke="#0041C4"
        strokeWidth={0.5}
        radius={[6, 6, 6, 6]}
        barSize={33}
      />
      {/* <RechartsDevtools /> */}
    </BarChart>
  );
};

export default MonthlyFrequencyChart;
