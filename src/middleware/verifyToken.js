import JWT from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    if(!token) res.status(403).send("No authorization token found")

    const user = JWT.verify(token, process.env.SECRET_KEY);

    if (!user) res.status(404).send("Invalid authorization token");
    req.userId = user?._id;
    next();
  } catch (error) {
    res.status(404).send("Error verifying token");
  }
};
