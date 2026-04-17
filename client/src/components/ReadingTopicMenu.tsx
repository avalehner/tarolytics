import styles from './css/ReadingTopicMenu.module.css'
import { useRef, useEffect } from 'react'

interface ReadingTopicMenuProps {
  readingTopic: string 
  setReadingTopic: (value: string) => void 
  customReadingTopic: string 
  setCustomReadingTopic: (value: string) => void 
}

const ReadingTopicMenu = ({ 
  readingTopic, 
  setReadingTopic, 
  customReadingTopic, 
  setCustomReadingTopic 
}: ReadingTopicMenuProps) => {

  const selectRef = useRef<HTMLSelectElement>(null)

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

  return (
    <div className={styles['topic-container']}>
      <div className={styles['topic-menu-container']}>
        <select ref={selectRef} className={styles['topic-menu']} value={readingTopic} onChange={e=> setReadingTopic(e.target.value)}>
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
          className={styles['custom-topic-input']}
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