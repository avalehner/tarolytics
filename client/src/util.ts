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

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const formatDate = (dateStr: string) => {
  const [year, month, day] = dateStr.substring(0, 10).split("-").map(Number);
  return `${MONTHS[month - 1]} ${day}, ${year}`;
};

export const formatMonth = (monthStr: string) => {
  const [year, month] = monthStr.split("-").map(Number);
  return `${MONTHS[month - 1]} ${year}`;
};

export const getReadingSummary = (interpretation: string): string => {
  // grab everything between the summary heading and the next ### heading (or end)
  const match = interpretation.match(
    /#+\s*Overall Reading Summary\s*([\s\S]*?)(?=\n#+|$)/i,
  );
  return match ? match[1].trim() : interpretation; // fallback: show full text
};
