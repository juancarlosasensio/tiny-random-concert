# Tiny Random Concert

Product requirements

1. As a user, I can easily get a random tiny desk concert


Technical requirements

1. As an engineer, I can persist Tiny Desk concert data securely
  1. Get concert links from MediaWiki to avoid web scrapping
  2. Data can be read from and written to Firestore Realtime Database by authorized users only

2. As an engineer, I can keep data updated as new concerts are published

  1. Make sure expensive data operations are done only when new concert data is available
  2. Make sure no data is lost and data structure remains consistent as new data gets added
  3. Automate data updates, i.e.: avoid the need to make these updates manually

3. As an engineer, I want to style the product to make it fun to sue
  a. Give it that game feel: http://www.game-feel.com/ && https://www.andy.works/words/the-most-satisfying-checkbox
