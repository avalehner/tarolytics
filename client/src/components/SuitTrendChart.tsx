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
  console.log("suitTrend", suitTrend);
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart
        data={suitTrend}
        margin={{ top: 8, right: 34, left: -11, bottom: 20 }}
        width={100}
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
        <Legend
          verticalAlign="bottom"
          align="center"
          layout="horizontal"
          iconType="circle"
          iconSize={5}
          wrapperStyle={{
            fontSize: "0.85rem",
            fontFamily: "Libertinus Serif, serif",
            paddingTop: 12,
            paddingLeft: 55,
          }}
        />
        <Line
          type="monotone"
          dataKey="cups"
          stroke="#b4bbdb"
          dot={false}
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="swords"
          stroke="#c9a9d6"
          dot={false}
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="wands"
          stroke="#f39a7a"
          dot={false}
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="pentacles"
          stroke="#aac1a2"
          dot={false}
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="major"
          stroke="#d4935a"
          dot={false}
          strokeWidth={2}
        />
        {/* <RechartsDevtools /> */}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SuitTrendChart;
