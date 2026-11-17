import headerStyles from "../components/css/Header.module.css";
//react imports
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
//function imports
import {
  createReading,
  ReadingSaveError,
} from "../services/reading-services/readingService";
import {
  readReadingDraft,
  writeReadingDraft,
  clearReadingDraft,
  prepareReadingSave,
  type ReadingDraft,
  type PendingReadingSave,
} from "../services/reading-services/readingDraftService";
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
import { ReadingTypes, UserTypes } from "../types";
//styling
import formControls from "../components/css/FormControls.module.css";
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
  const [pendingSave, setPendingSave] = useState<PendingReadingSave | null>(
    null,
  );
  const [restoreFailed, setRestoreFailed] = useState(false);
  const [deletedSave, setDeletedSave] = useState(false);
  const saveInFlight = useRef(false);
  const pendingSaveRef = useRef<PendingReadingSave | null>(null);

  const updatePendingSave = (pending: PendingReadingSave | null) => {
    pendingSaveRef.current = pending;
    setPendingSave(pending);
  };

  //useEffects

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
      const draft = readReadingDraft();
      if (!draft) return;
      const restoredDate = draft.date ? new Date(draft.date) : null;
      updatePendingSave(draft.pendingSave ?? null);
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
      setRestoreFailed(true);
      setDraftError(
        "Your stored reading couldn't be restored safely. It has been kept; avoid starting another save until it is recovered.",
      );
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

  const getDraft = (): ReadingDraft => ({
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
    ...(pendingSaveRef.current ? { pendingSave: pendingSaveRef.current } : {}),
  });

  const saveReading = async () => {
    if (
      isAuthLoading ||
      saveInFlight.current ||
      savedReadingData ||
      restoreFailed ||
      deletedSave
    )
      return;
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }

    let pending: PendingReadingSave;
    let draft: ReadingDraft;
    try {
      draft = getDraft();
      pending = prepareReadingSave(draft, currentUser.id);
      // Persistence must succeed before the first network request. A reload or
      // login redirect can then replay this exact ID and payload.
      writeReadingDraft({ ...draft, pendingSave: pending });
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Couldn't preserve the save. No request was sent.",
      );
      return;
    }

    updatePendingSave(pending);
    saveInFlight.current = true;
    setSaving(true);
    setMessage("");
    try {
      const reading = await createReading(pending.request);
      setSavedReadingData(reading);
      // A replay is also a confirmed success. If cleanup is blocked, retaining
      // the old ID is safe: the next reload still resolves to this reading.
      try {
        clearReadingDraft();
      } catch {
        /* keep the replayable snapshot */
      }
      updatePendingSave(null);
      setMessage("reading saved :)");
      setViewReadingModal(true);
    } catch (error) {
      if (error instanceof ReadingSaveError && error.status === 400) {
        // Validation failed before any writes. Let the user correct the form.
        const { pendingSave: _pending, ...editableDraft } = draft;
        try {
          writeReadingDraft(editableDraft);
          updatePendingSave(null);
        } catch {
          /* retain the ID if storage cannot be updated */
        }
      } else if (error instanceof ReadingSaveError && error.status === 401) {
        setShowLoginModal(true);
      } else if (error instanceof ReadingSaveError && error.status === 410) {
        setDeletedSave(true);
      }
      setMessage(
        error instanceof ReadingSaveError
          ? error.message
          : "The save hasn't been confirmed. Retry this reading to check whether it was saved.",
      );
    } finally {
      saveInFlight.current = false;
      setSaving(false);
    }
  };

  const handleRefresh = () => {
    // Never abandon an unconfirmed save and generate a new ID for it.
    if (saveInFlight.current || (pendingSaveRef.current && !deletedSave))
      return;
    try {
      clearReadingDraft();
    } catch {
      setMessage("Couldn't clear the previous draft. Please try again.");
      return;
    }
    updatePendingSave(null);
    setSavedReadingData(null);
    setViewReadingModal(false);
    setDeletedSave(false);
    setCustomReadingSpreadPositions([""]);
    setIsReversals(false);
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
      writeReadingDraft(getDraft());
    } catch {
      setDraftError(
        "Couldn't preserve your reading in this browser. Please try again.",
      );
      return;
    }

    window.location.assign("/auth/google");
  };

  return (
    <div className={styles["tracker-input-page-container"]}>
      <div className={styles["reading-input-container"]}>
        <h1 className={`${headerStyles.title} ${styles["mobile-title"]}`}>
          Pull a card
        </h1>
        <hr className={styles["aesthetic-border"]}></hr>
        {restoreFailed && <p role="alert">{draftError}</p>}
        <fieldset
          className={styles["reading-fields"]}
          disabled={
            saving || !!pendingSave || !!savedReadingData || restoreFailed
          }
        >
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
            </>
          )}
        </fieldset>
        {(isManual || isCardsPulled) && (
          <div>
            {pendingSave && !deletedSave && !saving && (
              <p>
                Your save hasn't been confirmed. Retry to check it before
                editing or starting another reading.
              </p>
            )}
            <button
              className={styles["save-reading-btn"]}
              onClick={saveReading}
              disabled={
                saving ||
                isAuthLoading ||
                !!savedReadingData ||
                restoreFailed ||
                deletedSave
              }
            >
              {isAuthLoading
                ? "Checking login..."
                : saving
                  ? "Saving..."
                  : pendingSave
                    ? "RETRY SAVE"
                    : "SAVE READING"}
            </button>
            {message && <p role="status">{message}</p>}
            {deletedSave && (
              <button
                className={styles["add-card-btn"]}
                onClick={handleRefresh}
              >
                START NEW READING
              </button>
            )}
          </div>
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
            onClick={handleRefresh}
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
              {pendingSave ? "Back to reading" : "Keep editing"}
            </button>
            {draftError && <p role="alert">{draftError}</p>}
          </div>
        </dialog>
      )}
    </div>
  );
};

export default TrackerInputPage;
