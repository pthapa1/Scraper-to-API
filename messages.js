const errorMessage = `Please enter country or city name in the url: /address/{here}`;
const specialCharacterErrorMessage = `Please enter country or city name without any special characters`;
const internalServerError = `Opps! Something went wrong on our part. Please try again later!`;
const welcomeHomeMessage = `Welcome to Pratik's API. To get addresses, please input the following in the URL: /address/{CountryOrCityName}`;

module.exports = {
  errorMessage,
  specialCharacterErrorMessage,
  internalServerError,
  welcomeHomeMessage,
};
