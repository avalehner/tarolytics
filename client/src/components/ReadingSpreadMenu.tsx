import styles from './css/ReadingSpreadMenu.module.css'
import { useRef, useEffect } from 'react'

interface ReadingSpreadMenuProps {
  setCards?: (value:string[]) => void
  readingSpread: string 
  setReadingSpread: (value: string) => void
  customReadingSpread: string
  setCustomReadingSpread: (value: string) => void
}

const ReadingSpreadMenu = ({ 
  setCards,
  readingSpread, 
  setReadingSpread, 
  customReadingSpread, 
  setCustomReadingSpread 
}: ReadingSpreadMenuProps) => {

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
  }, [readingSpread])

  const handleReadingSpread = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setReadingSpread(e.target.value)
    setCards?.([''])
  }

  return (
    <div className={styles['spread-container']}>
      <div className={styles['spread-menu-container']}>
        <select ref={selectRef} className={styles['spread-menu']} value={readingSpread} onChange={handleReadingSpread}> 
          <option value="single-card">single card</option>
          <option value="top-bottom">top / bottom</option> 
          <option value="past-present-future">past present future</option>
          <option value="past-present-future-advice">past present future advice</option>
          <option value="celtic">celtic</option>
          <option value="custom">custom</option>
        </select>
      </div>

    {readingSpread === "custom" && (
      <input 
        className={styles['custom-spread-input']}
        type="text"
        placeholder="spread name"
        value={customReadingSpread}
        onChange={(e) => setCustomReadingSpread(e.target.value)}
      />
    )}
    </div>
  )
}

export default ReadingSpreadMenu