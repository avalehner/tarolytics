import { useState } from 'react'
import './css/ReadingLogPage.css'
import SearchMenu from '../components/SearchMenu'
import DatePicker from '../components/DatePicker'
import ReadingTopicMenu from '../components/ReadingTopicMenu'
import ReadingSpreadMenu from '../components/ReadingSpreadMenu'
import spreadConfig from '../data/spreadConfig'
import CardInput from '../components/CardInput'

const ReadingLogPage = () => {
  const [searchCategory, setSearchCategory] = useState<string>('')
  const [date, setDate] = useState<string>('')
  const [readingTopic, setReadingTopic] = useState<string>('card-of-day')
  const [customReadingTopic, setCustomReadingTopic] = useState<string>('')
  const [readingSpread, setReadingSpread] = useState<string>('top-bottom')
  const [customReadingSpread, setCustomReadingSpread] = useState<string>('')
  const [cards, setCards] = useState<string[]>([''])

  const handleRemoveCard = (indexToRemove: number) => {
    setCards(cards.filter((_, index) => index !== indexToRemove))
    console.log('test')
  }

  return (
    <>
      <h1>Tarolytics</h1>
      <div className="search-bar-container">
        <p className='search-label'>search:</p>
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
    </>
  )
}

export default ReadingLogPage