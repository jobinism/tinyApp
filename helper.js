function generateRandomString() {
  let value = Math.random().toString(36).substring(2, 7);
  // console.log("Value: ", value);
  return value;
};

const getUserByUsername = (screenName) => {
  console.log("inside the function:", users, screenName)
  for (const userId in users) {
    const user = users[userId];
   

    if (user.screenName === screenName) {
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