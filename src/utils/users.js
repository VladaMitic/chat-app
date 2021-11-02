const users = [];

//ADD USER
const addUser = ({ id, username, room }) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();
  //validate data
  if (!username || !room) {
    return {
      error: "Username and room are required!",
    };
  }

  const existingUsers = users.find((user) => {
    return user.room === room && user.username === username;
  });
  if (existingUsers) {
    return {
      error: "Username exist in this room",
    };
  }

  const user = { id, username, room };
  users.push(user);
  return { user };
};

//REMOVE USER
const removeUser = (id) => {
  const index = users.findIndex((user) => {
    return user.id === id;
  });

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

//GET USER
const getUser = (id) => {
  return users.find((user) => user.id === id);
};

//GET USRES IN ROOM
const getUsersInRoom = (room) => {
  room = room.trim().toLowerCase();
  return users.filter((user) => user.room === room);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
