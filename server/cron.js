import { URL, isConcertLink } from './utils.js';
import { getRevid, setRevid, setCount, setConcertsLinks, getCount } from './db.js';

export const cron = async (req, res) => {
  const authHeader = req.get('authorization');

  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({
      success: false, message: 'Unauthorized request'
  })}

  try {
    const wpRes = await fetch(URL);
    const wpData = await wpRes.json();
    const currentRevid = await getRevid();

    if (wpData.parse.revid === currentRevid) {
      res.status(200).json({
        success: true,
        message: 'Data is up-to-date with the latest from Wikipedia.'
      });

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
        res.status(200).json({
          success: true,
          message: 'Data has been updated.'
        });
      }
    }

  } catch (error) {
    res.status(500).json({
      succes: false,
      message: `Cron failed due to: ${error.message}`
    });
  }
}