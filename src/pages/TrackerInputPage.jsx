import { useState } from 'react'
import { createReading } from '../services/readingService' 
import DatePicker from '../components/DatePicker'
import ReadingTopicMenu from '../components/ReadingTopicMenu'
import ReadingSpreadMenu from '../components/ReadingSpreadMenu'
import spreadConfig from '../data/spreadConfig'
import CardInput from '../components/CardInput'
import './trackerInputPage.css'


const TrackerInputPage = () => {

  const [date, setDate] = useState('')
  const [readingTopic, setReadingTopic] = useState('card-of-day')
  const [customReadingTopic, setCustomReadingTopic] = useState('')
  const [readingSpread, setReadingSpread] = useState('top-bottom')
  const [customReadingSpread, setCustomReadingSpread] = useState('')
  const [card, setCard] = useState([''])
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const saveReading = async () => {
    setSaving(true)
    setMessage('')

    const reading = {
      reading_date: date, 
      reading_type: readingTopic === 'custom' ? customReadingTopic : readingTopic, 
      card: card.filter(c => c), //removes empty strings 
      notes: notes
    }

    const result = await createReading(reading)

    if(result.success) {
      setMessage('reading saved')
      setDate('')
      setCard([])
      setNotes('')
    } else {
      setMessage('error:' + result.error)
    }

    setSaving(false)
  }

  const renderCardInputs = (readingSpread) => {
    const labels = spreadConfig[readingSpread] || []

    const handleAddCard = () => setCard([...card, ''])

    const handleRemoveCard = (indexToRemove) => {
      setCard(card.filter((_, index) => index !== indexToRemove))
      console.log('test')
    }

    if (readingSpread === 'custom') {
      return (
        <>
        <button className="add-card-btn" onClick={() => handleAddCard()}>ADD CARD</button>
        {card.map((_, index) => 
            <div key={index} className="card-inputs-container">
              <CardInput 
                card={card}
                setCard={setCard} 
                label="select card"
                index={index}
              />
              <i className="fa-regular fa-x" onClick={() => handleRemoveCard(index)}></i>
            </div>
          )
        }
      </> 
      )
    }

    return (
      <div className="card-inputs-container">
        {labels.map((label, index) => 
          <CardInput 
            card={card}
            setCard={setCard}
            label={label}
            index={index}
            key={index}
          />
        )}
      </div>
    )
  }

  return (
    <>
      <h1>Tarolytics</h1>
      <DatePicker 
        date={date}
        setDate={setDate}
      />
      <ReadingTopicMenu 
        readingTopic={readingTopic}
        setReadingTopic={setReadingTopic}
        customReadingTopic={customReadingTopic}
        setCustomReadingTopic={setCustomReadingTopic}
      /> 
      <ReadingSpreadMenu 
        readingSpread = {readingSpread}
        setReadingSpread={setReadingSpread}
        customReadingSpread={customReadingSpread}  
        setCustomReadingSpread={setCustomReadingSpread}
      />

      {renderCardInputs(readingSpread)}   

      <div className="reading-notes">
        <input 
          type="text" 
          value={notes}
          placeholder="notes"
          onChange={(e) => setNotes(e.target.value)} 
        />
      </div>
      <div>
        <button className="save-reading-btn"
          onClick={saveReading}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'SAVE READING'}
        </button>
        <button className="upload-picture-btn"
          // onClick={saveReading}
          // disabled={saving}
        >
          UPLOAD PICTURE
        </button>
        {message && <p>{message}</p>}
      </div>
    </>
  )
}

export default TrackerInputPage
