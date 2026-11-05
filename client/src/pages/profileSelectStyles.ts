import type { CSSObjectWithLabel } from "react-select";

export const timezoneSelectStyles = {
  control: (base: CSSObjectWithLabel): CSSObjectWithLabel => ({
    ...base,
    border: "1px solid var(--border-input)",
    borderRadius: "8px",
    cursor: "pointer",
    minHeight: "44px",
    height: "44px",
  }),
  valueContainer: (base: CSSObjectWithLabel): CSSObjectWithLabel => ({
    ...base,
    justifyContent: "center",
    padding: "2px 0 2px 40px",
  }),
  singleValue: (base: CSSObjectWithLabel): CSSObjectWithLabel => ({
    ...base,
    width: "100%",
    textAlign: "center",
  }),
  input: (base: CSSObjectWithLabel): CSSObjectWithLabel => ({
    ...base,
    textAlign: "center",
  }),
};

export const citySelectStyles = {
  ...timezoneSelectStyles,
  placeholder: (base: CSSObjectWithLabel): CSSObjectWithLabel => ({
    ...base,
    width: "100%",
    textAlign: "center",
  }),
};
