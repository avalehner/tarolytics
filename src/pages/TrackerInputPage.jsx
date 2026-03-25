import { useState } from 'react'
import { createReading } from '../services/readingService' 
import DatePicker from '../components/DatePicker'
import AddCardButton from '../components/AddCardButton'
import ReadingTopicMenu from '../components/ReadingTopicMenu'
import ReadingSpreadMenu from '../components/ReadingSpreadMenu'
import './trackerInputPage.css'


const TrackerInputPage = () => {

  const [date, setDate] = useState('')
  const [readingTopic, setReadingTopic] = useState('card-of-day')
  const [customReadingTopic, setCustomReadingTopic] = useState('')
  const [readingSpread, setReadingSpread] = useState('top-bottom')
  const [customReadingSpread, setCustomReadingSpread] = useState('')
  const [cards, setCards] = useState([''])
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  // const addCard = () => {
  //   const newCards = [...cards, '']
  //   setCards(newCards)
  // }

  // const updateCard = (index, value) => { //index (which card to update), value (new text)
  //   const newCards = [...cards]
  //   newCards[index] = value 
  //   setCards(newCards)
  // }

  // const removeCard = (index) => {
  //   const newCards = [...cards].filter()
  // }

  const saveReading = async () => {
    setSaving(true)
    setMessage('')

    const reading = {
      reading_date: date, 
      reading_type: readingTopic === 'custom' ? customReadingTopic : readingTopic, 
      cards: cards.filter(c => c), //removes empty strings 
      notes: notes
    }

    const result = await createReading(reading)

    if(result.success) {
      setMessage('reading saved')
      setDate('')
      setCards([])
      setNotes('')
    } else {
      setMessage('error:' + result.error)
    }

    setSaving(false)
  }

  const handleCardInputs = (readingSpread) => {
    if (readingSpread === 'single-card') {
       return (
        <div id="card-inputs">
            <input 
              type="text" 
              placeholder="enter card" 
              className="card-input"
              value={cards[0] || ''}
              onChange={(e) => setCards([e.target.value])}
            /> 
          </div>
       )
    } else if (readingSpread === 'top-bottom') {
      return (
        <div id="card-inputs">
          <input 
            type="text" 
            placeholder="top card" 
            className="card-input"
            value={cards[0] || ''}
            onChange={(e) => setCards([e.target.value])}
          /> 
          <input 
            type="text" 
            placeholder="bottom card" 
            className="card-input"
            value={cards[0] || ''}
            onChange={(e) => setCards([e.target.value])}
          /> 
        </div>
      )
    } else if (readingSpread === 'past-present-future') {
      return (
         <div id="card-inputs">
          <input 
            type="text" 
            placeholder="past" 
            className="card-input"
            value={cards[0] || ''}
            onChange={(e) => setCards([e.target.value])}
          /> 
          <input 
            type="text" 
            placeholder="present" 
            className="card-input"
            value={cards[0] || ''}
            onChange={(e) => setCards([e.target.value])}
          /> 
          <input 
            type="text" 
            placeholder="future" 
            className="card-input"
            value={cards[0] || ''}
            onChange={(e) => setCards([e.target.value])}
          /> 
        </div>
      )
    } else if (readingSpread === 'past-present-future-advice') {
      return (
        <div id="card-inputs">

          <input 
            type="text" 
            placeholder="past" 
            className="card-input"
            value={cards[0] || ''}
            onChange={(e) => setCards([e.target.value])}
          /> 
          <input 
            type="text" 
            placeholder="present" 
            className="card-input"
            value={cards[0] || ''}
            onChange={(e) => setCards([e.target.value])}
          /> 
          <input 
            type="text" 
            placeholder="future" 
            className="card-input"
            value={cards[0] || ''}
            onChange={(e) => setCards([e.target.value])}
          />
          <input 
            type="text" 
            placeholder="advice" 
            className="card-input"
            value={cards[0] || ''}
            onChange={(e) => setCards([e.target.value])}
          />  
        </div>
      )
    } else if (readingSpread === 'celtic') {
      return (
        <div id="card-inputs">
          <p></p>
          <input 
            type="text" 
            placeholder="1. situation" 
            className="card-input"
            value={cards[0] || ''}
            onChange={(e) => setCards([e.target.value])}
          /> 
          <input 
            type="text" 
            placeholder="2. challenge" 
            className="card-input"
            value={cards[0] || ''}
            onChange={(e) => setCards([e.target.value])}
          /> 
          <input 
            type="text" 
            placeholder="3. focus" 
            className="card-input"
            value={cards[0] || ''}
            onChange={(e) => setCards([e.target.value])}
          />
          <input 
            type="text" 
            placeholder="4. recent past" 
            className="card-input"
            value={cards[0] || ''}
            onChange={(e) => setCards([e.target.value])}
          />
          <input 
            type="text" 
            placeholder="5. possibilities" 
            className="card-input"
            value={cards[0] || ''}
            onChange={(e) => setCards([e.target.value])}
          /> 
          <input 
            type="text" 
            placeholder="6. near future" 
            className="card-input"
            value={cards[0] || ''}
            onChange={(e) => setCards([e.target.value])}
          /> 
          <input 
            type="text" 
            placeholder="7. power" 
            className="card-input"
            value={cards[0] || ''}
            onChange={(e) => setCards([e.target.value])}
          />
          <input 
            type="text" 
            placeholder="8. environment" 
            className="card-input"
            value={cards[0] || ''}
            onChange={(e) => setCards([e.target.value])}
          /> 
          <input 
            type="text" 
            placeholder="9. hopes" 
            className="card-input"
            value={cards[0] || ''}
            onChange={(e) => setCards([e.target.value])}
          />
          <input 
            type="text" 
            placeholder="10. outcomes" 
            className="card-input"
            value={cards[0] || ''}
            onChange={(e) => setCards([e.target.value])}
          />  
        </div>
      ) 
    } else {
      return (
        <div>
          <input 
            type="text" 
            placeholder="enter card" 
            className="card-input"
            value={cards[0] || ''}
            onChange={(e) => setCards([e.target.value])}
          /> 
          <AddCardButton /> 
        </div>
      )
    }
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

      {handleCardInputs(readingSpread)}   

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
