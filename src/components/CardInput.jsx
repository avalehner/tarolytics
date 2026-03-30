import './CardInput.css'
import { tarotCards } from '../data/tarotCards'
import { useRef, useEffect } from 'react'

const CardInput = ({ card, setCard, label, index }) => {
  
  const selectRef = useRef(null)
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
  }, [card])
  
  

  const updateCard = (index, value) => { //index (which card to update), value (new text)
    const newcard = [...card] //copies the cards array 
    newcard[index] = value 
    setCard(newcard)
  }

  return (
    <div>
      {/* <p>{label}</p> */}
      <select type="text" value={card[index] || ''} className="card-input" onChange={(e) => updateCard(index, e.target.value)}>
        <option value="">{label}</option>
         {tarotCards.map((cardName) => <option key={cardName} value={cardName}>{cardName}</option>)}    
      </select> 
    </div>
  )
}

export default CardInput