import { useEffect } from "react";
import styles from "./css/AnalyticsPage.module.css";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { RechartsDevtools } from "@recharts/devtools";

const AnalyticsPage = () => {
  return (
    <div className={styles["analytics-page-container"]}>
      <div className={styles["stat-highlights-container"]}>
        <div className={styles["stat-highlight"]}>
          <p>total readings</p>
          <p>[number of readings]</p>
          <p>[detail]</p>
        </div>
        <div className={styles["stat-highlight"]}>
          <p>unique cards seen</p>
          <p>[number of unique cards]</p>
          <p>[detail]</p>
        </div>
        <div className={styles["stat-highlight"]}>
          <p>major arcana share</p>
          <p>[number of readings]</p>
          <p>[detail]</p>
        </div>
        <div className={styles["stat-highlight"]}>
          <p>avg pulls/week</p>
          <p>[number of readings]</p>
          <p>[detail]</p>
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
        <div>
          <div className={styles["most-pulled-cards-container"]}>
            {/* insert recharts component */}
          </div>
          <div className={styles["suit-trend-container"]}>
            {/* insert recharts component */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
