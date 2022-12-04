const puppeteer = require('puppeteer');
const userAgent = require('user-agents');
const express = require('express');
const bluebird = require('bluebird');
const cors = require('cors');
const functions = require('./functions.js');
const messages = require('./messages');
const port = process.env.PORT || 3000;
const numberofResults = 10;

// Regular Expression Checks
const emptyStringCheck = /^\s*$/;
const specialCharacterCheck = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

const app = express();
app.use(cors({ origin: '*' }));

app.get('/', (req, res) => {
  res.status(200).json({ message: messages.welcomeHomeMessage });
});

app.get('/address/:countryOrCityName', (req, res) => {
  let query = `hotels in ${req.params.countryOrCityName}`;
  const url = `https://www.google.com/maps/search/${query}`;
  const userInput = req.params.countryOrCityName;

  // Check for invalid characters or empty string on user's input (params).
  if (emptyStringCheck.test(userInput) || !userInput) {
    res
      .status(400)
      .json({ mesage: `⚠️ EMPTY STRING ⚠️. ${messages.errorMessage}` });
  } else if (specialCharacterCheck.test(userInput)) {
    res.status(400).json({ message: messages.specialCharacterErrorMessage });
  } else {
    (async () => {
      const browser = await puppeteer.launch({
        headless: true,
        executablePath: '/usr/bin/chromium-browser',
        args: [
          '--no-sandbox',
          '--disable-gpu',
          '--disable-dev-shm-usage',
          '--disable-setuid-sandbox',
        ],
      });
      const page = await browser.newPage();
      await page.setUserAgent(userAgent.toString());
      await page.goto(url);

      // auto-scroll and extract business Names
      const businessNames = await functions.scrapeItems(
        page,
        functions.extractItems,
        numberofResults
      );

      // extract businessLinks
      const businessLinks = await page.$$eval('.hfpxzc', (divs) =>
        Array.from(divs).map((div) => div?.getAttribute('href'))
      );

      // lets loop through above business link arrays and grab addresses and phone numbers
      const businessAddressAndPhoneArray = [];
      const businessAddressArray = [];
      const businessPhoneArray = [];

      await functions.withBrowser(async (browser) => {
        return bluebird.map(
          businessLinks,
          async (businessLink) => {
            return functions.withPage(browser)(async (page) => {
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
        res.status(500).json({ mesage: `${messages.internalServerError}` });
      } else {
        res.send(finalResponseArray);
      }
    })();
  }
});

app.get('/address/', (req, res) => {
  res.status(400).json({ message: messages.errorMessage });
});

app.listen(port, () => console.log('API Server is running'));
