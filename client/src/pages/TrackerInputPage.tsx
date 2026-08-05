//react imports
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
//function imports
import { createReading } from "../services/readingService";
import { saveCards } from "../services/cardsService";
import { getRandomSequence } from "../services/randomService";
import { getCardImagePath } from "../util";
//component imports
import DatePicker from "../components/DatePicker";
import ReadingTopicMenu from "../components/ReadingTopicMenu";
import ReadingSpreadMenu from "../components/ReadingSpreadMenu";
import CardInput from "../components/CardInput";
//data imports
import spreadConfig from "../data/spreadConfig";
import tarotCards from "../data/tarotCards";
import spreadPositions from "../data/spreadPositions";
//types
import { ReadingTypes, UserTypes } from "../types";
//styling
import styles from "./css/TrackerInputPage.module.css";

interface TrackerInputPageProps {
  currentUser: UserTypes | null;
  isAuthLoading: boolean;
}

const TrackerInputPage = ({
  currentUser,
  isAuthLoading,
}: TrackerInputPageProps) => {
  //state variables
  const [date, setDate] = useState<Date | null>(null);
  const [readingTopic, setReadingTopic] = useState<string>("card-of-day");
  const [customReadingTopic, setCustomReadingTopic] = useState<string>("");
  const [readingSpread, setReadingSpread] = useState<string>("top-bottom");
  const [customReadingSpread, setCustomReadingSpread] = useState<string>("");
  const [inputtedCards, setInputtedCards] = useState<string[]>([""]);
  const [pulledCards, setPulledCards] = useState<string[]>([""]);
  const [notes, setNotes] = useState<string>("");
  const [userInterpretation, setUserInterpretation] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [savedReadingData, setSavedReadingData] = useState<ReadingTypes | null>(
    null,
  );
  const [message, setMessage] = useState<string>("");
  const [isManual, setIsManual] = useState<boolean>(false);
  const [isCardsPulled, setIsCardsPulled] = useState<boolean>(false);
  const [isReversals, setIsReversals] = useState<boolean>(false);
  const [viewReadingModal, setViewReadingModal] = useState<boolean>(false);
  const navigate = useNavigate();

  //useEffects
  useEffect(() => {
    if (isAuthLoading) return;
    if (!currentUser) navigate("/login");
  }, [currentUser, isAuthLoading]);

  //functions
  const pullCards = async () => {
    try {
      setIsCardsPulled(true);
      if (readingSpread === "custom") {
        console.log("custom");
      } else {
        const numberOfCards = spreadConfig[readingSpread].length;
        const randomSequence = await getRandomSequence(
          numberOfCards,
          isReversals,
        );
        console.log(randomSequence.length);
        const cardNames = randomSequence.map(
          (number) => tarotCards[number - 1],
        );
        setPulledCards(cardNames);
        console.log("pulled cards", cardNames);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown Error";
      console.error(message);
    }
  };

  const renderCardImagesV2 = (card: string, index: number) => {
    const { positions } = spreadPositions[readingSpread];
    const cardImagePath = getCardImagePath(card);
    const position = positions[pulledCards.indexOf(card)];
    if (!position) return null; //skip any card without a valid position
    const { rotation } = position;
    let cardRotation = rotation;
    if (card.includes("rx")) cardRotation += 180;
    if (cardRotation === 90) cardRotation -= 90;
    const spreadType = readingSpread;
    return (
      <div className={styles["card-image-container"]}>
        <img
          className={styles["card-image"]}
          src={`${cardImagePath}`}
          style={{
            //style is a React prop that accepts a JS object which is y it need 2 brackets
            transform: `rotate(${cardRotation}deg)`,
            width: `100%`,
          }}
        ></img>
        <p className={styles["card-label"]}>
          {spreadConfig[spreadType][index]}
        </p>
      </div>
    );
  };

  const renderCardInputs = (readingSpread: string) => {
    const labels = spreadConfig[readingSpread] || [];

    const handleAddCard = () => setInputtedCards([...inputtedCards, ""]);

    const handleRemoveCard = (indexToRemove: number) => {
      setInputtedCards(
        inputtedCards.filter((_, index) => index !== indexToRemove),
      );
    };

    if (readingSpread === "custom") {
      return (
        <>
          <button
            className={styles["add-card-btn"]}
            onClick={() => handleAddCard()}
          >
            ADD CARD
          </button>
          <div className={styles["all-card-inputs-container"]}>
            {inputtedCards.map((_, index) => (
              <div key={index} className={styles["card-input-container"]}>
                <CardInput
                  cards={inputtedCards}
                  setCards={setInputtedCards}
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
      );
    }

    return (
      <div className={styles["all-card-inputs-container"]}>
        {labels.map((label, index) => (
          <CardInput
            cards={inputtedCards}
            setCards={setInputtedCards}
            label={label}
            index={index}
            key={index}
          />
        ))}
      </div>
    );
  };

  const saveReading = async () => {
    const activeCards = inputtedCards.filter((card) => card !== "");

    //null guard for currentUser date (fixes possibly null type errors)
    if (!currentUser) return;
    if (!date) {
      setMessage("please select a date");
      return;
    } else if (!notes) {
      setMessage("please input your notes");
      return;
    } else if (!userInterpretation) {
      setMessage("please input your interpretation");
      return;
    }

    if (isManual) {
      const allPositionsFilled = spreadConfig[readingSpread].every(
        (_, index) => inputtedCards[index] && inputtedCards[index] !== "",
      );
      if (!allPositionsFilled) {
        setMessage("please select a card for every position in the spread");
        return;
      }
    } else {
      const activeCards = inputtedCards.filter((card) => card !== "");
      if (activeCards.length === 0) {
        setMessage("please select your cards");
        return;
      }
    }

    setSaving(true);

    const readingRequestObj = {
      user_id: currentUser.id,
      reading_date: date?.toISOString() ?? null, //converts
      reading_topic:
        readingTopic === "custom" ? customReadingTopic : readingTopic,
      spread_type:
        readingSpread === "custom" ? customReadingSpread : readingSpread,
      notes: notes,
      user_interpretation: userInterpretation,
    };

    try {
      const newReading = await createReading(readingRequestObj);
      setSavedReadingData(newReading);
      //card.entries() returns an iterator of [index, value] pairs for ebery element in the array ex: ['0', 'The Fool']
      //destructures so that you have botht he position and card name available
      if (isManual) {
        for (const [index, card] of inputtedCards.entries()) {
          const cardRequestObj = {
            reading_id: newReading.id,
            card_name: card,
            position_name:
              readingSpread === "custom"
                ? null
                : spreadConfig[readingSpread][index],
            position_order: index,
          };
          await saveCards(cardRequestObj);
        }
      }

      if (isCardsPulled) {
        for (const [index, card] of pulledCards.entries()) {
          const cardRequestObj = {
            reading_id: newReading.id,
            card_name: card,
            position_name: spreadConfig[readingSpread][index],
            position_order: index,
          };
          await saveCards(cardRequestObj);
        }
      }

      setMessage("reading saved :)");
      setViewReadingModal(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong"; //checks if error is an error object, if it is we can access the error message, if not itll say 'Unknown error' since we dont know what was thrown. typescript doesn't know what's thrown, anything can eb thrown so we gotta make sure it's an error object
      setMessage(message);
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = () => {
    setDate(null);
    setReadingTopic("card-of-day");
    setCustomReadingTopic("");
    setReadingSpread("top-bottom");
    setCustomReadingSpread("");
    setInputtedCards([""]);
    setPulledCards([""]);
    setNotes("");
    setUserInterpretation("");
    setSaving(false);
    setIsManual(false);
    setMessage("");
    setIsCardsPulled(false);
  };

  //null guards
  if (!currentUser) return null; //prevents form from flashing while auth loads

  console.log("inputted cards", inputtedCards);

  return (
    <div className={styles["tracker-input-page-container"]}>
      <h1 className={styles["title"]}>Tarolytics</h1>
      <DatePicker date={date} setDate={setDate} />
      <div className={styles["reading-topic-menu-container"]}>
        <p className={styles["topic-label"]}>topic:</p>
        <ReadingTopicMenu
          readingTopic={readingTopic}
          setReadingTopic={setReadingTopic}
          customReadingTopic={customReadingTopic}
          setCustomReadingTopic={setCustomReadingTopic}
        />
      </div>
      <div className={styles["reading-topic-menu-container"]}>
        <p className={styles["spread-label"]}>spread:</p>
        <ReadingSpreadMenu
          readingSpread={readingSpread}
          setReadingSpread={setReadingSpread}
          customReadingSpread={customReadingSpread}
          setCustomReadingSpread={setCustomReadingSpread}
          setCards={setInputtedCards}
          isDisabled={isCardsPulled}
        />
      </div>
      {!isManual && !isCardsPulled && (
        <div>
          <div className={styles["toggle-container"]}>
            <label className={styles["toggle"]}>
              <span className={styles["toggle-label"]}>no reversals</span>
              <input
                type="checkbox"
                checked={isReversals}
                onChange={(e) => setIsReversals(e.target.checked)}
                className={styles["toggle-input"]}
              />
              <span className={styles["toggle-slider"]} />
              <span className={styles["toggle-label"]}>reversals</span>
            </label>
          </div>
          <button
            className={styles["save-reading-btn"]}
            onClick={() => setIsManual(true)}
          >
            ENTER MANUALLY
          </button>
          <button className={styles["save-reading-btn"]} onClick={pullCards}>
            PULL CARDS
          </button>
          {/* <button className={styles["upload-picture-btn"]}>
            UPLOAD PICTURE
          </button> */}
        </div>
      )}

      {/* manual input logic */}
      {isManual && renderCardInputs(readingSpread)}

      {(isManual || isCardsPulled) && ( //wrapping in parenthesis for order of operations issue (&& stronger than ||)
        <>
          <div className={styles["reading-notes"]}>
            <input
              type="text"
              value={notes}
              placeholder="notes"
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className={styles["reading-notes"]}>
            <input
              type="text"
              value={userInterpretation}
              placeholder="interpretation"
              onChange={(e) => setUserInterpretation(e.target.value)}
            />
          </div>
          <div>
            <button
              className={styles["save-reading-btn"]}
              onClick={async () => {
                await saveReading(); //making sure the reading has been saved before showing the modal
                // setViewReadingModal(true);
              }}
              disabled={saving}
            >
              {saving ? "Saving..." : "SAVE READING"}
            </button>
            {/* <button className={styles["upload-picture-btn"]}>
            UPLOAD PICTURE
          </button> */}
            {message && <p>{message}</p>}
          </div>
          {/* pull cards logic */}
          {isCardsPulled && (
            <div className={styles["spread-display-container"]}>
              {pulledCards.map((card, index) =>
                renderCardImagesV2(card, index),
              )}
            </div>
          )}
          {/* {isCardsPulled && readingSpread === 'celtic' 
            ? (
            <div className={styles["spread-display-container"]}>
              {pulledCards.map((card, index) => renderCardImages(card, index))}
            </div>) 
            : (<div className={styles["spread-display-container"]}>
              {pulledCards.map((card, index) => renderCardImagesV2(card, index))}
            </div>)   
          } */}
        </>
      )}
      {viewReadingModal && (
        <div className={styles["view-reading-modal"]}>
          <button
            className={styles["view-reading-btn"]}
            onClick={() =>
              savedReadingData && navigate(`/reading/${savedReadingData.id}`)
            }
          >
            VIEW READING
          </button>
          <button
            className={styles["submit-another-btn"]}
            onClick={() => {
              setViewReadingModal(false);
              handleRefresh();
            }}
          >
            SUBMIT ANOTHER
          </button>
        </div>
      )}
    </div>
  );
};

export default TrackerInputPage;
