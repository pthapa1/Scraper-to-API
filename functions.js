const puppeteer = require('puppeteer');

// async disposer pattern.
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
const extractItems = () => {
  const extractedElements = document.querySelectorAll('.hfpxzc');
  const items = [];
  for (let element of extractedElements) {
    items.push(element.getAttribute('aria-label'));
  }
  return items;
};

const scrapeItems = async (
  page,
  extractItems,
  itemCount,
  scrollDelay = 2000
) => {
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
};

module.exports = { withBrowser, withPage, extractItems, scrapeItems };
