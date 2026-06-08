import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./css/DatePicker.css";

interface DatePickerProps {
  date: Date | null;
  setDate: (value: Date | null) => void;
}

const DatePicker = ({ date, setDate }: DatePickerProps) => {
  return (
    <ReactDatePicker
      showYearDropdown
      showMonthDropdown
      dropdownMode="select"
      yearDropdownItemNumber={100}
      scrollableYearDropdown
      selected={date ? new Date(date) : null}
      onChange={(selectedDate: Date | null) => {
        if (selectedDate) setDate(selectedDate);
      }}
      placeholderText="mm/dd/yyyy"
      dateFormat="MM/dd/yyyy"
    />
  );
};

export default DatePicker;
