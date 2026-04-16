const getCardImagePath = (cardName: string) => {
  const reformattedCardName = cardName.replace(' rx', '').toLowerCase().replaceAll(' ', '-')
  return '/cards/' + reformattedCardName + '.webp'
}

console.log(getCardImagePath('Six of Pentacles rx'))

