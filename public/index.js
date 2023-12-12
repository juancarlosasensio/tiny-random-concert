document.addEventListener('DOMContentLoaded', async (e) => {
    const mainEl = document.querySelector('[data-tiny-desk-concert]');

    if (mainEl) {
        let concertList = JSON.parse(localStorage.getItem('concerts'));

        if (!concertList) {
          const res = await fetch(`/api/random-concert`);
          concertList = await res.json();

          localStorage.setItem('concerts', JSON.stringify(concertList));
        }

        const randIndex = getRandomInt(concertList.length - 1)
        const randConcertLink = concertList[randIndex]

        mainEl.innerHTML = `
            <a href='${randConcertLink}' target='blank'>Here's your random concert. Click to reveal!</a>
        `
    }
})


function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}