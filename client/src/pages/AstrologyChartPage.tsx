import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { UserTypes } from "../types";
import styles from "./css/AstrologicalChartPage.module.css";
import { getAstrologyChart } from "../services/astrologyService";

interface AstrologyChartProps {
  currentUser: UserTypes | null;
  isAuthLoading: boolean;
}

const AstrologyChartPage = ({
  currentUser,
  isAuthLoading,
}: AstrologyChartProps) => {
  const navigate = useNavigate();
  const [astroChartUrl, setAstroChartUrl] = useState<string>("");

  useEffect(() => {
    if (isAuthLoading) return;
    if (!currentUser) {
      navigate("/login");
      return;
    }

    getAstrologyChart(currentUser.id).then((data: { chartUrl: string }) =>
      setAstroChartUrl(data.chartUrl),
    );
  }, [currentUser, isAuthLoading]);

  if (!currentUser) {
    return null;
  }

  console.log("astro chart url", astroChartUrl);

  return (
    <div className={styles["astro-chart-container"]}>
      <p>chart lol</p>
      <div className={styles["astro-chart"]}>
        <img src={astroChartUrl} alt="astrology chart" />
      </div>
    </div>
  );
};

export default AstrologyChartPage;
