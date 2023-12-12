function helloWorld() {
  const html =`
    <html>
      <head></head>
      <body>
        <ul>
          <li>Will this work in Vercel preview deployment?</li>
        </ul>
      </body>
    </html>
  `
  console.log(html);
  return html;
}

helloWorld();