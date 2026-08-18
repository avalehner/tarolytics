import styles from "./css/HowToPage.module.css";
import { UserTypes } from "../types";

interface HowToPageProps {
  currentUser: UserTypes | null;
  isAuthLoading: boolean;
}

const HowToPage = ({ currentUser, isAuthLoading }: HowToPageProps) => {
  return (
    <div className={styles["how-to-page-container"]}>
      <p className={styles["title"]}>How to</p>
      <p className={styles["welcome-text"]}>
        Hello and welcome to Tarolytics! An app to help you track and manage
        your tarot readings digitally.
      </p>
      <p className={styles["bold"]}>Where should I get started?</p>
      <p>
        First you should{" "}
        <a className={styles["link"]} href="/login">
          log in
        </a>
        , so that all of your inputted tarot readings can be saved for the
        analytics tool. From there you can navigate to the{" "}
        <a className={styles["link"]} href="/">
          pull cards
        </a>{" "}
        tab at the top left of the screen and either input or generate a new
        tarot reading. You will be prompted to enter any 'notes' and
        'interpretations' you have about your reading before saving it.
      </p>
      <p>
        From there you can click 'View Reading' and you will navigate to a
        separate page that displays the cards from your reading, their meanings,
        and gives you the option to add clarifiers, update the reading, and
        generate an LLM powered interpretation to compare to your own.
      </p>
      <p className={styles["bold"]}>What else can this app do?</p>
      <p>
        You can access all of your saved readings on the{" "}
        <a className={styles["link"]} href="/history">
          history{" "}
        </a>
        page. From there you can navigate to each readings' specific page to
        make updates or look back at an old reading.
      </p>
      <p>
        The{" "}
        <a className={styles["link"]} href="/analytics">
          analytics
        </a>{" "}
        page shows aggregate analytics data for all of your saved readings. It
        also has a card search feature allowing you to search for a specific
        card and see how many times you've pulled that card in a specific time
        period, what notes were associated with that card when you pulled it.
      </p>
      <p>
        The{" "}
        <a className={styles["link"]} href="/profile">
          profile
        </a>{" "}
        page allows you to input you birth date and time to retrieve your
        astrology data which you can then view in the{" "}
        <a className={styles["link"]} href="/astrology">
          astrology
        </a>{" "}
        page. You do not need to input your birth data to use the tarot tracking
        features of Tarolytics, however if you do you will have the option to
        link your tarot reaing interpretations to your astrological chart.
      </p>
      <p className={styles["bold"]}>Why did I create this?</p>
      <p>
        Because I love tarot and frequently go through phases where I am pulling
        a tarot reading for myself every day. I used to write all of my tarot
        readings in a notebook with the intention of looking back at them at
        some point in order to remember how I was feeling at the time of the
        reading. However, I found it difficult to fully capture the reading in a
        way that would allow me to look back and understand my state of mind.
      </p>
      <p>
        I built Tarolytics to solve that problem and as a tool to further aid in
        the self-discovery that I access through tarot. I'm hoping you find it
        useful for your practice, enjoy :)
      </p>
      <p className={styles["ava"]}>- Ava</p>
    </div>
  );
};

export default HowToPage;
