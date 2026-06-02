import styles from "./css/ViewReadingPage.module.css";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import {
  getReadingById,
  updateReadingById,
  deletedReadingById,
  interpretReadingById,
} from "../services/readingService";
import { saveCards } from "../services/cardsService";
import { ReadingTypes, CardTypes } from "../types";
import { format } from "date-fns";
import { convertDayToWord } from "../util";
import { getCardsByReadingId } from "../services/cardsService";
import { getCardImagePath } from "../util";
import CardInput from "../components/CardInput";
import spreadPositions from "../data/spreadPositions";
import topicLabels from "../data/topicLabels";
import spreadLabels from "../data/spreadLabels";
import spreadConfig from "../data/spreadConfig";

const ViewReadingPage = () => {
  const navigate = useNavigate();
  const [reading, setReading] = useState<ReadingTypes | null>(null); //because this holds a single reading which is just an object, there is no way to represent an empty object so we have to write null
  const [cards, setCards] = useState<CardTypes[]>([]);
  const [addedCards, setAddedCards] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>("");
  const [userInterpretation, setUserInterpretation] = useState<string>("");
  const [AIInterpretation, setAIInterpretation] = useState<string>("");
  const [updating, setUpdating] = useState<boolean>(false);
  const [updateMessage, setUpdateMessage] = useState<string>("");
  const [updateModal, setUpdateModal] = useState<boolean>(false);
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [deleteMessage, setDeleteMessage] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  // const [isAIInterpretation, setIsAIInterpretation] = useState<boolean>(false);

  const { readingId } = useParams();

  useEffect(() => {
    if (!readingId) return; //makes sure readingId is not null
    getReadingById(readingId).then((data) => setReading(data));

    getCardsByReadingId(readingId).then((data) => setCards(data));
  }, [readingId]);

  if (!reading) return null; //makes sure reading is not null

  const formatDate = (date: string) => {
    const rawDate = date.slice(0, 10);
    const unformattedDate = new Date(rawDate + "T00:00:00");
    return {
      month: format(unformattedDate, "MMMM"),
      day: Number(format(unformattedDate, "dd")),
      year: format(unformattedDate, "yyyy"),
    };
  };

  const renderCardImage = (card: CardTypes, index: number) => {
    const { positions, cardWidth } = spreadPositions[reading.spread_type];
    const position = positions[card.position_order];
    if (!position) return null; //skip any card without a valid position
    const { x, y, rotation, labelOffset } = position;
    const cardImagePath = getCardImagePath(card.card_name);
    let cardRotation = rotation;
    const labelRotation = cardRotation;
    if (card.card_name.includes("rx")) cardRotation += 180;
    const spreadType = reading.spread_type;

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

  const renderCardInputsForUpdate = () => {
    const handleAddCard = () => setAddedCards([...addedCards, ""]);

    const handleRemoveCard = (indexToRemove: number) => {
      setAddedCards(addedCards.filter((_, index) => index !== indexToRemove));
    };

    return (
      <>
        <button
          className={styles["add-card-btn"]}
          onClick={() => handleAddCard()}
        >
          ADD CARD
        </button>
        <div className={styles["all-card-inputs-container"]}>
          {addedCards.map((_, index) => (
            <div key={index} className={styles["card-input-container"]}>
              <CardInput
                cards={addedCards}
                setCards={setAddedCards}
                label="select card"
                index={index}
                excludedCards={cards.map((card) => card.card_name)}
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
  };

  const updateReadingAndCards = async () => {
    setUpdating(true);

    const updateReadingRequestObj = {
      notes: notes,
      user_interpretation: userInterpretation,
    };

    try {
      const updatedReading = await updateReadingById(
        readingId,
        updateReadingRequestObj,
      );

      for (const [index, card] of addedCards.entries()) {
        const updateCardRequestObj = {
          reading_id: readingId!,
          card_name: card,
          position_name: "clarifier",
          position_order: cards.length + index,
        };
        await saveCards(updateCardRequestObj);
      }
      const updatedCards = await getCardsByReadingId(readingId!);
      setCards(updatedCards);
      setNotes(updatedReading.notes);
      setUserInterpretation(updatedReading.user_interpretation);
      setUpdateMessage("reading updated :)");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      setUpdateMessage(message);
    } finally {
      setUpdating(false);
    }
  };

  const deleteReading = async (readingId: string) => {
    try {
      const deletedReading = await deletedReadingById(readingId);
      setDeleteMessage("reading deleted :)");
      navigate("/analytics");
      return deletedReading;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      setDeleteMessage(message);
    }
  };

  const originalSpread = cards.filter(
    (card) => card.position_name !== "clarifier",
  );
  const clarifiers = cards.filter((card) => card.position_name === "clarifier");

  return (
    <>
      <div className={styles["view-reading-container"]}>
        <div className={styles["reading-info-container"]}>
          <div className={styles["month-day-container"]}>
            <h1 className={styles["month"]}>
              {formatDate(reading.reading_date).month}
            </h1>
            <h1 className={styles["day"]}>
              {convertDayToWord(formatDate(reading.reading_date).day)}
            </h1>
          </div>
          <h2 className={styles["year"]}>
            {formatDate(reading.reading_date).year}
          </h2>
          <hr className={styles["aesthetic-divider"]} />
          <div className={styles["details-container"]}>
            <div className={styles["topic-container"]}>
              <p>topic:</p>
              <p>
                {topicLabels[reading.reading_topic] || reading.reading_topic}
              </p>
            </div>
            <div className={styles["spread-container"]}>
              <p>spread:</p>
              <p>{spreadLabels[reading.spread_type] || reading.spread_type}</p>
            </div>
            <div className={styles["notes-container"]}>
              <p>notes:</p>
              <p>{reading.notes}</p>
            </div>
            <div className={styles["notes-container"]}>
              <p>your interpretation:</p>
              <p>{reading.user_interpretation}</p>
            </div>
          </div>
          <div className={styles["button-container"]}>
            <button
              className={styles["update-reading-btn"]}
              onClick={() => {
                setUpdateModal(true);
              }}
            >
              MANUAL UPDATE
            </button>
            <button className={styles["clarifier-btn"]}>PULL CLARIFIER</button>
          </div>
          <hr className={styles["aesthetic-divider"]} />
          <div
            className={`${styles["interpretation-card"]} ${(isGenerating && !AIInterpretation) || AIInterpretation ? "" : styles["hidden"]} `}
          >
            <p className={styles["interpretation"]}>
              {isGenerating && !AIInterpretation ? (
                "interpreting..."
              ) : (
                <ReactMarkdown>{AIInterpretation}</ReactMarkdown>
              )}
            </p>
          </div>
          <button
            className={styles["save-interpretation-btn"]}
            onClick={async () => {
              setIsGenerating(true);
              setAIInterpretation(await interpretReadingById(readingId));
              setIsGenerating(false);
            }}
          >
            {!AIInterpretation
              ? "GENERATE INTERPRETATION"
              : "SAVE INTERPRETATION"}
          </button>
          <button
            className={styles["delete-reading-btn"]}
            onClick={() => setDeleteModal(true)}
          >
            DELETE READING
          </button>
        </div>
        <div className={styles["all-card-display-container"]}>
          <div className={styles["spread-display-container"]}>
            {originalSpread.map((card, index) => renderCardImage(card, index))}
          </div>
          <div className={styles["clarifier-display-container"]}>
            <div className={styles["clarifier-container"]}>
              {clarifiers.map((card) => (
                <>
                  <div
                    className={styles["clarifier-card-container"]}
                    style={{
                      width: `${spreadPositions[reading.spread_type].cardWidth}%`,
                    }}
                  >
                    <img
                      className={styles["card-image"]}
                      src={`${getCardImagePath(card.card_name)}`}
                      style={{ width: "100%" }}
                    />
                    <p className={styles["clarifier-card-label"]}>clarifier</p>
                  </div>
                </>
              ))}
            </div>
          </div>
        </div>
        {updateModal && (
          <div className={styles["update-reading-modal"]}>
            <i
              className="fa-regular fa-x"
              style={{ cursor: "pointer" }}
              onClick={() => setUpdateModal(false)}
            ></i>
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
            {renderCardInputsForUpdate()}
            <button
              className={styles["save-interpretation-btn"]}
              onClick={updateReadingAndCards}
              disabled={updating}
            >
              {updating ? "Updating..." : "UPDATE READING"}
            </button>
            {updateMessage && <p>{updateMessage}</p>}
          </div>
        )}
        {deleteModal && (
          <div className={styles["delete-modal"]}>
            <p>are you sure you want to delete this reading?</p>
            <button
              className={styles["yes-delete-btn"]}
              onClick={() => {
                deleteReading(readingId!);
              }}
            >
              YES
            </button>
            <button
              className={styles["no-delete-btn"]}
              onClick={() => {
                setDeleteModal(false);
              }}
            >
              NO
            </button>
            {deleteMessage && <p>{deleteMessage}</p>}
          </div>
        )}
      </div>
    </>
  );
};

export default ViewReadingPage;
