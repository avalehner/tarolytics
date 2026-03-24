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
          type="text"
          placeholder="enter reading topic"
          value={customReadingTopic}
          onChange={(e) => setCustomReadingTopic(e.target.value)}
        />
      )}
    </div>
  )
}

export default ReadingTopicMenu