import styles from "./css/ViewReadingPage.module.css";
import { useState, useEffect, useRef, CSSProperties } from "react";
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
import { convertDayToWord, getCardImagePath, getReadingSummary } from "../util";
import { getCardsByReadingId } from "../services/cardsService";
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
  const [savedAIInterpretation, setSavedAInterpretation] =
    useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updateMessage, setUpdateMessage] = useState<string>("");
  const [updateModal, setUpdateModal] = useState<boolean>(false);
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [deleteMessage, setDeleteMessage] = useState<string>("");
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [isMobileView, setIsMobileView] = useState<boolean>(
    () => window.matchMedia("(max-width: 900px)").matches,
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isReversals, setIsReversals] = useState<boolean>(false);
  const spreadAreaRef = useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = useState<number | null>(null);
  const [notesExpanded, setNotesExpanded] = useState<boolean>(false);
  const [userInterpretationExpanded, setUserInterpretationExpanded] =
    useState<boolean>(false);
  const isReadingModalOpen = updateModal || deleteModal;

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
      setUpdatedNotes(data.notes || "");
      setUpdatedUserInterpretation(data.user_interpretation || "");

      if (data.ai_interpretation) setSavedAInterpretation(true);
    });
    getCardsByReadingId(readingId).then((data) => setCards(data));
  }, [readingId]);

  //measure the width available to the spread so it can scale to fit
  useEffect(() => {
    const el = spreadAreaRef.current;
    if (!el) return;
    const resizeObserver = new ResizeObserver(([entry]) =>
      setAvailableWidth(entry.contentRect.width),
    );
    resizeObserver.observe(el);
    return () => resizeObserver.disconnect();
  }, [reading]);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 900px)");
    const updateMobileView = () => setIsMobileView(mobileQuery.matches);
    mobileQuery.addEventListener("change", updateMobileView);
    return () => mobileQuery.removeEventListener("change", updateMobileView);
  }, []);

  useEffect(() => {
    if (isReadingModalOpen) setActiveCardId(null);
  }, [isReadingModalOpen]);

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

  const getSpreadBounds = (spreadType: string, horizontalMultiplier = 1) => {
    const X_SCALE = 5; // px per position unit (500px canvas / 100)
    const Y_SCALE = 4; // px per position unit (400px canvas / 100)
    const CARD_ASPECT = 1.75; // card height ≈ 1.75 × width
    const LABEL_ALLOWANCE = 40; // room for the label under the lowest card

    const layout = spreadPositions[spreadType];
    const cardW = layout.cardWidth * X_SCALE;
    const cardH = cardW * CARD_ASPECT;

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const p of layout.positions) {
      const x = p.x * X_SCALE * horizontalMultiplier;
      const y = p.y * Y_SCALE;
      // a card rotated 90° visually overhangs its layout box on the sides
      const sideways = Math.abs(p.rotation % 180) === 90;
      const overhang = sideways ? (cardH - cardW) / 2 : 0;
      minX = Math.min(minX, x - overhang);
      maxX = Math.max(maxX, x + cardW + overhang);
      minY = Math.min(minY, y + overhang);
      maxY = Math.max(maxY, y + cardH - overhang);
    }
    return {
      minXPx: minX,
      minYPx: minY,
      widthPx: maxX - minX,
      heightPx: maxY - minY + LABEL_ALLOWANCE,
    };
  };

  const getMobileHorizontalMultiplier = (
    spreadType: string,
    containerWidth: number | null,
  ) => {
    const horizontalSpreads = new Set([
      "top-bottom",
      "past-present-future",
      "past-present-future-advice",
    ]);
    if (
      !isMobileView ||
      !containerWidth ||
      !horizontalSpreads.has(spreadType)
    ) {
      return 1;
    }

    const layout = spreadPositions[spreadType];
    const cardCount = layout.positions.length;
    const cardWidthPx = (layout.cardWidth / 100) * 500;
    const targetGapPx = 12; // matches the mobile clarifier gap of 0.75rem
    const unscaledWidthWithTargetGap =
      cardCount * cardWidthPx + (cardCount - 1) * targetGapPx;
    const unscaledGapPx =
      containerWidth >= unscaledWidthWithTargetGap
        ? targetGapPx
        : (targetGapPx * cardCount * cardWidthPx) /
          Math.max(1, containerWidth - targetGapPx * (cardCount - 1));

    const xValues = layout.positions.map((position) => position.x * 5);
    const originalHorizontalSpan = Math.max(...xValues) - Math.min(...xValues);
    const desiredHorizontalSpan =
      (cardCount - 1) * (cardWidthPx + unscaledGapPx);

    return originalHorizontalSpan
      ? desiredHorizontalSpan / originalHorizontalSpan
      : 1;
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
      const { minXPx, minYPx } = getSpreadBounds(
        reading.spread_type,
        spreadHorizontalMultiplier,
      );
      containerStyle = {
        position: "absolute",
        left: `${(position.x / 100) * 500 * spreadHorizontalMultiplier - minXPx}px`,
        top: `${(position.y / 100) * 400 - minYPx}px`,
        width: `${(cardWidth / 100) * 500}px`,
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
        className={`${styles["card-image-container"]} ${
          !isReadingModalOpen && activeCardId === card.id
            ? styles["active-card"]
            : ""
        }`}
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse" && !isReadingModalOpen) {
            setActiveCardId(card.id);
          }
        }}
        onPointerLeave={(e) => {
          if (
            e.pointerType === "mouse" &&
            !window.matchMedia("(max-width: 900px)").matches
          ) {
            setActiveCardId(null);
          }
        }}
        onPointerUp={(e) => {
          if (e.pointerType !== "mouse" && !isReadingModalOpen) {
            setActiveCardId((currentId) =>
              currentId === card.id ? null : card.id,
            );
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
        {!isReadingModalOpen && activeCardId === card.id && (
          <div className={styles["card-popup"]}>
            <h3 className={styles["card-popup-title"]}>
              {cardMeaning?.card.card_name}
              {cardMeaning?.isReversed ? " (Reversed)" : ""}
            </h3>
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
      setSavedAInterpretation(true);
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

  const spreadHorizontalMultiplier = getMobileHorizontalMultiplier(
    reading.spread_type,
    availableWidth,
  );
  const spreadBounds =
    reading.spread_type === "custom"
      ? null
      : getSpreadBounds(reading.spread_type, spreadHorizontalMultiplier);
  const spreadScale =
    spreadBounds && availableWidth
      ? Math.min(
          1,
          Math.max(
            1,
            availableWidth - (reading.spread_type === "celtic" ? 16 : 0),
          ) / spreadBounds.widthPx,
        )
      : 1;
  const scaledSpreadCardWidth =
    reading.spread_type === "custom"
      ? null
      : (spreadPositions[reading.spread_type].cardWidth / 100) *
        500 *
        spreadScale;
  const activeCard = isReadingModalOpen
    ? undefined
    : cards.find((card) => card.id === activeCardId);
  const activeCardMeaning = activeCard
    ? getCardInfo(activeCard.card_name)
    : null;

  // console.log("activeCardId", activeCardId);
  // console.log("cards", cards);
  // console.log("clarifies", clarifiers);
  // console.log("reading", reading);

  return (
    <>
      <div className={styles["view-reading-page-container"]}>
        <div className={styles["view-reading-container"]}>
          <div className={styles["reading-info-container"]}>
            <div className={styles["reading-info-content"]}>
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
              <div className={styles["reading-details-card"]}>
                <button
                  type="button"
                  className={styles["delete-reading-btn"]}
                  aria-label="Delete reading"
                  title="Delete reading"
                  onClick={() => setDeleteModal(true)}
                />
                <div className={styles["details-container"]}>
                  <div className={styles["topic-container"]}>
                    <p className={styles["detail-label"]}>topic:</p>
                    <p className={styles["detail"]}>
                      {topicLabels[reading.reading_topic] ||
                        reading.reading_topic}
                    </p>
                  </div>
                  <div className={styles["spread-container"]}>
                    <p className={styles["detail-label"]}>spread:</p>
                    <p className={styles["detail"]}>
                      {spreadLabels[reading.spread_type] || reading.spread_type}
                    </p>
                  </div>
                  <div className={styles["notes-container"]}>
                    <p className={styles["detail-label"]}>notes:</p>
                    <div>
                      <p className={notesExpanded ? "" : styles["truncate"]}>
                        {reading.notes}
                      </p>
                      <button
                        className={styles["see-more-btn"]}
                        onClick={() => setNotesExpanded(!notesExpanded)}
                      >
                        {notesExpanded ? "[see less]" : "[see more]"}
                      </button>
                    </div>
                  </div>
                  <div className={styles["notes-container"]}>
                    <p className={styles["detail-label"]}>yours:</p>
                    <div>
                      <p
                        className={
                          userInterpretationExpanded ? "" : styles["truncate"]
                        }
                      >
                        {reading.user_interpretation}
                      </p>
                      <button
                        className={styles["see-more-btn"]}
                        onClick={() =>
                          setUserInterpretationExpanded(
                            !userInterpretationExpanded,
                          )
                        }
                      >
                        {userInterpretationExpanded
                          ? "[see less]"
                          : "[see more]"}
                      </button>
                    </div>
                  </div>
                </div>
                <div className={styles["button-container"]}>
                  <button
                    className={styles["update-reading-btn"]}
                    onClick={() => {
                      setUpdateModal(true);
                    }}
                  >
                    EDIT
                  </button>
                  {/* <button
              className={styles["delete-reading-btn"]}
              onClick={() => setDeleteModal(true)}
            >
              DELETE
            </button> */}
                  <div className={styles["pull-clarifier-container"]}>
                    <button
                      className={styles["clarifier-btn"]}
                      onClick={pullClarifier}
                    >
                      CLARIFIER
                    </button>
                    <div className={styles["rx-input-container"]}>
                      <input
                        type="checkbox"
                        checked={isReversals}
                        onChange={(e) => setIsReversals(e.target.checked)}
                        className={styles["rx-input"]}
                      />
                      <span className={styles["rx-label"]}>rx</span>
                    </div>
                  </div>
                  {/* <div className={styles["toggle-container"]}>
              <label className={styles["toggle"]}>
                <span className={styles["toggle-label"]}>no reversals</span>
                <input
                  type="checkbox"
                  checked={isReversals}
                  onChange={(e) => setIsReversals(e.target.checked)}
                  // className={styles["toggle-input"]}
                />
                <span className={styles["toggle-slider"]} />
                <span className={styles["toggle-label"]}>rx</span>
              </label>
            </div> */}
                </div>
              </div>
            </div>
            <div className={styles["interpretation-section"]}>
              <hr className={styles["aesthetic-divider"]} />
              <div
                className={`${styles["interpretation-card"]} ${(isGenerating && !AIInterpretation) || AIInterpretation ? "" : styles["hidden"]} `}
              >
                <div className={styles["interpretation"]}>
                  {isGenerating && !AIInterpretation ? (
                    "interpreting..."
                  ) : (
                    <ReactMarkdown>
                      {getReadingSummary(AIInterpretation)}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
              <button
                className={`${styles["interpret-btn"]} ${AIInterpretation ? styles["hidden"] : ""}`}
                onClick={async () => {
                  await handleGenerateAIInterpretation(readingId);
                }}
              >
                {isGenerating ? "generating..." : "INTERPRET"}
              </button>
              <button
                className={`${styles["interpret-btn"]} ${styles["save-interpretation-btn-sidebar"]} ${!AIInterpretation ? styles["hidden"] : ""}`}
                disabled={savedAIInterpretation}
                onClick={async () => {
                  await handleSaveAIInterpretation(readingId, AIInterpretation);
                }}
              >
                {savedAIInterpretation ? "saved!" : "SAVE INTERPRETATION"}
              </button>
            </div>
          </div>
          <div className={styles["reading-main-container"]}>
            <div
              className={styles["all-card-display-container"]}
              ref={spreadAreaRef}
              style={
                scaledSpreadCardWidth
                  ? ({
                      "--mobile-spread-card-width": `${scaledSpreadCardWidth}px`,
                    } as CSSProperties)
                  : undefined
              }
            >
              {reading.spread_type === "custom" ? (
                <div className={styles["clarifier-display-container"]}>
                  {originalSpread.map((card, index) =>
                    renderCardImage(card, index),
                  )}
                </div>
              ) : (
                spreadBounds && (
                  <div
                    className={`${styles["spread-scale-frame"]} ${
                      !isReadingModalOpen &&
                      originalSpread.some((card) => card.id === activeCardId)
                        ? styles["active-spread-frame"]
                        : ""
                    }`}
                    style={{
                      width: spreadBounds.widthPx * spreadScale,
                      height: spreadBounds.heightPx * spreadScale,
                      marginTop: spreadPositions[reading.spread_type].topMargin,
                    }}
                  >
                    <div
                      className={`${styles["spread-display-container"]} ${
                        reading.spread_type === "celtic"
                          ? styles["celtic-spread"]
                          : ""
                      }`}
                      style={
                        {
                          width: spreadBounds.widthPx,
                          height: spreadBounds.heightPx,
                          transform: `scale(${spreadScale})`,
                          transformOrigin: "top left",
                          "--mobile-spread-label-size": `${0.9 / spreadScale}rem`,
                        } as CSSProperties
                      }
                    >
                      {originalSpread.map((card, index) =>
                        renderCardImage(card, index),
                      )}
                    </div>
                  </div>
                )
              )}
              <div className={styles["clarifier-display-container"]}>
                {clarifiers.map((card, index) => renderCardImage(card, index))}
              </div>
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
                    onChange={(e) =>
                      setUpdatedUserInterpretation(e.target.value)
                    }
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
          {/* <button
          className={styles["delete-reading-btn"]}
          onClick={() => setDeleteModal(true)}
        >
          DELETE
        </button> */}
        </div>
        {activeCard && (
          <div
            className={styles["mobile-card-popup-overlay"]}
            onClick={() => setActiveCardId(null)}
          >
            <div
              className={styles["mobile-card-popup"]}
              role="dialog"
              aria-label={`${activeCard.card_name} meanings`}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                className={styles["mobile-card-popup-close"]}
                aria-label="Close card meanings"
                onClick={() => setActiveCardId(null)}
              >
                ×
              </button>
              <h3 className={styles["card-popup-title"]}>
                {activeCardMeaning?.card.card_name}
                {activeCardMeaning?.isReversed ? " (Reversed)" : ""}
              </h3>
              <p className={styles["upright-label"]}>Upright:</p>
              <p className={styles["upright-meaning"]}>
                {activeCardMeaning?.card.meanings.upright}
              </p>
              <p className={styles["reversed-label"]}>Reversed:</p>
              <p className={styles["reversed-meaning"]}>
                {activeCardMeaning?.card.meanings.reversed}
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ViewReadingPage;
