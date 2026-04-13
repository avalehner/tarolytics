import { useState, useEffect } from 'react'
import './css/ReadingLogPage.css'
import SearchMenu from '../components/SearchMenu'
import DatePicker from '../components/DatePicker'
import ReadingTopicMenu from '../components/ReadingTopicMenu'
import ReadingSpreadMenu from '../components/ReadingSpreadMenu'
import spreadConfig from '../data/spreadConfig'
import CardInput from '../components/CardInput'
import { getAllReadings } from '../services/readingService'
import { ReadingTypes } from '../types'
import ReadingLog from "../components/ReadingLog"

const ReadingLogPage = () => {
  const [searchCategory, setSearchCategory] = useState<string>('date')
  const [date, setDate] = useState<string>('')
  const [readingTopic, setReadingTopic] = useState<string>('card-of-day')
  const [customReadingTopic, setCustomReadingTopic] = useState<string>('')
  const [readingSpread, setReadingSpread] = useState<string>('top-bottom')
  const [customReadingSpread, setCustomReadingSpread] = useState<string>('')
  const [cards, setCards] = useState<string[]>([''])
  const [readings, setReadings] = useState<ReadingTypes[]>([])

  useEffect(()=> {
    getAllReadings()
      .then(data => setReadings(data))
  }, []) //[] tells react to only run the effect once on initial mount

  console.log(readings)

  const handleRemoveCard = (indexToRemove: number) => {
    setCards(cards.filter((_, index) => index !== indexToRemove))
    console.log('test')
  }

  const renderReadingLogs = () => {
    const readingsList = readings.map((reading, index)=> {
      if (index < readings.length -1) {
        return(
          <>
            <ReadingLog reading={reading}/>
            <hr /> 
          </>
        )
      } else {
        return(
          <ReadingLog reading={reading}/>
        )
      }
    })
    return readingsList
  }

  return (
    <>
      <h1>Tarolytics</h1>
      <div className="search-bar-container">
        <p className='search-label'>search by:</p>
        <SearchMenu 
          searchCategory={searchCategory}
          setSearchCategory={setSearchCategory}
        />
        {searchCategory === 'date' && <DatePicker date={date} setDate={setDate} />}
        {searchCategory === 'reading-topic' && <ReadingTopicMenu 
                                                  readingTopic={readingTopic} 
                                                  setReadingTopic={setReadingTopic}
                                                  customReadingTopic={customReadingTopic}
                                                  setCustomReadingTopic={setCustomReadingTopic} />}
        {searchCategory === 'spread-type' && <ReadingSpreadMenu 
                                                  readingSpread={readingSpread} 
                                                  setReadingSpread={setReadingSpread}
                                                  customReadingSpread={customReadingSpread}
                                                  setCustomReadingSpread={setCustomReadingSpread} />}
         {searchCategory === 'cards' && <button className="add-card-btn" onClick={() => setCards([...cards, ''])}>ADD CARD</button>}
      </div>
      {searchCategory === 'cards' && (
          <>
            <div className="all-card-inputs-container">
              {cards.map((_, index) => 
                <div key={index} className="search-card-input-wrapper">
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
        )}  
      <div className="reading-log-labels">
        <p>DATE</p>
        <p>TOPIC</p>
        <p>SPREAD</p>
        <p>CARDS</p>
        <p>NOTES</p>
        <p>INTERPRETATION</p>
      </div>
      <div className="reading-log-container">
        {renderReadingLogs()}
      </div>
    </>
  )
}

export default ReadingLogPage