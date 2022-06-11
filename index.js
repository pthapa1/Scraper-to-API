const { link } = require('fs');
const puppeteer = require('puppeteer');

const query = 'hotels in Ireland';
const url = `https://www.google.com/maps/search/${query}`;

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
  });
  const page = await browser.newPage();
  await page.goto(url);

  await page.waitForSelector('.hfpxzc');
  const businessLinks = await page.$$eval('.hfpxzc', (divs) =>
    Array.from(divs).map((div) => div?.getAttribute('aria-label'))
  );

  console.log(businessLinks);
  // to retreive address
  // First find the array
  // on each, click and get the address
  // then print all the address in an array.

  // document.querySelector('.Io6YTe').textContent
})(); // can't use for each outside of page.evaluate.

// https://stackoverflow.com/questions/52827121/puppeteer-how-to-get-the-contents-of-each-element-of-a-nodelist

// Do this instead
