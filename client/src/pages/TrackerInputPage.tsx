import headerStyles from "../components/css/Header.module.css";
//react imports
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
//function imports
import { createReading } from "../services/readingService";
import { getRandomSequence } from "../services/randomService";
import { getCardImagePath } from "../util";
//component imports
import DatePicker from "../components/DatePicker";
import ReadingTopicMenu from "../components/ReadingTopicMenu";
import ReadingSpreadMenu from "../components/ReadingSpreadMenu";
import CardInput from "../components/CardInput";
//data imports
import spreadConfig from "../data/spreadConfig";
import { tarotCardNames } from "../data/tarotCards";
import spreadPositions from "../data/spreadPositions";
//types
import { NewReadingTypes, ReadingTypes, UserTypes } from "../types";
//styling
import formControls from "../components/css/FormControls.module.css";
import styles from "./css/TrackerInputPage.module.css";

const READING_DRAFT_KEY = "tarolytics-reading-draft";

interface ReadingDraft {
  date: string | null;
  readingTopic: string;
  customReadingTopic: string;
  readingSpread: string;
  customReadingSpread: string;
  customReadingSpreadPositions: string[];
  inputtedCards: string[];
  pulledCards: string[];
  notes: string;
  userInterpretation: string;
  isManual: boolean;
  isCardsPulled: boolean;
  isReversals: boolean;
}

