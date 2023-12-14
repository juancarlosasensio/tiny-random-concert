document.addEventListener('DOMContentLoaded', async (e) => {
    const mainEl = document.querySelector('[data-tiny-desk-concert]');

    if (mainEl) {
        let concertList = JSON.parse(localStorage.getItem('concerts'));

        if (!concertList) {
          const res = await fetch(`/api/random-concert`);
          concertList = await res.json();

          localStorage.setItem('concerts', JSON.stringify(concertList));
        }
    }
})