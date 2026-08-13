import styles from "./css/NavBar.module.css";
import { NavLink } from "react-router-dom";
import { UserTypes } from "../types";

interface NavBarProps {
  currentUser: UserTypes | null;
}

const NavBar = ({ currentUser }: NavBarProps) => {
  return (
    <nav>
      <ul className={styles["nav-left"]}>
        <li>
          <NavLink to="">PULL CARDS</NavLink>
        </li>
        <li>
          <NavLink to="/history">HISTORY</NavLink>
        </li>
        <li>
          <NavLink to="/analytics">ANALYTICS</NavLink>
        </li>
        {/* <li>
          <NavLink to="/astrology">ASTROLOGY</NavLink>
        </li> */}
      </ul>
      <ul className={styles["nav-right"]}>
        {currentUser ? (
          <>
            <li>
              <NavLink to="/profile">PROFILE</NavLink>
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
    </nav>
  );
};

export default NavBar;
