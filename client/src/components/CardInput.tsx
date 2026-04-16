import styles from "./css/CardInput.module.css"
import tarotCards from "../data/tarotCards"
import { useRef, useEffect } from 'react'

interface CardInputProps {
  cards: string[]
  setCards: (value:string[]) => void 
  label: string
  index: number  
}

const CardInput = ({ cards, setCards, label, index }: CardInputProps) => {
  
  const selectRef = useRef<HTMLSelectElement>(null)
  useEffect(() => {
    const selectEl = selectRef.current
    if(!selectEl) return 
    const text = selectEl.options[selectEl.selectedIndex]?.text || ''
    const span = document.createElement('span')
    span.style.cssText = `visibility:hidden; position:absolute; font:${window.getComputedStyle(selectEl).font}`
    span.textContent = text
    document.body.appendChild(span)
    selectEl.style.width = `${span.offsetWidth + 40}px`
    document.body.removeChild(span)
  }, [cards])

  const updateCard = (index: number, value: string) => { //index (which card to update), value (new text)
    const newCard = [...cards] //copies the cards array 
    newCard[index] = value 
    setCards(newCard)
  }

  const getFilteredCards = (index: number) => {
    const otherSelectedCards = cards.filter((_, i) => i !== index)
    const availableCards = tarotCards.filter(cardName => !otherSelectedCards.includes(cardName))
    return availableCards 
  }

  return (
    <div>
      <select ref={selectRef} value={cards[index] || ''} className={styles['card-input']} onChange={e => updateCard(index, e.target.value)}>
        <option value="" disabled>{label}</option>
         {getFilteredCards(index).map((cardName) => <option key={cardName} value={cardName}>{cardName}</option>)}    
      </select> 
    </div>
  )
}

export default CardInput