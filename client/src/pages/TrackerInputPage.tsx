//react imports
import { useState } from "react";
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
//styling
import styles from "./css/TrackerInputPage.module.css";

const TrackerInputPage = () => {
  //state variables
  const [date, setDate] = useState<string>("");
  const [readingTopic, setReadingTopic] = useState<string>("card-of-day");
  const [customReadingTopic, setCustomReadingTopic] = useState<string>("");
  const [readingSpread, setReadingSpread] = useState<string>("top-bottom");
  const [customReadingSpread, setCustomReadingSpread] = useState<string>("");
  const [inputtedCards, setInputtedCards] = useState<string[]>([""]);
  const [pulledCards, setPulledCards] = useState<string[]>([""]);
  const [notes, setNotes] = useState<string>("");
  const [interpretation, setInterpretation] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [isManual, setIsManual] = useState<boolean>(false);
  const [isCardsPulled, setIsCardsPulled] = useState<boolean>(false);

  //functions
  const pullCards = async () => {
    try {
      setIsCardsPulled(true);
      if (readingSpread === "custom") {
        console.log("custom");
      } else {
        const numberOfCards = spreadConfig[readingSpread].length;
        const randomSequence = await getRandomSequence(numberOfCards);
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

  const renderCardImages = (card: string, index: number) => {
    const { positions, cardWidth } = spreadPositions[readingSpread];
    const position = positions[pulledCards.indexOf(card)];
    if (!position) return null; //skip any card without a valid position
    const { x, y, rotation, labelOffset } = position;
    const cardImagePath = getCardImagePath(card);
    let cardRotation = rotation;
    const labelRotation = cardRotation;
    if (card.includes("rx")) cardRotation += 180;
    const spreadType = readingSpread;

    const labelStyle = labelOffset
      ? {
          position: "absolute" as const,
          left: `${labelOffset.x}%`,
          top: `${labelOffset.y}%`,
          transform: `rotate(${labelRotation}deg)`,
        }
      : { transform: `rotate(${labelRotation}deg)` };

    return (
      <>
        <div
          className={styles["card-image-container"]}
          style={{
            position: "absolute",
            left: `${x}%`,
            top: `${y}%`,
            width: `${cardWidth}%`,
            // transform: `rotate(${cardRotation}deg)`,
          }}
        >
          <img
            className={styles["card-image"]}
            src={`${cardImagePath}`}
            style={{
              //style is a React prop that accepts a JS object which is y it need 2 brackets
              transform: `rotate(${cardRotation}deg)`,
              width: `100%`,
            }}
          ></img>
          <p className={styles["card-label"]} style={labelStyle}>
            {spreadConfig[spreadType][index]}
          </p>
        </div>
      </>
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
    setSaving(true);

    const readingRequestObj = {
      reading_date: date,
      reading_topic:
        readingTopic === "custom" ? customReadingTopic : readingTopic,
      spread_type:
        readingSpread === "custom" ? customReadingSpread : readingSpread,
      notes: notes,
      interpretation: interpretation,
    };

    try {
      const newReading = await createReading(readingRequestObj);
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
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong"; //checks if error is an error object, if it is we can access the error message, if not itll say 'Unknown error' since we dont know what was thrown. typescript doesn't know what's thrown, anything can eb thrown so we gotta make sure it's an error object
      setMessage(message);
    } finally {
      setSaving(false);
    }
  };

  console.log("Manual", isManual);
  console.log("cards pulled", isCardsPulled);

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
              value={interpretation}
              placeholder="interpretation"
              onChange={(e) => setInterpretation(e.target.value)}
            />
          </div>
          <div>
            <button
              className={styles["save-reading-btn"]}
              onClick={saveReading}
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
    </div>
  );
};

export default TrackerInputPage;
