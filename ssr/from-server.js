function helloWorld() {
  const html =`
    <html>
      <head></head>
      <body>
        <ul>
          <li>FROM SERVER!</li>
        </ul>
      </body>
    </html>
  `
  console.log(html);
  return html;
}

helloWorld();