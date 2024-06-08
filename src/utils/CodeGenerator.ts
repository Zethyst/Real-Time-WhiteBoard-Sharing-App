export const generateCode = (length:number = 6):string => {
  let roomCode = "rc";
  for (let i = 0; i < length; i++) {
    roomCode += Math.floor(Math.random() * 10).toString();
  }
  return roomCode;
};
