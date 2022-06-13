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
GET | http://localhost:3000/address/{country/cityName}

```

For countries or cities names with multiple words, you might have to encode the space with `%20` as shown below. Postman does this automatically.

```url
http://localhost:3000/address/South%20Africa
```

- Sample Image
  ![Postman Screenshot](./Scraper-to-API.png 'Postman, Get Request Sample')

### Improvements to make pursue

- Performance: The app checks the url one by one for addresses. Therefore, the performance is slow. If possible, I would like to make this faster by simultaneously opening all links saved in the array.

- Show addresses from different country: Currently the app only checks for hotels in Google Map

- More data: The app does not go beyond one page to scrape data and scrapes everthing that's there. I would like the user to decide a number of addresses they need in the URL parameter and generate the certain amount as desired.

- Include more routes: I have yet to implement other routes for errors.
