export const compareDates = (date1, date2) => {
  const timeDifference = date2 - date1; // Difference in milliseconds

  // Convert milliseconds to days
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const dayDifference = timeDifference / millisecondsPerDay;


 return Math.ceil(dayDifference)
};
