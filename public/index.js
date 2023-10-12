document.addEventListener('DOMContentLoaded', async (e) => {
    const mainEl = document.querySelector('[data-tiny-desk-concert]');

    if (mainEl) {
        const res = await fetch('/random-concert');

        console.log({ res })
        const concertList = await res.json();


        const upperLimit = concertList.length - 1

        console.log({ res }, { concertList }, { upperLimit });

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