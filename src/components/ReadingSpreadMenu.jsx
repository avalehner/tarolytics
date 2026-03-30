import './ReadingSpreadMenu.css'
import { useRef, useEffect } from 'react'

const ReadingSpreadMenu = ({ 
  readingSpread, 
  setReadingSpread, 
  customReadingSpread, 
  setCustomReadingSpread 
}) => {

  const selectRef = useRef(null)
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

  const handleReadingSpread = (e) => {
    setReadingSpread(e.target.value)
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