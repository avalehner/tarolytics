import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import styles from "./css/MonthlyFrequencyChart.module.css";
import type { PullsPerMonthTypes, MonthlyPullEntryType } from "../types";

interface MonthlyFrequencyChartTypes {
  data: MonthlyPullEntryType[];
}

const MonthlyFrequencyChart = ({ data }: MonthlyFrequencyChartTypes) => {
  return (
    <BarChart
      width={500}
      height={220}
      data={data}
      layout="vertical"
      style={{
        width: "100%",
        maxWidth: "700px",
        maxHeight: "70vh",
        aspectRatio: 1.618,
      }}
      responsive
      margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
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
        dataKey="card_name"
        width={110}
        axisLine={false}
        tickLine={false}
        tick={{ fontSize: 12 }}
      />
      <Tooltip cursor={{ fill: "rgba(0,0,0,0.04)" }} />
      <Bar dataKey="pull_count" fill="#7F77DD" radius={[0, 3, 3, 0]} />
      {/* <RechartsDevtools /> */}
    </BarChart>
  );
};

export default MonthlyFrequencyChart;
