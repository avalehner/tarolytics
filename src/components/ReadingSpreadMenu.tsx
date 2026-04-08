'use client'

import './css/ReadingSpreadMenu.css'
import { useRef, useEffect } from 'react'

interface ReadingSpreadMenuProps{ 
  setCards: (value: string[]) => void 
  readingSpread: string 
  setReadingSpread: (value: string) => void
  customReadingSpread: string 
  setCustomReadingSpread: (value: string) => void
}

const ReadingSpreadMenu = ({setCards, readingSpread, setReadingSpread, customReadingSpread, setCustomReadingSpread}: ReadingSpreadMenuProps) => {
  
  const selectRef = useRef<HTMLSelectElement>(null)
  useEffect(()=> {
    const selectEl = selectRef.current 
    if(!selectEl) return 
    const text = selectEl.options[selectEl.selectedIndex]?.text || '' //selectedIndex returns index of currently selected option 
    const span = document.createElement('span')
    span.style.cssText = `visibility:hidden; position:absolute; font:${window.getComputedStyle(selectEl).font}`
    span.textContent = text 
    document.body.appendChild(span)
    selectEl.style.width = `${span.offsetWidth + 40}px`
    document.body.removeChild(span)
  }, [readingSpread])

  const handleReadingSpread = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setReadingSpread(e.target.value)
    setCards([]) //need to reset cards array if changing spread 
  }

  return (
     <div className="spread-container">
      <div className="spread-menu-container">
        <p className="spread-label">spread:</p>
        <select ref={selectRef} className="spread-menu" value={readingSpread} onChange={handleReadingSpread}> 
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
        className="card-input"
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