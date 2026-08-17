import styles from "./css/HowToPage.module.css";
import { UserTypes } from "../types";

interface HowToPageProps {
  currentUser: UserTypes | null;
  isAuthLoading: boolean;
}

const HowToPage = ({ currentUser, isAuthLoading }: HowToPageProps) => {
  return <div className={styles["how-to-page-container"]}></div>;
};

export default HowToPage;
