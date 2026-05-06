import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ReadingTypes, CardTypes } from '../types'
import { createReading } from '../services/readingService'
import { saveCards } from '../services/cardsService'
import { getRandomSequence } from '../services/randomService'
import ReadingSpreadMenu from "../components/ReadingSpreadMenu"
import ReadingTopicMenu from "../components/ReadingTopicMenu"
import styles from "./css/PullPage.module.css"
import spreadConfig from '../data/spreadConfig'
import tarotCards from '../data/tarotCards'

//figure out number of cards, pull them, dont pull duplicates, save labels for cards, route user to specific page for that reading 

const PullPage = () => {
  const [readingTopic, setReadingTopic] = useState<string>('daily')
  const [customReadingTopic, setCustomReadingTopic] = useState<string>('')
  const [readingSpread, setReadingSpread] = useState<string>('single-card')
  const [pulledCards, setPulledCards] = useState<string[]>([''])
  const [reading, setReading] = useState<ReadingTypes | null>(null)
  const [readingCards, setReadingCards ] = useState<CardTypes | null>(null)
  
  const pullCards = async () => {
    try{
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

  return(
    <div className={styles['pull-page-container']}>
      <h1>Pull Card</h1>
      <ReadingTopicMenu 
        readingTopic={readingTopic}
        customReadingTopic={customReadingTopic}
        setReadingTopic={setReadingTopic}
        setCustomReadingTopic={setCustomReadingTopic}
      />
      <ReadingSpreadMenu 
        readingSpread={readingSpread}
        setReadingSpread={setReadingSpread}
      />
      <button onClick={pullCards}>Pull Cards</button>
    </div>
  )  
}

export default PullPage