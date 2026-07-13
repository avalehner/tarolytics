//react imports
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
//service functions
import {
  getNonSearchData,
  getCardSearchData,
} from "../services/analyticsService";
//components
import MostPulledCardsChart from "../components/MostPulledChart";
//types
import type {
  UserTypes,
  MostPulledTypes,
  SummaryStatsTypes,
  SuitTrendTypes,
  CardSearchTypes,
  CardSearchNotesTypes,
  PullsPerMonthTypes,
  MonthlyPullEntryType,
} from "../types";
//styles
import styles from "./css/AnalyticsPage.module.css";
import SuitTrendChart from "../components/SuitTrendChart";
import tarotCards from "../data/tarotCards";
import MonthlyFrequencyChart from "../components/MonthlyFrequencyChart";

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
  const [showDropdown, setShowDropdown] = useState(false);
  const [cardSearchInput, setCardSearchInput] = useState<string>("");
  const [timePeriodInput, setTimePeriodInput] = useState<number | null>(null);
  const [cardSearchResults, setCardSearchResults] =
    useState<CardSearchTypes | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  //useEffects
  useEffect(() => {
    if (isAuthLoading) return;
    if (!currentUser) navigate("/login");
  }, [currentUser, isAuthLoading]);

  useEffect(() => {
    if (!currentUser) return;
    getNonSearchData().then((data) => {
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

  useEffect(() => {
    const handleClickOutsideDropdown = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current?.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutsideDropdown);

    //removes event listener when the component unmounts, every useeffect that adds a global event listener needs a cleanup function
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideDropdown);
    };
  }, []); //empty array: runs once on mount

  const handleCardSearch = async (
    cardName: string,
    timePeriod: number | null,
  ) => {
    if (!cardSearchInput) return;
    const data = await getCardSearchData(cardName, timePeriod);
    setCardSearchResults(data);
  };

  const renderReadingNotes = (notes: CardSearchNotesTypes[]) => {
    return notes.map((note, index) => {
      return (
        <div key={index} className={styles["reading-note-card"]}>
          <div className={styles["reading-note-headers"]}>
            <p>{note.date}</p>
            <p>{note.spread_type}</p>
          </div>
          <p className={styles["card-position"]}>
            position: {note.position_name}
          </p>
          <p className={styles["reading-note"]}>{note.notes}</p>
        </div>
      );
    });
  };

  const getPullsByMonth = (
    notes: CardSearchNotesTypes[],
  ): MonthlyPullEntryType[] => {
    if (!notes) return [];

    const pullsByMonthObj = notes.reduce<PullsPerMonthTypes>(
      (results, currentReading) => {
        const month = currentReading.date.substring(0, 7);
        results[month] = (results[month] || 0) + 1;
        return results;
      },
      {},
    ); //{} is the initial value of the accumulator (results)

    return Object.entries(pullsByMonthObj).map(([month, pulls]) => ({
      month,
      pulls,
    }));
  };

  // const getPullsByMonthArr = () => {
  //   const pullsByMonthObj = getPullsByMonth(cardSearchResults.reading_notes);

  //   const chartData: ChartDataPoint[] = Object.entries(pullsByMonthObj).map(
  //     ([month, count]) => ({
  //       month, // e.g., "2026-05"
  //       pulls: count, // e.g., 3
  //     }),
  //   );
  // };

  const filteredCards = tarotCards
    .slice(0, 78)
    .filter((card) =>
      card.toLowerCase().includes(cardSearchInput.toLowerCase()),
    );

  // console.log("current user", currentUser);
  // console.log("summary stats", summaryStats);
  // console.log("most pulled", mostPulled);
  // console.log("suit trend", suitTrend);
  console.log("card search results", cardSearchResults);
  if (cardSearchResults?.reading_notes) {
    console.log(typeof getPullsByMonth(cardSearchResults.reading_notes));
  }

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
        <div ref={dropdownRef} className={styles["search-container"]}>
          <div className={styles["search-dropdown"]}>
            <input
              type="text"
              value={cardSearchInput}
              onChange={(e) => {
                setCardSearchInput(e.target.value);
                setShowDropdown(true);
              }}
              className={styles["search-input"]}
            />
            {showDropdown && filteredCards.length > 0 && (
              <ul
                style={{
                  position: "absolute",
                  background: "white",
                  listStyle: "none",
                  margin: "0",
                }}
              >
                {filteredCards.map((card) => (
                  <li
                    key={card}
                    onClick={() => {
                      setCardSearchInput(card);
                      setShowDropdown(false);
                    }}
                  >
                    {card}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className={styles["search-btns-container"]}>
            <button
              className={"search-filter-btn"}
              onClick={() => setTimePeriodInput(7)}
            >
              1 week
            </button>
            <button
              className={"search-filter-btn"}
              onClick={() => setTimePeriodInput(30)}
            >
              30 days
            </button>
            <button
              className={"search-filter-btn"}
              onClick={() => setTimePeriodInput(90)}
            >
              90 days
            </button>
            <button
              className={"search-filter-btn"}
              onClick={() => setTimePeriodInput(null)}
            >
              all time
            </button>
            <button
              className={"search-filter-btn"}
              onClick={() => handleCardSearch(cardSearchInput, timePeriodInput)}
            >
              search
            </button>
          </div>
        </div>
        <div className={styles["searched-card-container"]}>
          <h2>{cardSearchInput}</h2>
          <p>{cardSearchResults?.suit ? "minor arcana" : "major arcana"}</p>
        </div>
        <div className={styles["searched-card-stats-container"]}>
          <div className={styles["searched-card-stat"]}>
            <p>pulled</p>
            <p>{cardSearchResults?.total_pulls}</p>
            <p>{timePeriodInput ? timePeriodInput : "all time"}</p>
          </div>
          <div className={styles["searched-card-stat"]}>
            <p>reversed</p>
            <p>{cardSearchResults?.reversed_pulls}</p>
            <p>{cardSearchResults?.reversed_pct}% of all pulls</p>
          </div>
          <div className={styles["searched-card-stat"]}>
            <p>notes logged</p>
            <p>{cardSearchResults?.reading_notes?.length}</p>
            <p>readings with notes</p>
          </div>
        </div>
        <div className={styles["frequency-graph-container"]}>
          {cardSearchResults?.reading_notes && (
            <MonthlyFrequencyChart
              data={getPullsByMonth(cardSearchResults.reading_notes)}
            />
          )}
          <div>this is where the freqeuency graph goes</div>
        </div>
        <div className={styles["reading-notes-container"]}>
          {renderReadingNotes(cardSearchResults?.reading_notes ?? [])}
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
