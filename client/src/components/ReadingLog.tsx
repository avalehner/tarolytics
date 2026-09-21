import ReactMarkdown from "react-markdown";
import styles from "./css/ReadingLog.module.css";
import type { ReadingWithCardTypes } from "../types";
import spreadLabels from "../data/spreadLabels";
import topicLabels from "../data/topicLabels";
import { useNavigate } from "react-router-dom";
import { getCardImagePath, getReadingSummary } from "../util";

interface ReadingLogProps {
  reading: ReadingWithCardTypes;
}

const ReadingLog = ({ reading }: ReadingLogProps) => {
  const getDate = (date: string) => {
    const rawDate = date.slice(0, 10);
    const unformattedDate = new Date(rawDate + "T00:00:00");
    return unformattedDate.toLocaleDateString("en-US").replaceAll("/", ".");
  };

  const navigate = useNavigate();

  return (
    <div
      className={styles["reading-log"]}
      onClick={() => navigate(`/reading/${reading.id}`)}
    >
      <p>{getDate(reading.reading_date)}</p>
      <p>{topicLabels[reading.reading_topic] || reading.reading_topic}</p>
      <p>{spreadLabels[reading.spread_type] || reading.spread_type}</p>
      <div
        className={`${styles["card-images"]} ${styles.truncate} ${styles["mobile-hidden"]}`}
      >
        {reading.card_names?.filter(Boolean).map((cardName, index) => (
          <img
            key={`${cardName}-${index}`}
            className={`${styles["card-image"]} ${
              cardName.endsWith(" rx") ? styles.reversed : ""
            }`}
            src={getCardImagePath(cardName)}
            alt={cardName.replace(/ rx$/, " (Reversed)")}
            title={cardName.replace(/ rx$/, " (Reversed)")}
            width={31}
            height={50}
            loading="lazy"
          />
        ))}
      </div>
      <p className={`${styles.truncate} ${styles["mobile-hidden"]}`}>
        {reading.notes}
      </p>
      <p className={`${styles.truncate} ${styles["mobile-hidden"]}`}>
        {reading.user_interpretation}
      </p>
      <div
        className={`${styles.truncate} ${styles["ai-interpretation"]} ${styles["mobile-hidden"]}`}
      >
        <ReactMarkdown>
          {reading.ai_interpretation
            ? getReadingSummary(reading.ai_interpretation)
            : ""}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default ReadingLog;
