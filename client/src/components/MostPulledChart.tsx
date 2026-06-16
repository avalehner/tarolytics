//types
import type { MostPulledTypes } from "../types";
//recharts imports
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
// import { RechartsDevtools } from "@recharts/devtools";

interface MostPulledChartTypes {
  mostPulled: MostPulledTypes[];
}

const MostPulledChart = ({ mostPulled }: MostPulledChartTypes) => {
  // console.log("most pulled component", mostPulled);
  return (
    // <ResponsiveContainer width="100%" height={220}>
    <BarChart
      width={500}
      height={220}
      data={mostPulled}
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
    // </ResponsiveContainer>
  );
};

export default MostPulledChart;
