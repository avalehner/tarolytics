'use client'

import { useState } from 'react'
import './page.css' 
import CardInput from '@/components/CardInput'
import DatePicker from '@/components/DatePicker'
import ReadingSpreadMenu from '@/components/ReadingSpreadMenu'
import ReadingTopicMenu from '@/components/ReadingTopicMenu'
import spreadConfig from '@/data/spreadConfig'

const HomePage = () => {

  const [date, setDate] =useState<string>('')
  const [readingSpread, setReadingSpread] = useState<string>('top-bottom')
  const [customReadingSpread, setCustomReadingSpread] = useState<string>('')
  const [readingTopic, setReadingTopic] = useState<string>('card-of-day')
  const [customReadingTopic, setCustomReadingTopic] = useState<string>('')
  const [cards, setCards] = useState<string[]>([''])
  const [notes, setNotes] = useState<string>('')

  const handleAddCard = () => setCards([...cards, '']) //empty card slot to render new card input
    
  const handleRemoveCard = (indexToRemove: number) => {
    const removedCardsArr = cards.filter((_, index) => index !== indexToRemove)
    setCards(removedCardsArr)
  }


  const renderCardInputs = (readingSpread: string) => {
    const labels = spreadConfig[readingSpread] || [] //[] to handle situation where spreadConfig is falsy 

    if (readingSpread === 'custom') {
      return (
        <>
        <button className="add-card-btn" onClick={handleAddCard}>ADD CARD</button>
        {cards.map((_, index) => 
          <div key={index} className="card-inputs-container">
          <CardInput
            cards={cards} 
            setCards={setCards}
            label={spreadConfig[readingSpread][0]}
            index={index}
          /> 
          <i className="fa-regular fa-x" onClick={() => handleRemoveCard(index)}></i>
        </div>
        )}
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
          )
        }
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
        setCards={setCards}
        readingSpread={readingSpread}
        setReadingSpread={setReadingSpread}
        customReadingSpread={customReadingSpread}
        setCustomReadingSpread={setCustomReadingSpread}
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
        <button className="save-reading-btn">SAVE READING</button>
        <button className="upload-picture-btn">UPLOAD PICTURE</button>
      </div>
    </>
  )

}


export default HomePage

