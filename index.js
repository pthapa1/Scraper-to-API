const puppeteer = require('puppeteer');
const userAgent = require('user-agents');
const express = require('express');
const port = 3000;

// Error Messages
const errorMessage = `Please enter country or city name in the url: /address/{here}`;
const specialCharacterErrorMessage = `Please enter country or city Name without any special characters`;

// Regular Expression Checks
const emptyStringCheck = /^\s*$/;
const specialCharacterCheck = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

const app = express();

app.get('/address/:countryOrCityName', (req, res, next) => {
  let query = `hotels in ${req.params.countryOrCityName}`;
  const url = `https://www.google.com/maps/search/${query}`;
  const userInput = req.params.countryOrCityName;

  // Check if paramater is empty and check for special chraracters used in the query.

  if (emptyStringCheck.test(userInput) || !userInput) {
    res.status(400).json({ mesage: `⚠️ EMPTY STRING ⚠️. ${errorMessage}` });
  } else if (specialCharacterCheck.test(userInput)) {
    res.status(400).json({ message: specialCharacterErrorMessage });
  } else {
    (async () => {
      const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null,
      });
      const page = await browser.newPage();
      await page.setUserAgent(userAgent.toString());
      await page.goto(url);

      // scroll and add more content.

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

      res.send(combinedBusinessInfo(businessNames, businessAddressArray));
    })();
  }
});

app.get('/address/', (req, res) => {
  res.status(400).json({ message: errorMessage });
});

app.listen(port, () => console.log('API Server is running'));
