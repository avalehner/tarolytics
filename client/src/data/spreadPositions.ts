const spreadPositions: Record<string, { 
  cardWidth: number,
  positions: {
    x: number, 
    y: number, 
    rotation: number,
    labelOffset?: {
    x: number,
    y: number 
  }
  }[]
}> = {
  'single-card': {
    cardWidth: 55, 
    positions: [{ x: 50, y: 30, rotation: 0}]
  }, 
  'top-bottom': {
    cardWidth: 48, 
    positions: [
      {x: 25, y: 25, rotation: 0 }, 
      { x: 85, y: 50, rotation: 0 }
    ]
  }, 
  'past-present-future': {
    cardWidth: 48, 
    positions: [
      { x: 5, y: 35, rotation: 0 }, 
      { x: 57.5, y: 35, rotation: 0 }, 
      { x: 110, y: 35, rotation: 0 }
    ]
  }, 
  'past-present-future-advice': {
    cardWidth: 37, 
    positions: [
      { x: 0, y: 37, rotation: 0 }, 
      { x: 40, y: 37, rotation: 0 }, 
      { x: 80, y: 37, rotation: 0 },
      { x: 122 , y: 39, rotation: 5 }
    ]
  }, 
  'celtic': {
    cardWidth: 20, 
    positions: [
      { x: 45, y: 80, rotation: 0 }, 
      { x: 45, y: 80, rotation: 90, labelOffset: {x: -90, y: 40} }, 
      { x: 45, y: 26, rotation: 0 }, 
      { x: 45, y: 135, rotation: 0 },
      { x: 7, y: 80, rotation: 0 },
      { x: 83, y: 80, rotation: 0 },
      { x: 119, y: 162, rotation: 0 },
      { x: 119, y: 109, rotation: 0 },
      { x: 119, y: 56, rotation: 0 },
      { x: 119, y: 3, rotation: 0 },
    ]
  }
}

export default spreadPositions