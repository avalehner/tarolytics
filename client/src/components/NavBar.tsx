import styles from "./css/NavBar.module.css";
import { NavLink } from "react-router-dom";
import { UserTypes } from "../types";
import { useEffect, useState } from "react";

interface NavBarProps {
  currentUser: UserTypes | null;
}

const NavBar = ({ currentUser }: NavBarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const closeMenuOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("keydown", closeMenuOnEscape);

    return () => document.removeEventListener("keydown", closeMenuOnEscape);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className={styles.nav}>
      <NavLink className={styles.brand} to="/" onClick={closeMenu}>
        Tarolytics
      </NavLink>

      <button
        className={`${styles["menu-toggle"]} ${isMenuOpen ? styles["menu-toggle-open"] : ""}`}
        type="button"
        aria-label={
          isMenuOpen ? "Close navigation menu" : "Open navigation menu"
        }
        aria-expanded={isMenuOpen}
        aria-controls="primary-navigation"
        onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
      >
        <span />
        <span />
        <span />
      </button>

      <div
        id="primary-navigation"
        className={`${styles["nav-menu"]} ${isMenuOpen ? styles["nav-menu-open"] : ""}`}
      >
        <ul className={styles["nav-left"]}>
          <li>
            <NavLink to="/" onClick={closeMenu}>
              PULL CARDS
            </NavLink>
          </li>
          <li>
            <NavLink to="/history" onClick={closeMenu}>
              HISTORY
            </NavLink>
          </li>
          <li>
            <NavLink to="/analytics" onClick={closeMenu}>
              ANALYTICS
            </NavLink>
          </li>
          <li>
            <NavLink to="/astrology" onClick={closeMenu}>
              ASTROLOGY
            </NavLink>
          </li>
        </ul>
        <ul className={styles["nav-right"]}>
          {currentUser ? (
            <>
              <li>
                <NavLink to="/how-to" onClick={closeMenu}>
                  HOW TO
                </NavLink>
              </li>
              <li>
                <NavLink to="/profile" onClick={closeMenu}>
                  PROFILE
                </NavLink>
              </li>
              <li>
                <a href="/auth/logout/">LOG OUT</a>
              </li>
            </>
          ) : (
            <li>
              <a href="/login/">LOG IN</a>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;
