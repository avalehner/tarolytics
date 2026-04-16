import { useState } from 'react'
import { createReading } from '../services/readingService'
import { saveCards } from '../services/cardsService'
import DatePicker from '../components/DatePicker'
import ReadingTopicMenu from '../components/ReadingTopicMenu'
import ReadingSpreadMenu from '../components/ReadingSpreadMenu'
import spreadConfig from '../data/spreadConfig'
import CardInput from '../components/CardInput'
import styles from './css/TrackerInputPage.module.css'

const TrackerInputPage = () => {

  const [date, setDate] = useState<string>('')
  const [readingTopic, setReadingTopic] = useState<string>('card-of-day')
  const [customReadingTopic, setCustomReadingTopic] = useState<string>('')
  const [readingSpread, setReadingSpread] = useState<string>('top-bottom')
  const [customReadingSpread, setCustomReadingSpread] = useState<string>('')
  const [cards, setCards] = useState<string[]>([''])
  const [notes, setNotes] = useState<string>('')
  const [interpretation, setInterpretation] = useState<string>('')
  const [saving, setSaving] = useState<boolean>(false)
  const [message, setMessage] = useState<string>('')

  const saveReading = async () => {
    setSaving(true)

    const readingRequestObj = {
      reading_date: date, 
      reading_topic: readingTopic === 'custom' ? customReadingTopic : readingTopic,
      spread_type: readingSpread ==='custom' ? customReadingSpread : readingSpread, 
      notes: notes, 
      interpretation: interpretation, 
    }

    try {
      const newReading = await createReading(readingRequestObj) 
      for (const [index, card] of cards.entries()) {
        const cardRequestObj = {
          reading_id: newReading.id, 
          card_name: card, 
          position_name: readingSpread === 'custom' ? null : spreadConfig[readingSpread][index], 
          position_order: index, 
        } 
        await saveCards(cardRequestObj)
      }

      setMessage('reading saved :)')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong' //checks if error is an error object, if it is we can access the error message, if not itll say 'Unknown error' since we dont know what was thrown. typescript doesn't know what's thrown, anything can eb thrown so we gotta make sure it's an error object
      setMessage(message)
    } finally {
      setSaving(false)
    }

  }

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
        <button className={styles["add-card-btn"]} onClick={() => handleAddCard()}>ADD CARD</button>
        <div className={styles["all-card-inputs-container"]}>
          {cards.map((_, index) => 
            <div key={index} className={styles["card-input-container"]}>
              <CardInput 
                cards={cards}
                setCards={setCards} 
                label="select card"
                index={index}
              />
              <i className="fa-regular fa-x" onClick={() => handleRemoveCard(index)}></i>
            </div>
          )}
        </div>
      </> 
      )
    }

    return (
      <div className={styles["all-card-inputs-container"]}>
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
      <div className={styles["reading-topic-menu-container"]}>
        <p className={styles["topic-label"]}>topic:</p>
        <ReadingTopicMenu 
          readingTopic={readingTopic}
          setReadingTopic={setReadingTopic}
          customReadingTopic={customReadingTopic}
          setCustomReadingTopic={setCustomReadingTopic}
        /> 
      </div>
      <div className={styles["reading-topic-menu-container"]}>
        <p className={styles["spread-label"]}>spread:</p>
        <ReadingSpreadMenu 
          readingSpread = {readingSpread}
          setReadingSpread={setReadingSpread}
          customReadingSpread={customReadingSpread}  
          setCustomReadingSpread={setCustomReadingSpread}
          setCards={setCards}
        />
      </div>

      {renderCardInputs(readingSpread)}   

      <div className={styles["reading-notes"]}>
        <input 
          type="text" 
          value={notes}
          placeholder="notes"
          onChange={(e) => setNotes(e.target.value)} 
        />
      </div>
      <div className={styles["reading-notes"]}>
        <input 
          type="text" 
          value={interpretation}
          placeholder="interpretation"
          onChange={(e) => setInterpretation(e.target.value)} 
        />
      </div>
      <div>
        <button className={styles["save-reading-btn"]}
          onClick={saveReading}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'SAVE READING'}
        </button>
        <button className={styles["upload-picture-btn"]}
          onClick={saveReading}
          disabled={saving}
        >
          UPLOAD PICTURE
        </button>
        {message && <p>{message}</p>}
      </div>
    </>
  )
}

export default TrackerInputPage
