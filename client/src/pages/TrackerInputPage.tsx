import { useState } from 'react'
// import { createReading } from '../services/readingService' 
import DatePicker from '../components/DatePicker'
import ReadingTopicMenu from '../components/ReadingTopicMenu'
import ReadingSpreadMenu from '../components/ReadingSpreadMenu'
import spreadConfig from '../data/spreadConfig'
import CardInput from '../components/CardInput'
import './TrackerInputPage.css'


const TrackerInputPage = () => {

  const [date, setDate] = useState<string>('')
  const [readingTopic, setReadingTopic] = useState<string>('card-of-day')
  const [customReadingTopic, setCustomReadingTopic] = useState<string>('')
  const [readingSpread, setReadingSpread] = useState<string>('top-bottom')
  const [customReadingSpread, setCustomReadingSpread] = useState<string>('')
  const [cards, setCards] = useState<string[]>([''])
  const [notes, setNotes] = useState<string>('')
  // const [saving, setSaving] = useState(false)
  // const [message, setMessage] = useState('')

  // const saveReading = async () => {
  //   console.log(cards)
    
  //   setSaving(true)
  //   setMessage('')

  //   const reading = {
  //     reading_date: date, 
  //     reading_topic: readingTopic === 'custom' ? customReadingTopic : readingTopic, 
  //     reading_spread: readingSpread === 'custom' ? customReadingSpread : readingSpread, 
  //     cards: cards.filter(c => c), //removes empty strings 
  //     notes: notes
  //   }

  //   const result = await createReading(reading)

  //   if(result.success) {
  //     setMessage('reading saved')
  //     setDate('')
  //     setCards([])
  //     setNotes('')
  //   } else {
  //     setMessage('error:' + result.error)
  //   }

  //   setSaving(false)
  // }

  const renderCardInputs = (readingSpread: string) => {
    const labels = spreadConfig[readingSpread] || []

    const handleAddCard = () => setCards([...cards, ''])

    const handleRemoveCard = (indexToRemove: number) => {
      setCards(cards.filter((_, index) => index !== indexToRemove))
      console.log('test')
    }

    if (readingSpread === 'custom') {
      return (
        <>
        <button className="add-card-btn" onClick={() => handleAddCard()}>ADD CARD</button>
        {cards.map((_, index) => 
            <div key={index} className="card-inputs-container">
              <CardInput 
                cards={cards}
                setCards={setCards} 
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
            cards={cards}
            setCards={setCards}
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
        setCards={setCards}
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
          // onClick={saveReading}
          // disabled={saving}
        >
          {/* {saving ? 'Saving...' : 'SAVE READING'} */}
          SAVE READING
        </button>
        <button className="upload-picture-btn"
          // onClick={saveReading}
          // disabled={saving}
        >
          UPLOAD PICTURE
        </button>
        {/* {message && <p>{message}</p>} */}
      </div>
    </>
  )
}

export default TrackerInputPage
