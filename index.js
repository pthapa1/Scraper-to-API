const puppeteer = require('puppeteer');
const userAgent = require('user-agents');
const express = require('express');
const bluebird = require('bluebird');
const port = 3000;

// Error Messages
const errorMessage = `Please enter country or city name in the url: /address/{here}`;
const specialCharacterErrorMessage = `Please enter country or city Name without any special characters`;
const internalServerError = `Opps! Something went wrong on our part. Please try again later!`;

// Regular Expression Checks
const emptyStringCheck = /^\s*$/;
const specialCharacterCheck = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

// async disposer pattern
const withBrowser = async (fn) => {
  const browser = await puppeteer.launch({
    /* launch options here */
  });
  try {
    return await fn(browser);
  } finally {
    await browser.close();
  }
};

const withPage = (browser) => async (fn) => {
  const page = await browser.newPage();
  try {
    return await fn(page);
  } finally {
    await page.close();
  }
};

// scrolling function
function extractItems() {
  const extractedElements = document.querySelectorAll('.hfpxzc');
  const items = [];
  for (let element of extractedElements) {
    items.push(element.getAttribute('aria-label'));
  }
  return items;
}
async function scrapeItems(page, extractItems, itemCount, scrollDelay = 2000) {
  let items = [];
  try {
    let previousHeight;
    while (items.length < itemCount) {
      //console.log(`items.length: ${items.length} itemCount: ${itemCount}`);

      items = await page.evaluate(extractItems);

      previousHeight = await page.evaluate(() => {
        const scroller = document.querySelector('div.DxyBCb:nth-child(1)');
        return scroller.scrollHeight;
      });

      await page.evaluate(
        `document.querySelector("div.DxyBCb:nth-child(1)").scrollTo(0, ${previousHeight})`
      );
      await page.waitForFunction(
        `document.querySelector("div.DxyBCb:nth-child(1)").scrollHeight > ${previousHeight}`
      );
      await page.waitForTimeout(scrollDelay);
    }
  } catch (e) {}
  return items;
}
const app = express();

app.get('/address/:countryOrCityName', (req, res, next) => {
  let query = `hotels in ${req.params.countryOrCityName}`;
  const url = `https://www.google.com/maps/search/${query}`;
  const userInput = req.params.countryOrCityName;

  // Check for invalid characters or empty string on user's input (params).
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

      // auto-scroll and extract business Names
      const businessNames = await scrapeItems(page, extractItems, 20);

      // extract businessLinks
      const businessLinks = await page.$$eval('.hfpxzc', (divs) =>
        Array.from(divs).map((div) => div?.getAttribute('href'))
      );

      // lets loop through above business link arrays and grab addresses and phone numbers
      const businessAddressAndPhoneArray = [];
      const businessAddressArray = [];
      const businessPhoneArray = [];

      await withBrowser(async (browser) => {
        return bluebird.map(
          businessLinks,
          async (businessLink) => {
            return withPage(browser)(async (page) => {
              await page.goto(businessLink);

              //
              const selectBusinessDetails = await page.evaluate(() => {
                const allBusinessDetails = Array.from(
                  document.querySelectorAll('.Io6YTe')
                ).map((element) => element.firstChild.nodeValue);
                const validBusinessDetails = allBusinessDetails.filter(
                  (element) => element !== null
                );
                const businessPhoneNumber = validBusinessDetails
                  .map((el) => el.replace(/[^\d\+]/g, ''))
                  .filter((el) => el !== '')
                  .filter((el) => /[\+]?\d{8}\d*/gm.test(el))[0];

                const businessAddress = validBusinessDetails[0];
                return [businessAddress, businessPhoneNumber];
              });
              //
              businessAddressAndPhoneArray.push(selectBusinessDetails);
            });
          },
          { concurrency: 10 }
        );
      });

      //
      for (businessItems of businessAddressAndPhoneArray) {
        businessAddressArray.push(businessItems[0]);
        businessPhoneArray.push(businessItems[1]);
      }

      // make a JSON Object from the two arrays
      const combinedArray = [];

      const combinedBusinessInfo = (
        businessNames,
        businessAddressArray,
        businessPhoneArray
      ) => {
        for (let i = 0; i < businessNames.length; i++) {
          combinedArray.push({
            name: businessNames[i],
            address: businessAddressArray[i],
            phone: businessPhoneArray[i],
          });
        }
        return combinedArray;
      };

      const finalResponseArray = combinedBusinessInfo(
        businessNames,
        businessAddressArray,
        businessPhoneArray
      );

      await browser.close();

      if (finalResponseArray.length === 0) {
        res.status(500).json({ mesage: `${internalServerError}` });
      } else {
        res.send(finalResponseArray);
      }
    })();
  }
});

app.get('/address/', (req, res) => {
  res.status(400).json({ message: errorMessage });
});

app.listen(port, () => console.log('API Server is running'));
