import fs from 'node:fs/promises';
import pkg from 'fs-extra';
const { writeFile, readdir } = pkg;

// import config from './config.json' assert {type: 'json'}
// import { dynamicHTML } from './htmlUtils.js';
// import { ssr } from "./ssr.js";

readdir('./pages', async (err, files) => {
    if(err) {
        console.error(err)
        process.exit(1)
    }
    for(let route of files) {
      console.log(route)
      if (route.includes('index.js')) {
        return;
      } else {
        var s = await fs.readFile(`pages/${route}`, 'utf8');
        var html = eval(s);
        console.log(html)
        await saveRender(route, html)
      }
   }
})

readdir('./ssr', async (err, files) => {
    if(err) {
        console.error(err)
        process.exit(1)
    }
    for(let route of files) {
      console.log(route)
      if (route.includes('index.js')) {
        return;
      } else {
        var s = await fs.readFile(`ssr/${route}`, 'utf8');
        var html = eval(s);
        console.log(html)
        await saveRender(route, html)
      }
   }
})

async function saveRender(route, html) {
    let targetPath = "./public/" + (route.replace(".js", ".html"))
    console.log("Trying to save ", targetPath, "...")
    try {
        await writeFile(targetPath, html)    

    } catch ( e ) {
        console.error("Error trying to save rendered html")
        console.error(e)
    }
}