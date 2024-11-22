// Import the necessary module
const {DateTime} = require("luxon");

// Get the current date and time
const now = DateTime.now();

// Calculate the future date and time by adding hours and minutes
const futureDate = now.plus({hours: 12, minutes: 40});

// Get the timestamp in milliseconds
const timestamp = futureDate.toMillis();

console.log("Current Date and Time:", now.toISO());
console.log("Future Date and Time:", futureDate.toISO());
console.log("Timestamp in milliseconds:", timestamp);
