import ReactMarkdown from "react-markdown";
import styles from "./css/ReadingLog.module.css";
import type { ReadingTypes, CardTypes, ReadingWithCardTypes } from "../types";
import spreadLabels from "../data/spreadLabels";
import topicLabels from "../data/topicLabels";
import { useNavigate } from "react-router-dom";

interface ReadingLogProps {
  reading: ReadingWithCardTypes;
}

const ReadingLog = ({ reading }: ReadingLogProps) => {
  const getDate = () => {
    const date = new Date(reading.reading_date);
    return date.toLocaleDateString("en-US").replaceAll("/", ".");
  };

  const navigate = useNavigate();

  return (
    <div
      className={styles["reading-log"]}
      onClick={() => navigate(`/reading/${reading.id}`)}
    >
      <p>{getDate()}</p>
      <p>{topicLabels[reading.reading_topic] || reading.reading_topic}</p>
      <p>{spreadLabels[reading.spread_type] || reading.spread_type}</p>
      <p className={styles["truncate"]}>{reading.card_names?.join(", ")}</p>
      <p className={styles["truncate"]}>{reading.notes}</p>
      <p className={styles["truncate"]}>{reading.user_interpretation}</p>
      <div className={`${styles["truncate"]} ${styles["ai-interpretation"]}`}>
        <ReactMarkdown>{reading.ai_interpretation}</ReactMarkdown>
      </div>
    </div>
  );
};

export default ReadingLog;
