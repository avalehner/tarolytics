import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
// import { RechartsDevtools } from "@recharts/devtools";
import { SuitTrendTypes } from "../types";

interface SuitTrendChartProps {
  suitTrend: SuitTrendTypes[];
}

const SuitTrendChart = ({ suitTrend }: SuitTrendChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart
        data={suitTrend}
        margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
      >
        <CartesianGrid vertical={false} strokeOpacity={0.1} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          // dataKey="suit"
          tick={{ fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="cups"
          stroke="#7F77DD"
          dot={false}
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="swords"
          stroke="#D4537E"
          dot={false}
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="wands"
          stroke="#D85A30"
          dot={false}
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="pentacles"
          stroke="#1D9E75"
          dot={false}
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="major arcana"
          stroke="#BA7517"
          dot={false}
          strokeWidth={2}
        />
        {/* <RechartsDevtools /> */}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SuitTrendChart;
