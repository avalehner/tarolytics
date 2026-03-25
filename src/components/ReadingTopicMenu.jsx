import './ReadingTopicMenu.css'
import { useRef, useEffect } from 'react'

const ReadingTopicMenu = ({ 
  readingTopic, 
  setReadingTopic, 
  customReadingTopic, 
  setCustomReadingTopic 
}) => {

  const selectRef = useRef(null)
  useEffect(() => {
    const selectEl = selectRef.current 
    if (!selectEl) return 
    const text = selectEl.options[selectEl.selectedIndex]?.text || ''
    const span = document.createElement('span')
    span.style.cssText = `visibility:hidden; position:absolute; font:${window.getComputedStyle(selectEl).font}`
    span.textContent = text 
    document.body.appendChild(span)
    selectEl.style.width = `${span.offsetWidth + 40}px`
    document.body.removeChild(span)
  }, [readingTopic])

  const handleReadingTopic = (e) => {
    setReadingTopic(e.target.value)
  }

  return (
    <div className="topic-container">
      <div className="topic-menu-container">
        <p className="topic-label">topic:</p>
        <select ref={selectRef}className="topic-menu" value={readingTopic} onChange={handleReadingTopic}>
          <option value="card-of-day">daily</option>
          <option value="love-reading">love</option>
          <option value="health">health</option>
          <option value="career">career</option>
          <option value="finances">finances</option>
          <option value="family">family</option>
          <option value="custom">custom</option>
        </select>
      </div>
      
      {readingTopic === 'custom' && (
        <input 
          className="card-input"
          type="text"
          placeholder="enter topic"
          value={customReadingTopic}
          onChange={(e) => setCustomReadingTopic(e.target.value)}
        />
      )}
    </div>
  )
}

export default ReadingTopicMenu