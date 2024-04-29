import { URL, isConcertLink } from '../utils.js';
import { getRevid, setRevid, setCount, setConcertsLinks, getCount } from '../db.js';

export const cron = async (req, res) => {
  try {
    const wpRes = await fetch(URL);
    const wpData = await wpRes.json();
    const currentRevid = await getRevid();

    if (wpData.parse.revid === currentRevid) {
      res.json('Data is already up-to-date with the latest on Wikipedia');

    } else {
      const currentLinksCount = await getCount();
      const { revid: wpRevid } = wpData.parse;
      const allWPLinks = wpData.parse.externallinks.filter(isConcertLink);
      const wpLinksCount = allWPLinks.length;
      const newLinks = allWPLinks.slice(currentLinksCount, allWPLinks.length)

      if (newLinks.length === wpLinksCount - currentLinksCount) {
        setRevid(wpRevid);
        setCount(wpLinksCount)
        setConcertsLinks(newLinks)

        // Perhaps be more explicit with response status code: 300 or something that indicates an update has happened?
        // need to read docs to check what Vercel expects to be returned from cron job.
        res.json('Data updated successfully');
      }
    }

  } catch (error) {
    res.status(500).send(`Cron failed due to: ${error.message}`);
  }
}
