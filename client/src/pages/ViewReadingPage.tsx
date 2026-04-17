import styles from './css/ViewReadingPage.module.css'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getReadingById } from '../services/readingService'
import { ReadingTypes } from '../types'
import { format } from "date-fns"
import { convertDayToWord } from '../util'

const ViewReadingPage = () => {
  const [reading, setReading] = useState<ReadingTypes | null>(null)

  const { readingId } = useParams()

  useEffect (() => {
     if (!readingId) return //makes sure readingId is not null
    getReadingById(readingId)
      .then(data => setReading(data))
  }, [readingId])

  console.log(reading)

  if (!reading) return //makes sure reading is not null

  const formatDate = (date: string) => {
    const rawDate = date.slice(0,10)
    const unformattedDate = new Date(rawDate)
    return {
      month: format(unformattedDate, 'MMMM'),
      day: Number(format(unformattedDate, 'dd')),
      year: format(unformattedDate, 'yyyy'), 
    }
  }

  return (
    <>
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
            <p>{reading.reading_topic}</p>
          </div>
          <div className={styles["spread-container"]}>
            <p>spread:</p>
            <p>{reading.spread_type}</p>
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
    </>
  )
}

export default ViewReadingPage