function generateRandomString() {
  let value = Math.random().toString(36).substring(2, 7);
  // console.log("Value: ", value);
  return value;
};

const getUserByUsername = (username, database) => {
  // console.log("inside the function:", users, screenName)
  for (const userId in database) {
    const user = database[userId];

    if (user.screenName === username) {
      return user;
    }
  }

  return null;
};

const urlOfUsers = function (userId, urls) {
  const output = {}
    for (shortId in urls) {
      if (urls[shortId].userId === userId) {
        output[shortId] = urls[shortId]
      }
    }
    return output;
};

module.exports = { urlOfUsers, getUserByUsername, generateRandomString };