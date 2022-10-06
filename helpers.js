// Returns a user object based on matching email
const getUserByEmail = function(email, database) {
  for (let individual of Object.keys(database)) {
    if (database[individual].email === email) {
      return database[individual];
    }
  }
  return undefined;
};
// Returns the URLs that have the given id value in its 'userID' key
const urlsForUser = function(id, database) {
  let result = [];
  for (let link of Object.keys(database)) {
    if (database[link].userID === id) {
      result.push(link);
    }
  }
  return result;
};
// Returns string for user ID
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