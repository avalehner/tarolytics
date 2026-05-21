import styles from "./css/LoginPage.module.css";
import { NavLink } from "react-router-dom";

const LoginPage = () => {
  return (
    <>
      <div className={styles["login-container"]}>
        <h1 className={styles["welcome-text"]}>welcome to</h1>
        <h1 className={styles["tarolytics"]}>Tarolytics</h1>
        <button className={styles["login-btn"]}>
          <a href="http://localhost:3000/auth/google">LOG IN</a>
        </button>
      </div>
    </>
  );
};

export default LoginPage;
