"use client"

import './css/NavBar.css'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NavBar = () => {
  const pathname = usePathname()


   return (
    <nav>
      <ul className="nav-left">
        <li>
          <Link href="/" className={pathname === '/' ? 'active': ''}>TRACK</Link>
        </li>
        <li>ANALYTICS</li>
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