import ReactMarkdown from "react-markdown";
import styles from "./css/ReadingLog.module.css";
import { ReadingTypes, CardTypes } from "../types";
import spreadLabels from "../data/spreadLabels";
import topicLabels from "../data/topicLabels";
import { useNavigate } from "react-router-dom";

interface ReadingLogProps {
  reading: ReadingTypes;
  cards: CardTypes[];
}

const ReadingLog = ({ reading, cards }: ReadingLogProps) => {
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
      <p className={styles["truncate"]}>
        {cards.map((card) => card.card_name).join(", ")}
      </p>
      <p className={styles["truncate"]}>{reading.notes}</p>
      <p className={styles["truncate"]}>{reading.user_interpretation}</p>
      <p className={`${styles["truncate"]} ${styles["ai-interpretation"]}`}>
        <ReactMarkdown>{reading.ai_interpretation}</ReactMarkdown>
      </p>
    </div>
  );
};

export default ReadingLog;
