import './css/NavBar.css'
import { NavLink } from 'react-router-dom'
 
const NavBar = () => {
  return (
    <nav>
      <ul className="nav-left">
        <li><NavLink to="">TRACK</NavLink></li>
        <li><NavLink to="/analytics">ANALYTICS</NavLink></li>
        <li>PULL CARD</li>
      </ul>
      <ul className="nav-right">
        <li>DOWNLOAD IOS</li>
        <li>DOWNLOAD ANDROID</li>
      </ul>
    </nav>
  )
}

export default NavBar