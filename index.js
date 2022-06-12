const puppeteer = require('puppeteer');
const userAgent = require('user-agents');
const express = require('express');

let query = 'hotels in South Africa';
const url = `https://www.google.com/maps/search/${query}`;

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
  });
  const page = await browser.newPage();
  await page.setUserAgent(userAgent.toString());
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
  //console.log(businessNames); // generates array of names.

  // businessLinks
  const businessLinks = await page.$$eval('.hfpxzc', (divs) =>
    Array.from(divs).map((div) => div?.getAttribute('href'))
  );

  // lets loop through above business link arrays and grab addresses.
  const businessAddressArray = [];

  for (let businessLink of businessLinks) {
    await page.goto(businessLink);
    const selectBusinessAddress = await page.$('.Io6YTe');

    const businessAddress = await selectBusinessAddress.evaluate(
      (el) => el.textContent
    );
    businessAddressArray.push(businessAddress);
  }
  //console.log(businessAddressArray);

  // make a JSON Object from the two arrays

  const combinedBusinessInfo = (businessNames, businessAddressArray) => {
    const combinedArray = [];
    for (let i = 0; i < businessNames.length; i++) {
      combinedArray.push({
        name: businessNames[i],
        address: businessAddressArray[i],
      });
    }
    return combinedArray;
  };

  //console.log(combinedBusinessInfo(businessNames, businessAddressArray));

  await browser.close();

  // setting up route

  const app = express();

  app.get('/address', (req, res) => {
    res.send(combinedBusinessInfo(businessNames, businessAddressArray));
  });

  app.listen(3000, () => console.log('API Server is running'));
})();
