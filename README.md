# Tarolytics

Tarolytics is a web app for generating, tracking, and analyzing trends in your tarot readings. 

## Intro

As someone who pulls tarot cards as a daily ritual, I wanted to build a tool to help track tarot readings and provide card by card analytics. Tarolytics allows users to input and save readings from the physical world, as well as generate new readings in the app. Each reading a user inputs is saved to a PostgreSQL database where it can be queried for analytics information (how often is a specific card being pulled, what is its reversal rate, does it commonly appear with any other cards, what notes has the user previously saved with this card). 

Tarolytics also generates a display page for each reading where the user can pull clarifier cards (cards to clarify the original meaning of the reading) and queries an LLM for a reading analysis based on the reading topic and notes the user input

<img width="1390" height="1002" alt="image" src="https://github.com/user-attachments/assets/46ce3a63-3ef2-4b1e-8908-4d95babf7f12" />


Tarolytics also provides the user with their astrological chart information and uses this to generate informed personalized insights on the users tarot readings. 

<img width="787" height="826" alt="image" src="https://github.com/user-attachments/assets/13a5fab2-50c8-474b-8309-65a9566c5a67" />

## URL

[Tarolytics](tarolytics.avalehner.com)

## Stack

Tarolytics was built with a Typescript/React/Vite frontend and a Node.js/Express/PostgreSQL backend stack. 

The astrology data is sourced from [Free Astro API's](https://www.freeastroapi.com/docs/western/natal/) Natal Chart endpoint. 

Tarolytics uses natural randomness derived from atmospheric noise to generate it's tarot readings for users. This data is sourced from [random.org](https://www.random.org/clients/http/#sequences) sequence generator API.  

## Author

Ava Lehner, I made this tool for myself and hope others can enjoy it as well :) 



