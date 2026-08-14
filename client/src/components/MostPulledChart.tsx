//types
import type { MostPulledTypes } from "../types";
//recharts imports
import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

interface MostPulledChartTypes {
  mostPulled: MostPulledTypes[];
}

const MostPulledChart = ({ mostPulled }: MostPulledChartTypes) => {
  // console.log("most pulled component", mostPulled);
  return (
    <BarChart
      width={100}
      height={mostPulled.length > 0 ? mostPulled.length * 40 : 260}
      data={mostPulled}
      layout="vertical"
      style={{
        width: "95%",
        maxWidth: "500px",
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
        width={100}
        axisLine={false}
        tickLine={false}
        tick={{ fontSize: 12 }}
      />
      <Tooltip cursor={{ fill: "rgba(0,0,0,0.04)" }} />
      <Bar
        dataKey="pull_count"
        fill="#E2E8FF"
        stroke="rgb(0, 65, 196, 0.6)"
        strokeWidth={0.5}
        radius={[6, 6, 6, 6]}
        barSize={25}
      />
    </BarChart>
  );
};

export default MostPulledChart;
