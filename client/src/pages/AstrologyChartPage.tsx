import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type {
  UserTypes,
  PlanetTypes,
  // PlanetInterpretationTypes,
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
  const [interpretations, setInterpretations] = useState<any | null>(null);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!currentUser) {
      navigate("/login");
      return;
    }

    getAstrologyData(currentUser.id).then(
      (data: {
        chartData: string;
        planetsData: PlanetTypes[];
        interpretations: any;
      }) => {
        (setAstroChart(data.chartData),
          setPlanetData(data.planetsData),
          setInterpretations(data.interpretations));
      },
    );
  }, [currentUser, isAuthLoading]);

  if (!currentUser) {
    return null;
  }

  console.log("planets", planetData);
  console.log("interpretations", interpretations);

  return (
    <div className={styles["astro-info-container"]}>
      <div className={styles["astro-chart"]}>
        {astroChart ? (
          <img src={astroChart} alt="astrology chart" />
        ) : (
          <p>loading chart...</p>
        )}
      </div>
      {/* <div className={styles["planets-container"]}>
        {planetData?.map((planet) => {
          return <div key={planet.id}>{planet.name}</div>;
        })}
      </div> */}
      <div className={styles["interpretations-container"]}>
        {interpretations?.sections?.core_self?.map((interpretation: any) => {
          return (
            <div key={interpretation.id}>
              <div>{interpretation.body}</div>
              <hr />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AstrologyChartPage;
