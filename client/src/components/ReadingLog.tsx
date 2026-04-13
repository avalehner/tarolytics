import './css/readingLog.css'
import { ReadingTypes } from '../types'
import spreadLabels from '../data/spreadLabels'
import topicLabels from '../data/topicLabels'

interface ReadingLogProps {
  reading: ReadingTypes
}

const ReadingLog = ({reading}: ReadingLogProps) => {
  
  const getDate = () => {
    const date = new Date(reading.reading_date)
    return date.toLocaleDateString('en-US').replaceAll('/', '.')
  }


  return (
    <div className="reading-log">
      <p>{getDate()}</p>
      <p>{topicLabels[reading.reading_topic] || reading.reading_topic}</p>
      <p>{spreadLabels[reading.spread_type] || reading.spread_type}</p>
      <p>[cards]</p>
      <p>{reading.notes}</p>
      <p>{reading.interpretation}</p>
    </div>
    
  )
}

export default ReadingLog 