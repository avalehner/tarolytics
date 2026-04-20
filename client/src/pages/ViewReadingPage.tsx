import styles from './css/ViewReadingPage.module.css'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getReadingById } from '../services/readingService'
import { ReadingTypes, CardTypes } from '../types'
import { format } from "date-fns"
import { convertDayToWord } from '../util'
import { getCardsByReadingId } from '../services/cardsService'
import { getCardImagePath } from '../util'
import spreadPositions from '../data/spreadPositions'
import topicLabels from '../data/topicLabels'
import spreadLabels from '../data/spreadLabels'
import spreadConfig from '../data/spreadConfig'

const ViewReadingPage = () => {
  const [reading, setReading] = useState<ReadingTypes | null>(null) //because this holds a single reading which is just an object, there is no way to represent an empty object so we have to write null
  const [cards, setCards] = useState<CardTypes[]>([])

  const { readingId } = useParams()

  useEffect (() => {
     if (!readingId) return //makes sure readingId is not null
    getReadingById(readingId)
      .then(data => setReading(data))

    getCardsByReadingId(readingId)
      .then(data => setCards(data))
  }, [readingId])

  if (!reading) return //makes sure reading is not null

  const formatDate = (date: string) => {
    const rawDate = date.slice(0,10)
    const unformattedDate = new Date(rawDate + 'T00:00:00')
    return {
      month: format(unformattedDate, 'MMMM'),
      day: Number(format(unformattedDate, 'dd')),
      year: format(unformattedDate, 'yyyy'), 
    }
  }

  const renderCardImage = (card: CardTypes, index: number) => {
    const {positions, cardWidth} = spreadPositions[reading.spread_type]
    const {x, y, rotation, labelOffset} = positions[card.position_order]
    const cardImagePath = getCardImagePath(card.card_name)
    let cardRotation = rotation
    const labelRotation = cardRotation
    if (card.card_name.includes('rx')) cardRotation += 180
    const spreadType = reading.spread_type

    const labelStyle = labelOffset 
      ? { position: 'absolute' as const, 
          left: `${labelOffset.x}%`, 
          top: `${labelOffset.y}%`,
          transform: `rotate(${labelRotation}deg)` }
      : {transform: `rotate(${labelRotation}deg)`}

    return (
      <>
        <div className={styles['card-label-container']}
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
            >{spreadConfig[spreadType][index]}</p>
        </div>
      </>
    )
  }

  return (
    <>
      <div className={styles['view-reading-container']}>
        <div className={styles["reading-info-container"]}>
          <div className={styles["month-day-container"]}>
            <h1 className={styles['month']}>{formatDate(reading.reading_date).month}</h1>
            <h1 className={styles['day']}>{convertDayToWord(formatDate(reading.reading_date).day)}</h1>
          </div>
          <h2 className={styles["year"]}>{formatDate(reading.reading_date).year}</h2>
          <hr className={styles['aesthetic-divider']}/>
          <div className={styles['details-container']}>
            <div className={styles["topic-container"]}>
              <p>topic:</p>
              <p>{topicLabels[reading.reading_topic] || reading.reading_topic}</p>
            </div>
            <div className={styles["spread-container"]}>
              <p>spread:</p>
              <p>{spreadLabels[reading.spread_type] || reading.spread_type}</p>
            </div>
            <div className={styles["notes-container"]}>
              <p>notes:</p>
              <p>{reading.notes}</p>
            </div>
          </div>
          <div className={styles["button-container"]}>
            <button className={styles["edit-reading-btn"]}>EDIT</button>
            <button className={styles["clarifyer-btn"]}>CLARIFYER</button>
          </div>
          <hr className={styles['aesthetic-divider']}/>
          <div className={styles["interpretation-card"]}>
            <p className={styles["interpretation"]}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod  tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi  ut aliquip ex ea commodo consequat. Duis aute irure dolor in  reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla  pariatur.
            </p>
          </div>
          <button className={styles["save-interpretation-btn"]}>SAVE INTERPRETATION</button>
        </div>
        <div className={styles['spread-display-container']}>
          {cards.map((card, index) => renderCardImage(card, index))}
        </div>
      </div>
    </>
  )
}

export default ViewReadingPage