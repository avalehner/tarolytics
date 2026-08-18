const spreadPositions: Record<
  string,
  {
    cardWidth: number;
    positions: {
      x: number;
      y: number;
      rotation: number;
      labelOffset?: {
        x: number;
        y: number;
      };
    }[];
  }
> = {
  "single-card": {
    cardWidth: 55,
    positions: [{ x: 50, y: 30, rotation: 0 }],
  },
  "top-bottom": {
    cardWidth: 37,
    positions: [
      { x: 25, y: 25, rotation: 0 },
      { x: 75, y: 25, rotation: 0 },
    ],
  },
  "past-present-future": {
    cardWidth: 42,
    positions: [
      { x: 5, y: 35, rotation: 0 },
      { x: 57.5, y: 35, rotation: 0 },
      { x: 110, y: 35, rotation: 0 },
    ],
  },
  "past-present-future-advice": {
    cardWidth: 37,
    positions: [
      { x: 0, y: 37, rotation: 0 },
      { x: 40, y: 37, rotation: 0 },
      { x: 80, y: 37, rotation: 0 },
      { x: 122, y: 39, rotation: 5 },
    ],
  },
  celtic: {
    cardWidth: 23.5,
    positions: [
      { x: 42, y: 86, rotation: 0 },
      { x: 42, y: 86, rotation: 90, labelOffset: { x: -90, y: 40 } },
      { x: 42, y: 24, rotation: 0 },
      { x: 42, y: 149, rotation: 0 },
      { x: -2, y: 86, rotation: 0 },
      { x: 83, y: 86, rotation: 0 },
      { x: 119, y: 192, rotation: 0 },
      { x: 119, y: 130, rotation: 0 },
      { x: 119, y: 69, rotation: 0 },
      { x: 119, y: 7, rotation: 0 },
    ],
  },
};

export default spreadPositions;
