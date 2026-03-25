import { useState } from 'react'

const AddCardButton = () => {
  const [cardInputs, setCardInputs] = useState([])

  const handleAddCard = () => {
    setCardInputs([...cardInputs, { id: Date.now()} ])
  }

  const handleRemoveCard = (idToRemove) => {
    setCardInputs(cardInputs.filter(card => card.id !== idToRemove))
  }

  return (
    <>
      {/* Add button */}
      <i 
        className="fa-solid fa-plus" 
        onClick={() => handleAddCard()}
      ></i>

      {/* Card inputs container */}
      <div id="card-input">
        {cardInputs.map(card => (
          <div key={card.id} >
            <input type="text" className="card-input" placeholder="Enter card" />
            <i 
              className="fa-solid fa-xmark remove-card-btn" 
              onClick={() => handleRemoveCard(card.id)}
            ></i>
          </div>
        ))}
      </div> 
    </>
  )
}

export default AddCardButton