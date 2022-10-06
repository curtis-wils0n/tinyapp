/**
 * Returns a user object if their 'email' value matches the one provided
 *
 * @param {string} email Value to be searched for
 * @param {object} database Object to be searched
 * @returns {object} user with matching email, or undefined
 */
const getUserByEmail = function(email, database) {
  for (let individual of Object.keys(database)) {
    if (database[individual].email === email) {
      return database[individual];
    }
  }
  return undefined;
};
/**
 * Returns an array of short urls if id value was located in database
 *
 * @param {*} id Value to be searched for
 * @param {*} database Object with property 'id' to be searched
 * @returns {string[]} List of urls where id matched
 */
const urlsForUser = function(id, database) {
  let result = [];
  for (let link of Object.keys(database)) {
    if (database[link].userID === id) {
      result.push(link);
    }
  }
  return result;
};
/**
 * Returns random alphabetical string of length 6
 *
 * @returns Random 6-letter string, variable letter case
 */
const randString = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    if (Math.random() > 0.5) {
      result += chars.charAt(Math.floor(Math.random() * chars.length)).toLowerCase();
    } else {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  return result;
};

module.exports = {
  getUserByEmail,
  urlsForUser,
  randString,
};