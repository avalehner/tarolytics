//react imports
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
//service functions
import {
  getNonSearchData,
  getCardSearchData,
} from "../services/analyticsService";
//util functions
import { formatDate } from "../util.ts";
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
  ReadingsPerMonthTypes,
} from "../types";
//styles
import styles from "./css/AnalyticsPage.module.css";
import SuitTrendChart from "../components/SuitTrendChart";
import { tarotCardNames } from "../data/tarotCards";
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
  const [readingsPerMonth, setReadingsPerMonth] = useState<
    ReadingsPerMonthTypes[] | null
  >(null);
  const [suitTrend, setSuitTrend] = useState<SuitTrendTypes[] | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [cardSearchInput, setCardSearchInput] = useState<string>("");
  const [currentSearchedCard, setCurrentSearchedCard] = useState<string>("");
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
      setReadingsPerMonth(data.readings_per_month);
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
        <div
          key={index}
          className={styles["reading-note-card"]}
          // onClick={() => navigate(`/reading/${note.reading_id}`)}
        >
          <div className={styles["reading-note-headers"]}>
            <p className={styles["reading-note-date"]}>
              {formatDate(note.date)}
            </p>
            <p className={styles["spread-type-tag"]}>{note.spread_type}</p>
          </div>
          <p className={styles["reading-note"]}>{note.notes}</p>
          <div className={styles["bottom-row-note"]}>
            <p className={styles["card-position"]}>{note.position_name}</p>
            <p
              onClick={() => navigate(`/reading/${note.reading_id}`)}
              className={styles["navigate-to-reading"]}
            >
              go to reading {">"}
            </p>
          </div>
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

  const getStatDetails = () => {
    if (!readingsPerMonth || readingsPerMonth.length < 2) return;
    const previousMonthsReadings = Number(
      readingsPerMonth[readingsPerMonth.length - 2].readings,
    );

    const currentMonthsReadings = Number(
      readingsPerMonth[readingsPerMonth.length - 1].readings,
    );

    const readingRate = previousMonthsReadings
      ? ((currentMonthsReadings / previousMonthsReadings) * 100).toFixed(0)
      : "0";
    const isReadingRatePositive = Number(readingRate) > 0 ? true : false;
    const unseenCards = 78 - Number(summaryStats?.unique_cards);
    const majorArcanaPercentage = (
      Number(summaryStats?.major_arcana_pct) - 28
    ).toFixed(0);
    const isMajorArcanaPercentagePositive =
      Number(majorArcanaPercentage) > 0 ? true : false;

    return {
      reading_rate: [readingRate, isReadingRatePositive],
      unseen_cards: unseenCards,
      major_arcana_percentage: [
        majorArcanaPercentage,
        isMajorArcanaPercentagePositive,
      ],
    };
  };

  const statDetails = getStatDetails();
  const filteredCards = tarotCardNames
    .slice(0, 78)
    .filter((card) =>
      card.toLowerCase().includes(cardSearchInput.toLowerCase()),
    );

  // console.log("readings", readingsPerMonth);
  // console.log("current user", currentUser);
  // console.log("summary stats", summaryStats);
  console.log("most pulled", mostPulled);
  console.log("suit trend", suitTrend);
  // console.log("card search results", cardSearchResults);
  // if (cardSearchResults?.reading_notes) {
  //   console.log(
  //     "pulls by month",
  //     getPullsByMonth(cardSearchResults.reading_notes),
  //   );
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
          <p className={styles["stat-detail"]}>
            {statDetails
              ? `${statDetails.reading_rate[1] ? "up " : "down "} ${statDetails.reading_rate[0]} % from last month`
              : "N/A - not enought data"}
          </p>
        </div>
        <div className={styles["stat-highlight-card"]}>
          <p className={styles["stat-title"]}>unique cards seen</p>
          <p className={styles["stat"]}>{summaryStats?.unique_cards}</p>
          <p className={styles["stat-detail"]}>
            {statDetails
              ? `${statDetails.unseen_cards} unseen`
              : "N/A - not enought data"}
          </p>
        </div>
        <div className={styles["stat-highlight-card"]}>
          <p className={styles["stat-title"]}>major arcana share</p>
          <p className={styles["stat"]}>
            {summaryStats.major_arcana_pct
              ? summaryStats.major_arcana_pct
              : "0"}
            %
          </p>
          <p className={styles["stat-detail"]}>
            {statDetails
              ? `${statDetails.major_arcana_percentage[0]}% ${statDetails.major_arcana_percentage[1] ? "above" : "below "} average`
              : "N/A - not enought data"}
            {/* {getStatDetails()?.major_arcana_percentage[0]}%{" "}
            {getStatDetails()?.major_arcana_percentage[1] ? "above " : "below "}{" "} */}
          </p>
        </div>
        <div className={styles["stat-highlight-card"]}>
          <p className={styles["stat-title"]}>avg pulls/week</p>
          <p className={styles["stat"]}>
            {summaryStats.avg_per_week ? summaryStats.avg_per_week : "0"}
          </p>
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
              className={`${styles["search-filter-btn"]} ${timePeriodInput === 7 ? styles["search-filter-btn-selected"] : ""}`}
              onClick={() => setTimePeriodInput(7)}
            >
              1 WEEK
            </button>
            <button
              className={`${styles["search-filter-btn"]} ${timePeriodInput === 30 ? styles["search-filter-btn-selected"] : ""}`}
              onClick={() => setTimePeriodInput(30)}
            >
              1 MONTH
            </button>
            <button
              className={`${styles["search-filter-btn"]} ${timePeriodInput === 90 ? styles["search-filter-btn-selected"] : ""}`}
              onClick={() => setTimePeriodInput(90)}
            >
              3 MONTHS
            </button>
            <button
              className={`${styles["search-filter-btn"]} ${timePeriodInput === null ? styles["search-filter-btn-selected"] : ""}`}
              onClick={() => setTimePeriodInput(null)}
            >
              ALL TIME
            </button>
            <button
              className={styles["search-btn"]}
              onClick={() => {
                handleCardSearch(cardSearchInput, timePeriodInput);
                setCurrentSearchedCard(cardSearchInput);
              }}
            >
              SEARCH
            </button>
          </div>
        </div>
        {cardSearchResults && (
          <div className={styles["card-search-results"]}>
            <div className={styles["searched-card-container"]}>
              <h2 className={styles["searched-card"]}>{currentSearchedCard}</h2>
              <p className={styles["card-suit"]}>
                {cardSearchResults?.suit ? "minor arcana" : "major arcana"}
              </p>
            </div>
            <div className={styles["searched-card-stats-container"]}>
              <div className={styles["searched-card-stat-container"]}>
                <p className={styles["searched-card-stat-label"]}>Pulled</p>
                <p className={styles["searched-stat"]}>
                  {cardSearchResults?.total_pulls}
                </p>
                <p className={styles["searched-stat-detail"]}>
                  {timePeriodInput ? timePeriodInput : "all time"}
                </p>
              </div>
              <div className={styles["searched-card-stat-container"]}>
                <p className={styles["searched-card-stat-label"]}>Reversed</p>
                <p className={styles["searched-stat"]}>
                  {cardSearchResults?.reversed_pulls}
                </p>
                <p className={styles["searched-stat-detail"]}>
                  {cardSearchResults?.reversed_pct}% of all pulls
                </p>
              </div>
              <div className={styles["searched-card-stat-container"]}>
                <p className={styles["searched-card-stat-label"]}>
                  Notes logged
                </p>
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
        {mostPulled.length > 0 && suitTrend.length > 0 ? (
          <>
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
          </>
        ) : (
          <p>
            Two graphs will display here showing your most pulled cards and the
            proportion of each suit you are pulling once you've entered a fewx
            readings. Click here to{" "}
            <a href="/" className={styles["enter-reading-link"]}>
              enter a reading.
            </a>
          </p>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
