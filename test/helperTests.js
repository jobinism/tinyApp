const { assert } = require('chai');

const { getUserByUsername } = require('../helper.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    screenName: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    screenName: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByUsername', function() {
  it('should return a user with valid username', function() {
    const user = getUserByUsername("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID)
  });
});