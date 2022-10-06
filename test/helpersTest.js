const { assert } = require('chai');

const { getUserByEmail, urlsForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const testURLs = {
  'short1': {
    longURL: 'http://google.com',
    userID: 'userID1',
  },
  'short2': {
    longURL: 'http://cjsw.com',
    userID: 'userID2',
  },
}

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID);
  });
  it('should return undefined for a non-existent email', function() {
    const user = getUserByEmail("user5@example.com", testUsers)
    const expectedUserID = undefined;
    assert.equal(user, expectedUserID);
  });
});

describe('urlsForUser', function() {
  it('should return a short url if the user id is a value in the object', function() {
    const link = urlsForUser('userID1', testURLs);
    const expectedLink = ['short1'];
    assert.deepEqual(link, expectedLink);
  });
  it('should return an empty array if the user id is not present', function() {
    const link = urlsForUser('userID3', testURLs);
    const expectedLink = [];
    assert.deepEqual(link, expectedLink);
  });
});