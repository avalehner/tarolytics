import './ReadingTopicMenu.css'

const ReadingTopicMenu = ({ 
  readingTopic, 
  setReadingTopic, 
  customReadingTopic, 
  setCustomReadingTopic 
}) => {

  const handleReadingTopic = (e) => {
    setReadingTopic(e.target.value)
  }

  return (
    <div>
      <div className="topic-menu-container">
        <p className="topic-label">Topic:</p>
        <select className="topic-menu" value={readingTopic} onChange={handleReadingTopic}>
          <option value="card-of-day">Daily</option>
          <option value="love-reading">Love</option>
          <option value="health">Health</option>
          <option value="career">Career</option>
          <option value="finances">Finances</option>
          <option value="family">Family</option>
          <option value="custom">Custom</option>
        </select>
      </div>
      
      {readingTopic === 'custom' && (
          <input 
            type="text"
            placeholder="Enter reading topic"
            value={customReadingTopic}
            onChange={(e) => setCustomReadingTopic(e.target.value)}
          />
      )}
    </div>
  )
}

export default ReadingTopicMenu