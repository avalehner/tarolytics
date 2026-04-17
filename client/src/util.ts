export const getCardImagePath = (cardName: string) => {
  const reformattedCardName = cardName.replace(' rx', '').toLowerCase().replaceAll(' ', '-')
  return '/cards/' + reformattedCardName + '.webp'
}

export const convertDayToWord = (day: number) => {
  const values = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eigth', 'ninth',
    'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 
    'eighteenth', 'nineteenth', 'twentieth', 'twenty-first', 'twenty-second', 'twenty-third', 
    'twenty-fourth', 'twenty-fifth', 'twenty-sixth', 'twenty-seventh', 'twenty-eighth', 
    'twenty-ninth', 'thirtieth', 'thirty-first' 
  ]

  return values[day - 1]
}