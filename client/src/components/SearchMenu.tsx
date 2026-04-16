import styles from './css/SearchMenu.module.css'
import { useRef, useEffect } from 'react'

interface SearchMenuProps {
  searchCategory: string 
  setSearchCategory: (value: string) => void 
}

const SearchMenu = ({searchCategory, setSearchCategory}: SearchMenuProps) => {
  
  const selectRef = useRef<HTMLSelectElement>(null)
  
  useEffect(() => {
    const selectEl = selectRef.current
    if(!selectEl) return 
    const text = selectEl.options[selectEl.selectedIndex]?.text || ''
    const span = document.createElement('span')
    span.style.cssText = `visibility:hidden; position:absolute; font:${window.getComputedStyle(selectEl).font}`
    span.textContent = text
    document.body.appendChild(span)
    selectEl.style.width = `${span.offsetWidth + 40}px`
    document.body.removeChild(span)
  }, [searchCategory])

  return(
    <div className={styles['search-menu-container']}>
      <select ref={selectRef} className={styles['search-menu']} value={searchCategory} onChange={e=> setSearchCategory(e.target.value)}>
        <option value="all">all</option>
        <option value="date">date</option>
        <option value="reading-topic">reading topic</option>
        <option value="spread-type">spread type</option>
        <option value="cards">cards</option>
      </select>
    </div>  
  )
}

export default SearchMenu 