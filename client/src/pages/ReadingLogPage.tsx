import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./css/ReadingLogPage.module.css";
import SearchMenu from "../components/SearchMenu";
import DatePicker from "../components/DatePicker";
import ReadingTopicMenu from "../components/ReadingTopicMenu";
import ReadingSpreadMenu from "../components/ReadingSpreadMenu";
import CardInput from "../components/CardInput";
import {
  // getAllReadings,
  getReadingsByUserId,
} from "../services/readingService";
import { getAllCards } from "../services/cardsService";
import type { ReadingWithCardTypes, CardTypes, UserTypes } from "../types";
import ReadingLog from "../components/ReadingLog";
import { Fragment } from "react";

interface ReadingLogPageProps {
  currentUser: UserTypes | null;
  isAuthLoading: boolean;
}

const ReadingLogPage = ({
  currentUser,
  isAuthLoading,
}: ReadingLogPageProps) => {
  const [searchCategory, setSearchCategory] = useState<string>("all");
  const [date, setDate] = useState<Date | null>(null);
  const [readingTopic, setReadingTopic] = useState<string>("card-of-day");
  const [customReadingTopic, setCustomReadingTopic] = useState<string>("");
  const [readingSpread, setReadingSpread] = useState<string>("top-bottom");
  const [customReadingSpread, setCustomReadingSpread] = useState<string>("");
  // const [allCards, setCards] = useState<string[]>([]);
  const [searchCards, setSearchCards] = useState<string[]>([""]);
  const [readings, setReadings] = useState<ReadingWithCardTypes[]>([]);
  const navigate = useNavigate();

  //useEffects
  useEffect(() => {
    if (isAuthLoading) return;
    if (!currentUser) navigate("/login");
  }, [currentUser, isAuthLoading]);

  useEffect(() => {
    if (!currentUser) return;
    // getAllReadi ngs().then((data) => setReadings(data)); // use .then as an alternative to await bc useeffect cant be async and await needs an async wrapper

    // getAllCards().then((data) => setCards(data));
    getReadingsByUserId(currentUser.id).then((data) => setReadings(data));
  }, [currentUser]); //[] tells react to only run the effect once on initial mount

  const handleRemoveCard = (indexToRemove: number) => {
    setSearchCards(searchCards.filter((_, index) => index !== indexToRemove));
  };

  const getFilteredReadings = () => {
    switch (searchCategory) {
      case "date":
        if (!date) return readings;
        return readings.filter(
          (reading) =>
            reading.reading_date.slice(0, 10) ===
            date.toLocaleDateString("en-CA"), //uses the browsers system timezone automatically
        );
      case "reading-topic":
        if (!readingTopic) return readings;
        return readings.filter(
          (reading) => reading.reading_topic === readingTopic,
        );
      case "spread-type":
        if (!readingSpread) return readings;
        return readings.filter(
          (reading) => reading.spread_type === readingSpread,
        );
      case "cards":
        const activeSearchCards = searchCards.filter(
          (searchCard) => searchCard != "",
        ); //strips out default empty string
        if (activeSearchCards.length === 0) return readings; //shows readings if no search cards selected
        return readings.filter((reading) => {
          // const readingCards = allCards.filter(
          //   (card) => card.reading_id === reading.id,
          // ); //cards in current reading
          return activeSearchCards.some((searchCard) =>
            reading.card_names?.includes(searchCard),
          ); //.some() searches for an item in the array that matches the condition, as soon as it finds one it returns true, if it doesnt it returns false
          //outer .some() loops through ALL active search cards, grabs one and compares to the readingCards. need the outer loop or else we wouldnt be able to grab one search card at a time
          //use .some() because we don't need to check them all, only need ot check until one returns true
        });
      case "all":
        return readings;
      default:
        return readings;
    }
  };

  const renderReadingLogs = () => {
    const filteredReadings = getFilteredReadings();
    const readingsList = filteredReadings.map((reading, index) => {
      if (index < filteredReadings.length - 1) {
        return (
          <Fragment key={index}>
            <ReadingLog reading={reading} />
            <hr className={styles["log-divider"]} />
          </Fragment>
        );
      } else {
        return (
          <Fragment key={index}>
            <ReadingLog
              reading={reading}
              // cards={allCards.filter((card) => card.reading_id === reading.id)}
            />
          </Fragment>
        );
      }
    });
    return readingsList;
  };

  //null guards
  if (!currentUser) return null; //prevents form from flashing while auth loads

  console.log(readings);

  return (
    <div className={styles["reading-log-page-container"]}>
      <h1 className={styles["title"]}>Tarolytics</h1>
      <div className={styles["search-bar-container"]}>
        <p className={styles["search-label"]}>search by:</p>
        <SearchMenu
          searchCategory={searchCategory}
          setSearchCategory={setSearchCategory}
        />
        {searchCategory === "date" && (
          <DatePicker date={date} setDate={setDate} />
        )}
        {searchCategory === "reading-topic" && (
          <ReadingTopicMenu
            readingTopic={readingTopic}
            setReadingTopic={setReadingTopic}
            customReadingTopic={customReadingTopic}
            setCustomReadingTopic={setCustomReadingTopic}
          />
        )}
        {searchCategory === "spread-type" && (
          <ReadingSpreadMenu
            readingSpread={readingSpread}
            setReadingSpread={setReadingSpread}
            customReadingSpread={customReadingSpread}
            setCustomReadingSpread={setCustomReadingSpread}
          />
        )}
        {searchCategory === "cards" && (
          <button
            className={styles["add-card-btn"]}
            onClick={() => setSearchCards([...searchCards, ""])}
          >
            ADD CARD
          </button>
        )}
      </div>
      {searchCategory === "cards" && (
        <>
          <div className={styles["all-card-inputs-container"]}>
            {searchCards.map((_, index) => (
              <div key={index} className={styles["search-card-input-wrapper"]}>
                <CardInput
                  cards={searchCards}
                  setCards={setSearchCards}
                  label="select card"
                  index={index}
                />
                <i
                  className="fa-regular fa-x"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleRemoveCard(index)}
                ></i>
              </div>
            ))}
          </div>
        </>
      )}
      <div className={styles["reading-log-labels"]}>
        <p>DATE</p>
        <p>TOPIC</p>
        <p>SPREAD</p>
        <p>CARDS</p>
        <p>NOTES</p>
        <p>INTERPRETATION</p>
        <p>AI INTERPRETATION</p>
      </div>
      <div className={styles["reading-log-container"]}>
        {renderReadingLogs()}
      </div>
    </div>
  );
};

export default ReadingLogPage;
