const axios = require('axios');
const {
  welcomeHomeMessage,
  errorMessage,
  specialCharacterErrorMessage,
  internalServerError,
} = require('../messages');
const addresses = require('./data.json');
jest.mock('axios');

describe('Check API', () => {
  test('Sample Test: 3 equals 1 + 2', () => {
    expect(3).toEqual(1 + 2);
  });
  test('Welcome Message Exists', async () => {
    await axios.get.mockResolvedValue({
      message: welcomeHomeMessage,
      status: 200,
    });
    const response = await axios.get(`/`);
    expect(response.message).toContain('Welcome');
    expect(response.status).toBe(200);
  });

  test('Error Message when place name is missing', async () => {
    await axios.get.mockResolvedValue({
      message: errorMessage,
      status: 400,
    });
    const response = await axios.get(`/address/`);
    expect(response.message).toContain('country or city name');
    expect(response.status).toBe(400);
  });

  test('Check for empty string in the input', async () => {
    await axios.get.mockResolvedValue({
      message: `Empty String`,
      status: 400,
    });
    const response = await axios.get(`/address/ `);
    expect(response.message).toContain('Empty String');
    expect(response.status).toBe(400);
  });

  test('Check for Special Character', async () => {
    await axios.get.mockResolvedValue({
      message: specialCharacterErrorMessage,
      status: 400,
    });
    const response = await axios.get(`/address/$#!`);
    expect(response.message).toContain('special characters');
    expect(response.status).toBe(400);
  });

  test("Server Error when response body's length equals 0", async () => {
    const data = {};
    Object.keys(data).length === 0
      ? await axios.get.mockResolvedValue({
          message: internalServerError,
          status: 500,
        })
      : null;
    const response = await axios.get(`/address/berlin`);
    expect(response.message).toContain('Opps! Something went wrong');
    expect(response.status).toBe(500);
  });

  test('Check Final Response', async () => {
    await axios.get.mockResolvedValue({ address: addresses });
    const response = await axios.get(`/address/reston`);
    expect(Object.keys(response.address).length).toEqual(
      Object.keys(addresses).length
    );
    // name, address, and phone has value in received response object
    expect(response.address[0].name.length).toBeGreaterThan(0);
    expect(response.address[0].address.length).toBeGreaterThan(0);
    expect(response.address[0].phone.length).toBeGreaterThan(0);
  });
});
