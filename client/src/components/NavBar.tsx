import styles from './css/NavBar.module.css'
import { NavLink } from 'react-router-dom'
 
const NavBar = () => {
  return (
    <nav>
      <ul className={styles['nav-left']}>
        <li><NavLink to="">TRACK</NavLink></li>
        <li><NavLink to="/analytics">ANALYTICS</NavLink></li>
        <li>PULL CARD</li>
      </ul>
      <ul className={styles['nav-right']}>
        <li>DOWNLOAD IOS</li>
        <li>DOWNLOAD ANDROID</li>
      </ul>
    </nav>
  )
}

export default NavBar