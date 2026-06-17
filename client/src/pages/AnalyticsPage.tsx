//react imports
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
//service functions
import { getNonSearchData } from "../services/analyticsService";
//components
import MostPulledCardsChart from "../components/MostPulledChart";
//types
import type {
  UserTypes,
  MostPulledTypes,
  SummaryStatsTypes,
  SuitTrendTypes,
} from "../types";
//styles
import styles from "./css/AnalyticsPage.module.css";
import SuitTrendChart from "../components/SuitTrendChart";

interface AnalyticsPageProps {
  currentUser: UserTypes | null;
  isAuthLoading: boolean;
}

const AnalyticsPage = ({ currentUser, isAuthLoading }: AnalyticsPageProps) => {
  const navigate = useNavigate();
  const [summaryStats, setSummaryStats] = useState<SummaryStatsTypes | null>(
    null,
  );
  const [mostPulled, setMostPulled] = useState<MostPulledTypes[] | null>(null);
  const [suitTrend, setSuitTrend] = useState<SuitTrendTypes[] | null>(null);

  //useEffects
  useEffect(() => {
    if (isAuthLoading) return;
    if (!currentUser) navigate("/login");
  }, [currentUser, isAuthLoading]);

  useEffect(() => {
    if (!currentUser) return;
    getNonSearchData().then((data) => {
      // console.log(data);
      setSummaryStats(data.summary_stats);
      setMostPulled(
        //convert pull_count to number
        data.most_pulled.map((item: any) => ({
          ...item,
          pull_count: Number(item.pull_count),
        })),
      );
      setSuitTrend(
        data.suit_trend.map((item: any) => ({
          ...item,
          cups: Number(item.cups),
          major: Number(item.major),
          month_num: Number(item.month_num),
          pentacles: Number(item.pentacles),
          swords: Number(item.swords),
          wands: Number(item.wands),
          year: Number(item.year),
        })),
      );
    });
  }, [currentUser]);

  // console.log("current user", currentUser);
  // console.log("summary stats", summaryStats);
  // console.log("most pulled", mostPulled);
  // console.log("suit trend", suitTrend);

  //null guards
  if (!currentUser || !summaryStats || !mostPulled || !suitTrend) return null; //prevents form from flashing while auth loads

  return (
    <div className={styles["analytics-page-container"]}>
      <div className={styles["stat-highlights-container"]}>
        <div className={styles["stat-highlight"]}>
          <p>total readings</p>
          <p>{summaryStats?.total_readings}</p>
          <p>[detail]</p>
        </div>
        <div className={styles["stat-highlight"]}>
          <p>unique cards seen</p>
          <p>{summaryStats?.unique_cards}</p>
          <p>{78 - Number(summaryStats?.unique_cards)} unseen</p>
        </div>
        <div className={styles["stat-highlight"]}>
          <p>major arcana share</p>
          <p>{summaryStats?.major_arcana_pct}/78</p>
          <p>[detail]</p>
        </div>
        <div className={styles["stat-highlight"]}>
          <p>avg pulls/week</p>
          <p>{summaryStats?.avg_per_week}</p>
          <p>all time</p>
        </div>
      </div>
      <div className={styles["card-search-container"]}>
        <h3>cards search</h3>
        <p>instructions</p>
        <div className={styles["search-container"]}>
          <input type="text" />
          <button className={"search-filter-btn"}>1 week</button>
          <button className={"search-filter-btn"}>30 days</button>
          <button className={"search-filter-btn"}>90 days</button>
          <button className={"search-filter-btn"}>all time</button>
        </div>
        <div className={styles["searched-card-container"]}>
          <h2>[card name]</h2>
          <p>[tag: major/minor arcana]</p>
        </div>
        <div className={styles["searched-card-stats-container"]}>
          <div className={styles["searched-card-stat"]}>
            <p>pulled</p>
            <p>[number of times pulled]</p>
            <p>[time period]</p>
          </div>
          <div className={styles["searched-card-stat"]}>
            <p>reversed</p>
            <p>[percentage]</p>
            <p>[of all pulls]</p>
          </div>
          <div className={styles["searched-card-stat"]}>
            <p>notes logged</p>
            <p>[number]</p>
            <p>[readings with notes]</p>
          </div>
        </div>
        <div className={styles["frequency-graph-container"]}>
          {/* insert recharts component */}
        </div>
        <div className={styles["reading-notes-container"]}>
          <div className={styles["reading-note-card"]}>
            <div className={styles["reading-note-headers"]}>
              <p>[date]</p>
              <p>[spread-type]</p>
            </div>
            <p className={styles["card-position"]}>position:[position]</p>
            <p className={styles["reading-note"]}>[note]</p>
          </div>
          <div className={styles["reading-note-card"]}>
            <div className={styles["reading-note-headers"]}>
              <p>[date]</p>
              <p>[spread-type]</p>
            </div>
            <p className={styles["card-position"]}>position:[position]</p>
            <p className={styles["reading-note"]}>[note]</p>
          </div>
          <div className={styles["reading-note-card"]}>
            <div className={styles["reading-note-headers"]}>
              <p>[date]</p>
              <p>[spread-type]</p>
            </div>
            <p className={styles["card-position"]}>position:[position]</p>
            <p className={styles["reading-note"]}>[note]</p>
          </div>
          <div className={styles["reading-note-card"]}>
            <div className={styles["reading-note-headers"]}>
              <p>[date]</p>
              <p>[spread-type]</p>
            </div>
            <p className={styles["card-position"]}>position:[position]</p>
            <p className={styles["reading-note"]}>[note]</p>
          </div>
        </div>
        <div className={styles["charts"]}>
          <div
            className={styles["most-pulled-cards-container"]}
            // style={{ width: "500px", height: "300px", border: "1px solid red" }}
          >
            <h3>Most pulled cards</h3>
            <p>by total pull count</p>
            <MostPulledCardsChart mostPulled={mostPulled} />
          </div>
          <div className={styles["suit-trend-container"]}>
            <h3>Suit trend</h3>
            <p>share of pulls</p>
            <SuitTrendChart suitTrend={suitTrend} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
