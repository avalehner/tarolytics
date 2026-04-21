import styles from './css/NavBar.module.css'
import { NavLink } from 'react-router-dom'
 
const NavBar = () => {
  return (
    <nav>
      <ul className={styles['nav-left']}>
        <li><NavLink to="">TRACK</NavLink></li>
        <li><NavLink to="/analytics">ANALYZE</NavLink></li>
        <li>PULL CARD</li>
      </ul>
      <ul className={styles['nav-right']}>
        <li><NavLink to="/login/">LOG IN</NavLink></li>
      </ul>
    </nav>
  )
}

export default NavBar