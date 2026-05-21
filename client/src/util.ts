export const getCardImagePath = (cardName: string) => {
  const reformattedCardName = cardName
    .replace(" rx", "")
    .toLowerCase()
    .replaceAll(" ", "-");
  return "/cards/" + reformattedCardName + ".webp";
};

export const convertDayToWord = (day: number) => {
  const values = [
    "First",
    "Second",
    "Third",
    "Fourth",
    "Fifth",
    "Sixth",
    "Seventh",
    "Rigth",
    "Ninth",
    "Tenth",
    "Eleventh",
    "Twelfth",
    "Thirteenth",
    "Fourteenth",
    "Fifteenth",
    "Sixteenth",
    "Seventeenth",
    "Eighteenth",
    "Nineteenth",
    "Twentieth",
    "Twenty-first",
    "Twenty-second",
    "Twenty-third",
    "Twenty-fourth",
    "Twenty-fifth",
    "Twenty-sixth",
    "Twenty-seventh",
    "Twenty-eighth",
    "Twenty-ninth",
    "Thirtieth",
    "Thirty-first",
  ];

  return values[day - 1];
};
