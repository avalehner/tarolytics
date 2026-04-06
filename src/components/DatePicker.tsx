"use client"

import ReactDatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import './css/DatePicker.css'

interface DatePickerProps {
  date: string 
  setDate: (value:string) => void 
}

const DatePicker= ({ date, setDate }: DatePickerProps)  => {
  return (
    <ReactDatePicker
      selected={date ? new Date(date) : null}
      onChange={(selectedDate: Date | null) => {
        if (selectedDate) setDate(selectedDate.toISOString().split('T')[0]) //converts selecteddate back into a string for the setDate function, react-date-picker only uses react Date type
      }}
      placeholderText="mm/dd/yyyy"
      dateFormat="MM/dd/yyyy"
    /> 
  )
}

export default DatePicker 