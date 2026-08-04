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
            <p className={styles["spread-type-tag"]}>{note.spread_type}</p>
          </div>
          <p className={styles["card-position"]}>
            Position: {note.position_name}
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
  // console.log("card search results", cardSearchResults);
  // if (cardSearchResults?.reading_notes) {
  //   console.log(typeof getPullsByMonth(cardSearchResults.reading_notes));
  // }

  //null guards
  if (!currentUser || !summaryStats || !mostPulled || !suitTrend) return null; //prevents form from flashing while auth loads

  return (
    <div className={styles["analytics-page-container"]}>
      <p className={styles["analytics-page-title"]}>Analytics</p>
      <div className={styles["stat-highlights-container"]}>
        <div className={styles["stat-highlight-card"]}>
          <p className={styles["stat-title"]}>total readings</p>
          <p className={styles["stat"]}>{summaryStats?.total_readings}</p>
          <p className={styles["stat-detail"]}>[detail]</p>
        </div>
        <div className={styles["stat-highlight-card"]}>
          <p className={styles["stat-title"]}>unique cards seen</p>
          <p className={styles["stat"]}>{summaryStats?.unique_cards}</p>
          <p className={styles["stat-detail"]}>
            {78 - Number(summaryStats?.unique_cards)} unseen
          </p>
        </div>
        <div className={styles["stat-highlight-card"]}>
          <p className={styles["stat-title"]}>major arcana share</p>
          <p className={styles["stat"]}>{summaryStats?.major_arcana_pct}/78</p>
          <p className={styles["stat-detail"]}>[detail]</p>
        </div>
        <div className={styles["stat-highlight-card"]}>
          <p className={styles["stat-title"]}>avg pulls/week</p>
          <p className={styles["stat"]}>{summaryStats?.avg_per_week}</p>
          <p className={styles["stat-detail"]}>all time</p>
        </div>
      </div>
      <div className={styles["card-search-container"]}>
        <h3 className={styles["search-title"]}>Search</h3>
        <div ref={dropdownRef} className={styles["search-container"]}>
          <div className={styles["search-dropdown"]}>
            <input
              type="text"
              placeholder="enter card..."
              value={cardSearchInput}
              onChange={(e) => {
                setCardSearchInput(e.target.value);
                setShowDropdown(true);
              }}
              className={styles["search-input"]}
            />
            {showDropdown && filteredCards.length > 0 && (
              <ul className={styles["search-dropdown-list"]}>
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
              className={styles["search-filter-btn"]}
              onClick={() => setTimePeriodInput(7)}
            >
              1 WEEK
            </button>
            <button
              className={styles["search-filter-btn"]}
              onClick={() => setTimePeriodInput(30)}
            >
              1 MONTH
            </button>
            <button
              className={styles["search-filter-btn"]}
              onClick={() => setTimePeriodInput(90)}
            >
              3 MONTHS
            </button>
            <button
              className={styles["search-filter-btn"]}
              onClick={() => setTimePeriodInput(null)}
            >
              ALL TIME
            </button>
            <button
              className={styles["search-btn"]}
              onClick={() => handleCardSearch(cardSearchInput, timePeriodInput)}
            >
              SEARCH
            </button>
          </div>
        </div>
        {cardSearchResults && (
          <div className={styles["card-search-results"]}>
            <div className={styles["searched-card-container"]}>
              <h2 className={styles["searched-card"]}>{cardSearchInput}</h2>
              <p className={styles["card-suit"]}>
                {cardSearchResults?.suit ? "minor arcana" : "major arcana"}
              </p>
            </div>
            <div className={styles["searched-card-stats-container"]}>
              <div className={styles["searched-card-stat-container"]}>
                <p>Pulled</p>
                <p className={styles["searched-stat"]}>
                  {cardSearchResults?.total_pulls}
                </p>
                <p className={styles["searched-stat-detail"]}>
                  {timePeriodInput ? timePeriodInput : "all time"}
                </p>
              </div>
              <div className={styles["searched-card-stat-container"]}>
                <p>Reversed</p>
                <p className={styles["searched-stat"]}>
                  {cardSearchResults?.reversed_pulls}
                </p>
                <p className={styles["searched-stat-detail"]}>
                  {cardSearchResults?.reversed_pct}% of all pulls
                </p>
              </div>
              <div className={styles["searched-card-stat-container"]}>
                <p>Notes logged</p>
                <p className={styles["searched-stat"]}>
                  {cardSearchResults?.reading_notes?.length}
                </p>
                <p className={styles["searched-stat-detail"]}>
                  readings with notes
                </p>
              </div>
            </div>
            <p className={styles["monthly-frequency-title"]}>
              Monthly Frequency
            </p>
            <div className={styles["frequency-graph-container"]}>
              {cardSearchResults?.reading_notes && (
                <MonthlyFrequencyChart
                  data={getPullsByMonth(cardSearchResults.reading_notes)}
                />
              )}
            </div>
            <p className={styles["reading-notes-title"]}>Reading Notes</p>
            <div className={styles["reading-notes-container"]}>
              {renderReadingNotes(cardSearchResults?.reading_notes ?? [])}
            </div>
          </div>
        )}
      </div>
      <div className={styles["charts"]}>
        <div className={styles["most-pulled-cards-container"]}>
          <h3 className={styles["chart-title"]}>Most pulled cards</h3>
          <p className={styles["chart-subtitle"]}>by total pull count</p>
          <div className={styles["chart-container"]}>
            <MostPulledCardsChart mostPulled={mostPulled} />
          </div>
        </div>
        <div className={styles["suit-trend-container"]}>
          <h3 className={styles["chart-title"]}>Suit trend</h3>
          <p className={styles["chart-subtitle"]}>share of pulls</p>
          <div className={styles["chart-container"]}>
            <SuitTrendChart suitTrend={suitTrend} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
