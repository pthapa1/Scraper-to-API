const puppeteer = require('puppeteer');
// const { link } = require('fs');

const query = 'hotels in Germany';
const url = `https://www.google.com/maps/search/${query}`;

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
  });
  const page = await browser.newPage();
  await page.goto(url);

  // getting Names of business
  await page.waitForSelector('.hfpxzc');
  const businessNames = await page.$$eval('.hfpxzc', (divs) =>
    Array.from(divs).map(
      (div) => div?.getAttribute('aria-label')
      //&& div?.getAttribute('href')
      // separated in order to get two different arrays.
    )
  );
  console.log(businessNames);
  // businessLinks
  const businessLinks = await page.$$eval('.hfpxzc', (divs) =>
    Array.from(divs).map((div) => div?.getAttribute('href'))
  );
  // console.log(businessLinks);

  // lets loop through above arrays and grab addresses.
  for (let businessLink of businessLinks) {
    await page.goto(businessLink);
    const selectBusinessAddress = await page.$('.Io6YTe');
    const businessAddress = await selectBusinessAddress.evaluate(
      (el) => el.textContent
    );

    console.log(businessAddress);

    // combine all the extracted values into an array.

    // const businessAddressArray = [];

    // for (let i = 0; i < businessAddress.length; i++) {
    //   businessAddressArray.push(i);
    // }
    // console.log(businessAddressArray);
  }

  await browser.close();
})();