function clearReadingDraft() {
  try {
    sessionStorage.removeItem(READING_DRAFT_KEY);
  } catch {
    // Storage cleanup should not turn a successful save into an error.
  }
}

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
  const [customReadingSpreadPositions, setCustomReadingSpreadPositions] =
    useState<string[]>([""]);
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
  const [showLoginModal, setShowLoginModal] = useState(false);
  const loginDialogRef = useRef<HTMLDialogElement>(null);
  const [draftError, setDraftError] = useState("");
  const navigate = useNavigate();

  //useEffects
  useEffect(() => {
    if (isAuthLoading) return;
    // if (!currentUser) navigate("/login");
  }, [currentUser, isAuthLoading]);

  useEffect(() => {
    const dialog = loginDialogRef.current;
    if (!dialog) return;

    if (showLoginModal && !dialog.open) {
      dialog.showModal();
    } else if (!showLoginModal && dialog.open) {
      dialog.close();
    }
  }, [showLoginModal]);

  //restore reading draft when page mounts
  useEffect(() => {
    try {
      const storedDraft = sessionStorage.getItem(READING_DRAFT_KEY);

      if (!storedDraft) return;

      const draft = JSON.parse(storedDraft) as ReadingDraft;

      const restoredDate = draft.date ? new Date(draft.date) : null;

      if (restoredDate && Number.isNaN(restoredDate.getTime())) {
        throw new Error("Invalid draft date");
      }

      setDate(restoredDate);
      setReadingTopic(draft.readingTopic);
      setCustomReadingTopic(draft.customReadingTopic);
      setReadingSpread(draft.readingSpread);
      setCustomReadingSpread(draft.customReadingSpread);
      setCustomReadingSpreadPositions(draft.customReadingSpreadPositions);
      setInputtedCards(draft.inputtedCards);
      setPulledCards(draft.pulledCards);
      setNotes(draft.notes);
      setUserInterpretation(draft.userInterpretation);
      setIsManual(draft.isManual);
      setIsCardsPulled(draft.isCardsPulled);
      setIsReversals(draft.isReversals);
    } catch {
      setMessage("Your previous reading draft couldn't be restored.");
    }
  }, []);

  //functions
  const pullCards = async () => {
    try {
      setIsCardsPulled(true);
      const numberOfCards = spreadConfig[readingSpread].length;
      const randomSequence = await getRandomSequence(
        numberOfCards,
        isReversals,
      );
      const cardNames = randomSequence.map(
        (number) => tarotCardNames[number - 1],
      );
      setPulledCards(cardNames);
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
      <div key={card} className={styles["card-image-container"]}>
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
                <div className={styles["reading-notes"]}>
                  <CardInput
                    cards={inputtedCards}
                    setCards={setInputtedCards}
                    label="select card"
                    index={index}
                  />
                </div>
                <div className={styles["card-position"]}>
                  <input
                    className={formControls.control}
                    type="text"
                    value={customReadingSpreadPositions[index] || ""}
                    placeholder="position"
                    onChange={(e) =>
                      setCustomReadingSpreadPositions((currentPositions) => {
                        const updated = [...currentPositions];
                        updated[index] = e.target.value;
                        return updated;
                      })
                    }
                  />
                </div>
                <button
                  type="button"
                  className={styles["x-btn"]}
                  aria-label={`Remove card ${index + 1}`}
                  onClick={() => handleRemoveCard(index)}
                >
                  <i className="fa-regular fa-x" aria-hidden="true"></i>
                </button>
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
    //null guard for currentUser date (fixes possibly null type errors)
    if (isAuthLoading) return;
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }

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

    const cardsToSave = Array.from(
      isManual ? inputtedCards : isCardsPulled ? pulledCards : [],
    );
    const spreadLabels = spreadConfig[readingSpread];

    if (
      !spreadLabels ||
      cardsToSave.length === 0 ||
      cardsToSave.some((card) => !card?.trim()) ||
      (readingSpread !== "custom" && cardsToSave.length !== spreadLabels.length)
    ) {
      setMessage("please select a card for every position in the spread");
      return;
    }

    setSaving(true);

    const readingRequestObj: NewReadingTypes = {
      reading_date: date.toISOString(),
      reading_topic:
        readingTopic === "custom" ? customReadingTopic : readingTopic,
      spread_type: readingSpread,
      notes: notes,
      user_interpretation: userInterpretation,
      cards: cardsToSave.map((card, index) => ({
        card_name: card,
        position_name:
          readingSpread === "custom"
            ? (customReadingSpreadPositions[index] ?? "")
            : spreadLabels[index],
        position_order: index,
      })),
    };

    try {
      const newReading = await createReading(readingRequestObj);
      setSavedReadingData(newReading);
      // The server responds only after the reading and every card commit.
      clearReadingDraft();
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

  const handleContinueWithGoogle = () => {
    setDraftError("");

    try {
      const draft: ReadingDraft = {
        date: date?.toISOString() ?? null,
        readingTopic,
        customReadingTopic,
        readingSpread,
        customReadingSpread,
        customReadingSpreadPositions,
        inputtedCards,
        pulledCards,
        notes,
        userInterpretation,
        isManual,
        isCardsPulled,
        isReversals,
      };

      sessionStorage.setItem(READING_DRAFT_KEY, JSON.stringify(draft));
    } catch {
      setDraftError(
        "Couldn't preserve your reading in this browser. Please try again.",
      );
      return;
    }

    window.location.assign("/auth/google");
  };

  //null guards
  // if (!currentUser) return null; //prevents form from flashing while auth loads

  return (
    <div className={styles["tracker-input-page-container"]}>
      <div className={styles["reading-input-container"]}>
        <h1 className={`${headerStyles.title} ${styles["mobile-title"]}`}>
          Pull a card
        </h1>
        <hr className={styles["aesthetic-border"]}></hr>
        <div className={styles["reading-topic-menu-container"]}>
          <p className={styles["date-label"]}>date:</p>
          <DatePicker date={date} setDate={setDate} />
        </div>
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
            {readingSpread !== "custom" && (
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
            )}
            <div className={styles["btn-container"]}>
              {readingSpread !== "custom" && (
                <button
                  className={styles["save-reading-btn"]}
                  onClick={pullCards}
                >
                  PULL CARDS
                </button>
              )}
              <button
                className={styles["save-reading-btn"]}
                onClick={() => setIsManual(true)}
              >
                ENTER MANUALLY
              </button>
            </div>
          </div>
        )}

        {/* manual input logic */}
        {isManual && renderCardInputs(readingSpread)}

        {(isManual || isCardsPulled) && ( //wrapping in parenthesis for order of operations issue (&& stronger than ||)
          <>
            <div className={styles["reading-notes"]}>
              <input
                className={formControls.control}
                type="text"
                value={notes}
                placeholder="notes"
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div className={styles["reading-notes"]}>
              <input
                className={formControls.control}
                type="text"
                value={userInterpretation}
                placeholder="interpretation"
                onChange={(e) => setUserInterpretation(e.target.value)}
              />
            </div>
            <div>
              <button
                className={styles["save-reading-btn"]}
                onClick={saveReading}
                disabled={saving || isAuthLoading}
              >
                {isAuthLoading
                  ? "Checking login..."
                  : saving
                    ? "Saving..."
                    : "SAVE READING"}
              </button>
              {message && <p>{message}</p>}
            </div>
          </>
        )}
      </div>
      {(isManual || isCardsPulled) && (
        <>
          {/* pull cards logic */}
          {isCardsPulled && (
            <div
              className={styles["spread-display-container"]}
              style={{
                gridTemplateColumns: `repeat(${Math.min(Math.max(pulledCards.length, 1), 3)}, minmax(0, 1fr))`,
              }}
            >
              {pulledCards.map((card, index) =>
                renderCardImagesV2(card, index),
              )}
            </div>
          )}
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
      {showLoginModal && (
        <dialog
          ref={loginDialogRef}
          className={styles["login-modal"]}
          aria-labelledby="login-modal-title"
          aria-describedby="login-modal-description"
          onCancel={() => setShowLoginModal(false)}
          onClose={() => setShowLoginModal(false)}
        >
          <h2 id="login-modal-title">Log in to save your reading</h2>

          <p id="login-modal-description">
            Save your readings and revisit them in your history.
          </p>

          <div className={styles["login-modal-actions"]}>
            <button
              type="button"
              className={styles["login-btn"]}
              onClick={handleContinueWithGoogle}
            >
              Continue with Google
            </button>

            <button
              className={styles["keep-editing-btn"]}
              type="button"
              onClick={() => setShowLoginModal(false)}
            >
              Keep editing
            </button>
            {draftError && <p role="alert">{draftError}</p>}
          </div>
        </dialog>
      )}
    </div>
  );
};

export default TrackerInputPage;
