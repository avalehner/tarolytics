import { useState } from 'react'
import { createReading, getReadingsByDate, getAllReadings, updateReading, deleteReading } from '../services/readingService'

function TestServiceFunctionsComponent() {
  const [resultOne, setResultsOne] = useState(null)
  const [loadingOne, setLoadingOne] = useState(false)
  const [resultTwo, setResultsTwo] = useState(null)
  const [loadingTwo, setLoadingTwo] = useState(false)
  const [resultThree, setResultsThree] = useState(null)
  const [loadingThree, setLoadingThree] = useState(false)
  const [resultFour, setResultsFour] = useState(null)
  const [loadingFour, setLoadingFour] = useState(false)
  const [loadingFive, setLoadingFive] = useState(false)

  const testCreateReading = async () => {
    setLoadingOne(true)
    setResultsOne(null)

    //create test data 
    const testReading = {
      reading_date: new Date().toISOString().split('T')[0], //today's date 
      reading_type: 'card-of-day', 
      cards: [
        {
          name: 'The Fool', 
          position: 1, 
          reversed: false
        }
      ], 
      notes: 'test reading'
    }

    console.log('sending test data:', testReading)

    //call service function 
    const resultOne = await createReading(testReading)

    console.log('Recieved results:', resultOne)
    setResultsOne(resultOne)
    setLoadingOne(false)
  }

  const testGetAllReadings = async () => {
    setLoadingTwo(true)
    setResultsTwo(null)

    //calling function 
    const resultTwo = await getAllReadings()

    console.log('recieved all readings', resultTwo)
    setResultsTwo(resultTwo)
    setLoadingTwo(false)
  }

  const testGetReadingByDate = async () => {
    setLoadingThree(true)
    setResultsThree(null)

    const testReadingDate = '2025-11-25'

    const resultThree = await getReadingsByDate(testReadingDate)

    if (resultThree.success) {
      if (resultThree.data.length === 0) {
        console.log('no readings on this date')
      } else {
        console.log(`Found ${resultThree.data.length} reading(s) on ${testReadingDate}`)
        resultThree.data.forEach(reading => {
          console.log(reading.notes)
        })
      }
    }

    console.log(`recieved reading on ${testReadingDate}`, resultThree)
    
    setResultsThree(resultThree)
    setLoadingThree(false)
  }

  const testUpdateReading = async () => {
    setResultsFour(null)
    setLoadingFour(true)

    const testId = '05a1441b-02cb-4e21-87a5-1bdafaa54b88'

    const testUpdate = {
      notes: 'testing update function'
    }

    const resultFour = await updateReading(testId,testUpdate)
    
    console.log('updated reading:', resultFour)

    setResultsFour(resultFour)
    setLoadingFour(false)
  }

  const testDeleteReading = async () => {
    setLoadingFive(true)

    const testId = '3707b6d8-2644-475f-90be-2e669254164d'

    await deleteReading(testId)

    console.log(`reading ${testId} deleted`)

    setLoadingFive(false)
  }

  return (
    <div>
      <h2>Test Functions</h2>
      <button 
        onClick={testCreateReading} 
        disabled={loadingOne}
      >
        {loadingOne ? 'Testing...' : 'Test Create Reading'}  
      </button>

      <button 
        onClick={testGetAllReadings} 
        disabled={loadingTwo}
      >
        {loadingTwo ? 'Testing...' : 'Test Get All Readings'}  
      </button>

      <button 
        onClick={testGetReadingByDate} 
        disabled={loadingThree}
      >
        {loadingThree ? 'Testing...' : 'Test get reading by date'}  
      </button>

      <button 
        onClick={testUpdateReading} 
        disabled={loadingFour}
      >
        {loadingFour ? 'Testing...' : 'Test update reading'}  
      </button>

      <button 
        onClick={testDeleteReading} 
        disabled={loadingFive}
      >
        {loadingFour ? 'Testing...' : 'Test delete reading'}  
      </button>
    
      {resultOne && (
        <div>
          {resultOne.success ? (
            <div>
              <h3>Success!</h3>
              <p>create reading function working</p>
            </div>
          ) : (
            <div>
              <h3>error</h3>
              <p>create reading function not working</p>
            </div>
          )}     
        </div>
      )}

      {resultTwo && (
        <div>
          {resultTwo.success ? (
            <div>
              <h3>Success!</h3>
              <p>Get All Readings function working</p>
            </div>
          ) : (
            <div>
              <h3>error</h3>
              <p>Get All Readings function not working</p>
            </div>
          )}     
        </div>
      )}

       {resultThree && (
        <div>
          {resultThree.success ? (
            <div>
              <h3>Success!</h3>
              <p>Get reading by date function working</p>
            </div>
          ) : (
            <div>
              <h3>error</h3>
              <p>Get reading by date function not working</p>
            </div>
          )}     
        </div>
      )}

       {resultFour && (
        <div>
          {resultFour.success ? (
            <div>
              <h3>Success!</h3>
              <p>update reading function working</p>
            </div>
          ) : (
            <div>
              <h3>error</h3>
              <p>update reading function not working</p>
            </div>
          )}     
        </div>
      )}
    </div>  
  )
}

export default TestServiceFunctionsComponent 