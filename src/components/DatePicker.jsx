import './DatePicker.css'

const DatePicker = (date, setDate) => {
  return (
    <input 
        type="date" 
        value={date}
        placeholder="Enter date"
        onChange={(e) => setDate(e.target.value)} //when onchange fires it recieves an event object. this includes the target (input element), the target.value (what the user inputted), the target.name (name of the input)
    />
  )
}

export default DatePicker