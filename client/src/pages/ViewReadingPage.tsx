import styles from "./css/ViewReadingPage.module.css";
import { useState, useEffect, CSSProperties } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import {
  getReadingByReadingId,
  updateReadingById,
  deletedReadingById,
  interpretReadingById,
  saveAIInterpretation,
} from "../services/readingService";
import { saveCards } from "../services/cardsService";
import type { ReadingTypes, CardTypes, UserTypes } from "../types";
import { format } from "date-fns";
import { convertDayToWord } from "../util";
import { getCardsByReadingId } from "../services/cardsService";
import { getCardImagePath } from "../util";
import { getRandomSequence } from "../services/randomService";
import CardInput from "../components/CardInput";
import spreadPositions from "../data/spreadPositions";
import topicLabels from "../data/topicLabels";
import spreadLabels from "../data/spreadLabels";
import spreadConfig from "../data/spreadConfig";
import { tarotCards, getCardInfo } from "../data/tarotCards";

interface ViewReadingPageProps {
  currentUser: UserTypes | null;
  isAuthLoading: boolean;
}

const ViewReadingPage = ({
  currentUser,
  isAuthLoading,
}: ViewReadingPageProps) => {
  const navigate = useNavigate();
  const [reading, setReading] = useState<ReadingTypes | null>(null); //because this holds a single reading which is just an object, there is no way to represent an empty object so we have to write null
  const [cards, setCards] = useState<CardTypes[]>([]);
  const [addedCards, setAddedCards] = useState<string[]>([]);
  const [updatedNotes, setUpdatedNotes] = useState<string>("");
  const [updatedUserInterpretation, setUpdatedUserInterpretation] =
    useState<string>("");
  const [AIInterpretation, setAIInterpretation] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updateMessage, setUpdateMessage] = useState<string>("");
  const [updateModal, setUpdateModal] = useState<boolean>(false);
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [deleteMessage, setDeleteMessage] = useState<string>("");
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isReversals, setIsReversals] = useState<boolean>(false);

  const { readingId } = useParams();

  //useEffects
  useEffect(() => {
    if (isAuthLoading) return;
    if (!currentUser) navigate("/login");
  }, [currentUser, isAuthLoading]);

  useEffect(() => {
    if (!readingId) return; //makes sure readingId is not null
    getReadingByReadingId(readingId).then((data) => {
      setReading(data);
      setAIInterpretation(data.ai_interpretation || "");
    });
    getCardsByReadingId(readingId).then((data) => setCards(data));
  }, [readingId]);

  //functions
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
    if (!reading) return;
    const isCustom = reading.spread_type === "custom";
    const isClarifier = card.position_name === "clarifier";
    const isFlowCard = isClarifier || isCustom;

    const spreadLayout = spreadPositions[reading.spread_type]; // undefined for custom
    const cardWidth = spreadLayout?.cardWidth ?? 30; //fallback width for custom

    let containerStyle: CSSProperties;
    let label: string;
    let positionRotation: number;
    let labelStyle: CSSProperties;
    if (isFlowCard) {
      //clarifiers or custom reading
      containerStyle = {
        position: "relative",
        width: `${(cardWidth / 100) * 500}px`,
      };
      label = isClarifier
        ? (clarifiers[index]?.position_name ?? "clarifier")
        : (cards[index]?.position_name ?? "clarifier");
      positionRotation = 0;
      labelStyle = {};
    } else {
      //original spread or non custom reading
      const position = spreadLayout?.positions[card.position_order];
      if (!position) return null;
      containerStyle = {
        position: "absolute",
        left: `${position.x}%`,
        top: `${(position.y / 100) * 400}px`,
        width: `${cardWidth}%`,
      };
      label = spreadConfig[reading.spread_type][card.position_order];
      positionRotation = position.rotation;
      labelStyle = position.labelOffset
        ? {
            position: "absolute",
            left: `${position.labelOffset.x}%`,
            top: `${position.labelOffset.y}%`,
            transform: `rotate(${positionRotation}deg)`,
          }
        : { transform: `rotate(${positionRotation}deg)` };
    }

    const cardRotation =
      positionRotation + (card.card_name.includes("rx") ? 180 : 0);

    const cardImagePath = getCardImagePath(card.card_name);
    const cardMeaning = getCardInfo(card.card_name);

    console.log("card", card);
    return (
      <div
        key={card.id}
        className={styles["card-image-container"]}
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") {
            setActiveCardId(card.id);
          }
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse") {
            setActiveCardId(null);
          }
        }}
        style={containerStyle}
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
        {activeCardId === card.id && (
          <div className={styles["card-popup"]}>
            <p className={styles["upright-label"]}>Upright:</p>
            <p className={styles["upright-meaning"]}>
              {cardMeaning?.card.meanings.upright}
            </p>
            <p className={styles["reversed-label"]}>Reversed:</p>
            <p className={styles["reversed-meaning"]}>
              {cardMeaning?.card.meanings.reversed}
            </p>
          </div>
        )}
        <p className={styles["card-label"]} style={labelStyle}>
          {label}
        </p>
      </div>
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
                className={`fa-regular fa-x ${styles["x-btn"]}`}
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
    if (!readingId) return;

    setIsUpdating(true);

    const updateReadingRequestObj = {
      notes: updatedNotes,
      user_interpretation: updatedUserInterpretation,
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
      setReading(updatedReading);
      // setUpdatedNotes(updatedReading.notes);
      // setUpdatedUserInterpretation(updatedReading.user_interpretation);
      setUpdateMessage("reading updated :)");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      setUpdateMessage(message);
    } finally {
      setIsUpdating(false);
      setUpdateModal(false);
      setUpdateMessage("");
      setAddedCards([]);
    }
  };

  const deleteReading = async (readingId: string) => {
    try {
      const deletedReading = await deletedReadingById(readingId);
      setDeleteMessage("reading deleted :)");
      navigate("/history");
      return deletedReading;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      setDeleteMessage(message);
    }
  };

  const handleGenerateAIInterpretation = async (readingId: string) => {
    try {
      setIsGenerating(true);
      setAIInterpretation(await interpretReadingById(readingId));
      setIsGenerating(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown Error";
      console.error(message);
    }
  };

  const handleSaveAIInterpretation = async (
    readingId: string,
    interpretation: Object,
  ) => {
    try {
      setIsSaving(true);
      const updatedReading = await saveAIInterpretation(readingId, {
        ai_interpretation: interpretation,
      });
      if (updatedReading.ai_interpretation) {
        setAIInterpretation(updatedReading.ai_interpretation);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unkown error";
      console.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const pullClarifier = async () => {
    try {
      const randomNumber = await getRandomSequence(1, isReversals);
      const cardName = tarotCards[randomNumber[0]].card_name;

      const updateCardRequestObj = {
        reading_id: readingId!,
        card_name: cardName,
        position_name: "clarifier",
        position_order: cards.length,
      };

      await saveCards(updateCardRequestObj);
      const updatedCards = await getCardsByReadingId(readingId!);
      setCards(updatedCards);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown Error";
      console.error(message);
    }
  };

  const originalSpread = cards.filter(
    (card) => card.position_name !== "clarifier",
  );
  const clarifiers = cards.filter((card) => card.position_name === "clarifier");

  if (isAuthLoading) return null;
  if (!currentUser) return null;
  if (!readingId) return null;
  if (!reading) return null; //makes sure reading is not null

  // console.log("activeCardId", activeCardId);
  // console.log("cards", cards);
  // console.log("clarifies", clarifiers);
  // console.log("reading", reading);

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
              <p className={styles["detail-label"]}>Topic:</p>
              <p className={styles["detail"]}>
                {topicLabels[reading.reading_topic] || reading.reading_topic}
              </p>
            </div>
            <div className={styles["spread-container"]}>
              <p className={styles["detail-label"]}>Spread:</p>
              <p className={styles["detail"]}>
                {spreadLabels[reading.spread_type] || reading.spread_type}
              </p>
            </div>
            <div className={styles["notes-container"]}>
              <p className={styles["detail-label"]}>Notes:</p>
              <p className={styles["detail"]}>{reading.notes}</p>
            </div>
            <div className={styles["notes-container"]}>
              <p className={styles["detail-label"]}>Your interpretation:</p>
              <p className={styles["detail"]}>{reading.user_interpretation}</p>
            </div>
          </div>
          {/* <div className={styles["button-container"]}> */}
          <button
            className={styles["update-reading-btn"]}
            onClick={() => {
              setUpdateModal(true);
            }}
          >
            UPDATE
          </button>
          <div className={styles["pull-clarifier-container"]}>
            <button className={styles["clarifier-btn"]} onClick={pullClarifier}>
              PULL CLARIFIER
            </button>
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
          </div>
          {/* </div> */}
          <hr className={styles["aesthetic-divider"]} />
          <div
            className={`${styles["interpretation-card"]} ${(isGenerating && !AIInterpretation) || AIInterpretation ? "" : styles["hidden"]} `}
          >
            <div className={styles["interpretation"]}>
              {isGenerating && !AIInterpretation ? (
                "interpreting..."
              ) : (
                <ReactMarkdown>{AIInterpretation}</ReactMarkdown>
              )}
            </div>
          </div>
          <button
            className={`${styles["save-interpretation-btn"]} ${AIInterpretation ? styles["hidden"] : ""}`}
            onClick={async () => {
              await handleGenerateAIInterpretation(readingId);
            }}
          >
            {isGenerating ? "generating..." : "GENERATE INTERPRETATION"}
          </button>
          <button
            className={`${styles["save-interpretation-btn"]} ${!AIInterpretation ? styles["hidden"] : ""}`}
            disabled={isSaving}
            onClick={async () => {
              await handleSaveAIInterpretation(readingId, AIInterpretation);
            }}
          >
            {isSaving ? "saving..." : "SAVE INTERPRETATION"}
          </button>
          <button
            className={styles["delete-reading-btn"]}
            onClick={() => setDeleteModal(true)}
          >
            DELETE READING
          </button>
        </div>
        <div className={styles["all-card-display-container"]}>
          {reading.spread_type === "custom" ? (
            <div className={styles["clarifier-display-container"]}>
              {originalSpread.map((card, index) =>
                renderCardImage(card, index),
              )}
            </div>
          ) : (
            <div
              className={styles["spread-display-container"]}
              style={{
                height: spreadPositions[reading.spread_type].canvasHeight,
              }}
            >
              {originalSpread.map((card, index) =>
                renderCardImage(card, index),
              )}
            </div>
          )}
          <div className={styles["clarifier-display-container"]}>
            {clarifiers.map((card, index) => renderCardImage(card, index))}
          </div>
        </div>
        {updateModal && (
          <div className={styles["update-reading-modal-container"]}>
            <i
              className={`fa-regular fa-x ${styles["x-btn"]}`}
              style={{ marginLeft: "98%" }}
              onClick={() => setUpdateModal(false)}
            ></i>
            <div className={styles["update-reading-modal-contents"]}>
              <div className={styles["reading-notes"]}>
                <input
                  type="text"
                  value={updatedNotes}
                  placeholder="notes"
                  onChange={(e) => setUpdatedNotes(e.target.value)}
                />
              </div>
              <div className={styles["reading-notes"]}>
                <input
                  type="text"
                  //inputs current value
                  value={updatedUserInterpretation}
                  placeholder="interpretation"
                  onChange={(e) => setUpdatedUserInterpretation(e.target.value)}
                />
              </div>
              {renderCardInputsForUpdate()}
              <button
                className={styles["update-reading-btn-modal"]}
                onClick={updateReadingAndCards}
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : "UPDATE READING"}
              </button>
              {updateMessage && (
                <p className={styles["update-msg"]}>{updateMessage}</p>
              )}
            </div>
          </div>
        )}
        {deleteModal && (
          <div className={styles["delete-modal"]}>
            <p>are you sure you want to delete this reading?</p>
            <div className={styles["delete-modal-btns-container"]}>
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
            </div>
            {deleteMessage && <p>{deleteMessage}</p>}
          </div>
        )}
      </div>
    </>
  );
};

export default ViewReadingPage;
