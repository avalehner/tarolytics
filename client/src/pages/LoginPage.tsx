import styles from "./css/LoginPage.module.css";
import { useEffect } from "react";

const LoginPage = () => {
  useEffect(() => {
    document.body.classList.add("login-page-bg");
    return () => document.body.classList.remove("login-page-bg");
  }, []);

  return (
    <>
      <div className={styles["login-container"]}>
        <h1 className={styles["welcome-text"]}>welcome to</h1>
        <h1 className={styles["tarolytics"]}>Tarolytics</h1>
        <button className={styles["login-btn"]}>
          <a href="/auth/google">LOG IN</a>
        </button>
      </div>
    </>
  );
};

export default LoginPage;
