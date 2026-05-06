export const getRandomSequence = async (numCards: number): Promise<[]> => {
  const randomResponse = await fetch(`http://localhost:3000/api/random`, {
    method: 'GET', 
    headers: { 'Content-Type': 'application/json' }, 
  })

  if(!randomResponse.ok) {
    throw new Error(`Server error [getRandomSequence - randomService.ts]: ${randomResponse.status}`)
  }

  const randomData = await randomResponse.json()
  console.log(randomData)
  const randomCardIndeces = randomData.slice(0, numCards)
  console.log(randomCardIndeces)
  return randomCardIndeces
}