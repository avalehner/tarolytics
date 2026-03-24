import ReactDatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import './DatePicker.css'

const DatePicker = ({ date, setDate }) => {
  return (
    <ReactDatePicker
      selected={date}
      onChange={(selectedDate) => setDate(selectedDate)}
      placeholderText="mm/dd/yyyy"
      dateFormat="MM/dd/yyyy"
    />
  )
}

export default DatePicker