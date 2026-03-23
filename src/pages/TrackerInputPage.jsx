import { useState } from 'react'
import { createReading } from '../services/readingService' 
import AddCardButton from '../components/AddCardButton'
import ReadingTopicMenu from '../components/ReadingTopicMenu'
import './trackerInputPage.css'


const TrackerInputPage = () => {

  const [date, setDate] = useState('')
  const [readingTopic, setReadingTopic] = useState('card-of-day')
  const [customReadingTopic, setCustomReadingTopic] = useState('')
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

  return (
    <>
      <h1>Tarolytics</h1>
      <input 
        type="date" 
        value={date}
        placeholder="Enter date"
        onChange={(e) => setDate(e.target.value)} //when onchange fires it recieves an event object. this includes the target (input element), the target.value (what the user inputted), the target.name (name of the input)
      />
      <ReadingTopicMenu 
        readingTopic={readingTopic}
        setReadingTopic={setReadingTopic}
        customReadingTopic={customReadingTopic}
        setCustomReadingTopic={setCustomReadingTopic}
      /> 
      <div id="card-inputs">
        <input 
          type="text" 
          placeholder="Enter card" 
          className="card-input"
          value={cards[0] || ''}
          onChange={(e) => setCards([e.target.value])}
        />
      <AddCardButton />
      </div>
      <div className="reading-notes">
        <input 
          type="text" 
          value={notes}
          placeholder="notes"
          onChange={(e) => setNotes(e.target.value)} 
        />
      </div>
      <div>
        <button
          onClick={saveReading}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Reading'}
        </button>
        {message && <p>{message}</p>}
      </div>
    </>
  )
}

export default TrackerInputPage
