import { UserSchema } from "../models/user.model.js";

export const registerUser = async (req, res) => {
  // get all the parameters from the request body
  // check if the user is already registered
  // if yes then return a response with message
  // if not then create a new user
  // and return a response

  try {
    const { name, email, password } = req.body;

    const existingUser = await UserSchema.findOne({ email: email });
    if (existingUser)
      res.status(201).json({ message: "User already registered" });

    const user = new UserSchema({
      name: name,
      email: email,
      password: password,
    });

    await user.save();
    res.status(200).json({
      userInfo: user,
    });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

// @TODO: Create a middleware to Verify the token and then add it all routes which you want to protect
export const loginUser = async (req, res) => {
  // get the email and password from the request body
  // get the user using the email
  // once the user is found , compare the entered password and saved password
  // if password match the send the response
  // if not then throw and error

  try {
    const { email, password } = req.body;
    const user = await UserSchema.findOne({ email: email });

    if (!user) throw new Error("User does not exist");

    const isPasswordValid = user.isPasswordCorrect(password);

    if (!isPasswordValid) throw new Error("Password is incorrect");

    const token = user.generateJWTtoken();

    let loggedInUser = await UserSchema.findById(user?._id).select('-password  -__v')

    loggedInUser = {...loggedInUser._doc, accessToken: token}
   

    res.status(200).json(loggedInUser);
  } catch (error) {
    throw new Error(error)
  }
};
