import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type {
  UserTypes,
  PlanetTypes,
  PlanetInterpretationTypes,
} from "../types";
import styles from "./css/AstrologicalChartPage.module.css";
import { getAstrologyData } from "../services/astrologyService";

interface AstrologyChartProps {
  currentUser: UserTypes | null;
  isAuthLoading: boolean;
}

const AstrologyChartPage = ({
  currentUser,
  isAuthLoading,
}: AstrologyChartProps) => {
  const navigate = useNavigate();
  const [astroChart, setAstroChart] = useState<string | null>(null);
  const [planetData, setPlanetData] = useState<PlanetTypes[] | null>(null);
  const [interpretations, setInterpretations] = useState<
    PlanetInterpretationTypes[] | null
  >(null);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!currentUser) {
      navigate("/login");
      return;
    }

    getAstrologyData(currentUser.id).then(
      (data: {
        chartData: string;
        planetData: PlanetTypes[];
        interpretations: PlanetInterpretationTypes[];
      }) => {
        (setAstroChart(data.chartData),
          setPlanetData(data.planetData),
          setInterpretations(data.interpretations));
      },
    );
  }, [currentUser, isAuthLoading]);

  if (!currentUser) {
    return null;
  }

  return (
    <div className={styles["astro-chart-container"]}>
      <p>chart lol</p>
      <div className={styles["astro-chart"]}>
        {astroChart ? (
          <img src={astroChart} alt="astrology chart" />
        ) : (
          <p>loading chart...</p>
        )}
      </div>
      <div className={styles["planets-container"]}></div>
    </div>
  );
};

export default AstrologyChartPage;
