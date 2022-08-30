### Introduction.

This API provides up to 10 random business name and addresses of any country/city you pass in the parameter along with a get request.

##### Tools Used

- [Puppeteer](https://pptr.dev/): To scarpe business names and addresses from Google Maps.
- [Express Js](https://expressjs.com/): For routing.
- [User-Agents](https://www.npmjs.com/package/user-agents): To randomize user agents to avoid bot detection.

### How to use it

- Make sure you have [node.js](https://nodejs.org/en/) installed in your system.
- to make sure it is installed run

```
node -v
```

- Clone the folder

```
git clone https://github.com/pthapa1/Scraper-to-API.git

```

- Then install dependencies.

```
npm install
```

- Run the application with the following command.

```
node index.js

```

- Then using your favorite API client like postman, make a simple get request to the following URL.

For example,

```
GET | http://localhost:3000/address/{country_or_a_cityName}

```

For countries or cities names with multiple words, you might have to encode the space with `%20` as shown below. Postman does this automatically.

```url
http://localhost:3000/address/South%20Africa
```

- Sample Image
  ![Postman Screenshot](./Scraper-to-API.png 'Postman, Get Request Sample')

### Improvements to make pursue

- Performance improvement is a continious process. It is faster than earlier version of the app but more will need to be done in the future to scale it up.
- Show addresses from different country: Currently the app only checks for hotels in Google Map
- https on express server
- Build react app to consume and spit the data.

---

### Improved

- [x] Now the app check for empty string and Invalid String in the URL.
- [x] Now the app direct users to use proper URL.
- [x] Application throws internal Server Error if google maps fails or if the result is empty.
- [x] Performance is improved by using concurrency setting of 10, used from bluebird library.
- [x] Page scrolls to get desired items. Currently hard-coded for 20 items.
- [x] Async disposer pattern is implemented to avoid memory leak in case browser does not respond or close during search or after search.
- [x] Now the Api extracts phone Number for business.
- [x] Dockerized the application on Node-alipne image.
