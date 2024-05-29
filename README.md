# Tiny Random Concert

### Product requirements

- As a user, I can easily get a random tiny desk concert

### Technical requirements

- As an engineer, I can persist Tiny Desk concert data securely
  - Get concert links from MediaWiki to avoid web scrapping
  - Data can be read from and written to Firestore Realtime Database by authorized users only

- As an engineer, I can keep data updated as new concerts are published
  - Make sure expensive data operations are done only when new concert data is available
  - Make sure no data is lost and data structure remains consistent as new data gets added
  - Automate data updates, i.e.: avoid the need to make these updates manually

- As an engineer, I want to style the product to make it fun to use
  - Give it that game feel: http://www.game-feel.com/ && https://www.andy.works/words/the-most-satisfying-checkbox
