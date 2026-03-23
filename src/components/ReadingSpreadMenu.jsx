import './ReadingSpreadMenu.css'

const ReadingSpreadMenu = (readingSpread, setReadingSpread) => {

  const handleReadingSpread = (e) => {
    setReadingSpread(e.event.target)
  }

  return (
    <div className="spread-menu-container">
      <p className="spread-label">Spread:</p>
      <select className="topic-menu" value={readingSpread} onChange={handleReadingSpread}> 
        <option value="top-bottom">top / bottom</option>
        <option value="single-card">single card</option>
        <option value="past-present-future">past present future</option>
        <option value="past-present-future-advice">past present future advice</option>
        <option value="celtic">celtic</option>
      </select>
    </div>
  )
}

export default ReadingSpreadMenu