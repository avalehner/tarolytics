import './css/readingLog.css'
import { ReadingTypes } from '../types'

interface ReadingLogProps {
  reading: ReadingTypes
}

const ReadingLog = ({reading}: ReadingLogProps) => {
  return (
    <div className="reading-log">
      <p>{reading.reading_date}</p>
      <p>{reading.reading_topic}</p>
      <p>{reading.spread_type}</p>
      <p>[cards]</p>
      <p>{reading.notes}</p>
      <p>{reading.interpretation}</p>
    </div>
    
  )
}

export default ReadingLog 