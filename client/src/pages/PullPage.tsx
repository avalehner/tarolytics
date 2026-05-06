import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ReadingTypes, CardTypes } from '../types'
import { createReading } from '../services/readingService'
import { saveCards } from '../services/cardsService'
import { getRandomSequence } from '../services/randomService'
import { getCardImagePath } from '../util'
import ReadingSpreadMenu from "../components/ReadingSpreadMenu"
import ReadingTopicMenu from "../components/ReadingTopicMenu"
import DatePicker from '../components/DatePicker'
import styles from "./css/PullPage.module.css"
import spreadConfig from '../data/spreadConfig'
import tarotCards from '../data/tarotCards'
import spreadPositions from '../data/spreadPositions'

//figure out number of cards, pull them, dont pull duplicates, save labels for cards, route user to specific page for that reading 

const PullPage = () => {
  const [date, setDate] = useState<string>('')
  const [readingTopic, setReadingTopic] = useState<string>('daily')
  const [customReadingTopic, setCustomReadingTopic] = useState<string>('')
  const [readingSpread, setReadingSpread] = useState<string>('single-card')
  const [notes, setNotes] = useState<string>('')
  const [interpretation, setInterpretation] = useState<string>('')
  const [pulledCards, setPulledCards] = useState<string[]>([''])
  const [reading, setReading] = useState<ReadingTypes | null>(null)
  const [readingCards, setReadingCards ] = useState<CardTypes | null>(null)
  const [saving, setSaving] = useState<boolean>(false)
  const [message, setMessage] = useState<string>('')
  const [cardsPulled, setCardsPulled] = useState<boolean>(false)
  
  const pullCards = async () => {
    try{
      setCardsPulled(true)
      if(readingSpread === 'custom') {
        console.log('custom')
      } else {
        const numberOfCards = spreadConfig[readingSpread].length
        const randomSequence = await getRandomSequence(numberOfCards)
        console.log(randomSequence.length)
        const cardNames = randomSequence.map((number) => tarotCards[number - 1])
        setPulledCards(cardNames)
        console.log('pulled cards', cardNames)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown Error'
      console.error(message)
    }
  }

  const renderCardImage = (card: string, index: number) => {
    const { positions, cardWidth } = spreadPositions[readingSpread] 
    const position = positions[pulledCards.indexOf(card)]
    if(!position) return null //skip any card without a valid position 
    const {x, y, rotation, labelOffset} = position
    const cardImagePath = getCardImagePath(card)
    let cardRotation = rotation
    const labelRotation = cardRotation
    if (card.includes('rx')) cardRotation += 180
    const spreadType = readingSpread

    const labelStyle = labelOffset 
      ? { position: 'absolute' as const, 
          left: `${labelOffset.x}%`, 
          top: `${labelOffset.y}%`,
          transform: `rotate(${labelRotation}deg)` }
      : {transform: `rotate(${labelRotation}deg)`}

    return (
      <>
        <div className={styles['card-image-container']}
          style={{
            position: 'absolute', 
            left: `${x}%`, 
            top: `${y}%`, 
            width: `${cardWidth}%`,
            // transform: `rotate(${cardRotation}deg)`,
          }}
        >
          <img 
          className={styles['card-image']}
          src={`${cardImagePath}`}
          style={{ //style is a React prop that accepts a JS object which is y it need 2 brackets 
            transform: `rotate(${cardRotation}deg)`, 
            width: `100%`
          }}></img>
          <p
            className={styles['card-label']}
            style={labelStyle}
            >{spreadConfig[spreadType][index]}
          </p>
        </div>
      </>
    )
  }

  const saveReading = async () => {
    setSaving(true)

    const readingRequestObj = {
      reading_date: date, 
      reading_topic: readingTopic === 'custom' ? customReadingTopic : readingTopic, 
      spread_type: readingSpread, 
      notes: notes, 
      interpretation: interpretation
    }

    try {
      const newReading = await createReading(readingRequestObj)
      for (const [index, card] of pulledCards.entries()) {
        const cardRequestObj = {
          reading_id: newReading.id, 
          card_name: card, 
          position_name: spreadConfig[readingSpread][index], 
          position_order: index
        }
        await saveCards(cardRequestObj)
      }

      setMessage('reading saved :)')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Couldnt save reading [PullPage.tsx]'
      setMessage(message)
    } finally {
      setSaving(false)
    }
  }

  return(
    <div className={styles['pull-page-container']}>
      <h1>Pull Cards</h1>
      <DatePicker 
        date={date}
        setDate={setDate}
      /> 
      <ReadingTopicMenu 
        readingTopic={readingTopic}
        customReadingTopic={customReadingTopic}
        setReadingTopic={setReadingTopic}
        setCustomReadingTopic={setCustomReadingTopic}
      />
      <ReadingSpreadMenu 
        readingSpread={readingSpread}
        setReadingSpread={setReadingSpread}
        isDisabled={cardsPulled}
      />
      {!cardsPulled && <button className={styles['pull-card-btn']} onClick={pullCards}>Pull Cards</button>}
      {cardsPulled && 
      <div className={styles['additional-spread-information']}>
        <div className={styles['spread-display-container']}>
          {pulledCards.map((card, index) => renderCardImage(card, index))}
        </div>
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
          </div>
          {message && <p>{message}</p>}
        </div>}
    </div>
  )  
}

export default PullPage