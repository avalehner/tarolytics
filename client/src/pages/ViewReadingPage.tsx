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
        <div className="month-day-container">
          <h1>{formatDate(reading.reading_date).month}</h1>
          <h1>{convertDayToWord(formatDate(reading.reading_date).day)}</h1>
        </div>
        <h2>{formatDate(reading.reading_date).year}</h2>
        <hr />
        <div className={styles["topic-container"]}>
          <p>topic:</p>
          <p>{reading.reading_topic}</p>
        </div>
        <div className={styles["spread-container"]}>
          <p>spread:</p>
          <p>{reading.spread_type}</p>
        </div>
        <div className={styles["reading-notes"]}>
          <p>notes:</p>
          <p>{reading.notes}</p>
        </div>
        <div className={styles["button-container"]}>
          <button className={styles["redit-reading-btn"]}>EDIT</button>
          <button className={styles["clarifyer-btn"]}>CLARIFYER</button>
        </div>
        <hr />
        <div className={styles["interpretation-container"]}>
          <p className={styles["interpretation"]}>[interpretation]</p>
        </div>
        <button className={styles["save-interpretation-btn"]}>SAVE INTERPRETATION</button>
      </div>
    </>
  )
}

export default ViewReadingPage