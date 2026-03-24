import './ReadingSpreadMenu.css'

const ReadingSpreadMenu = ({ 
  readingSpread, 
  setReadingSpread, 
  customReadingSpread, 
  setCustomReadingSpread 
}) => {

  const handleReadingSpread = (e) => {
    setReadingSpread(e.target.value)
  }

  return (
    <div>
      <div className="spread-menu-container">
        <p className="spread-label">Spread:</p>
        <select className="topic-menu" value={readingSpread} onChange={handleReadingSpread}> 
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
        type="text"
        placeholder="enter spread"
        value={customReadingSpread}
        onChange={(e) => setCustomReadingSpread(e.target.value)}
      />
    )}
    </div>
  )
}

export default ReadingSpreadMenu