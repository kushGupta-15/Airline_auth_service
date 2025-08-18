const UserService = require("../services/user-service.js");

const userService = new UserService();

const create = async (req, res) => {
  try {
    const response = await userService.create(req.body);
    return res.status(201).json({
      message: "User created successfully",
      data: response,
      success: true,
      err: {},
    });
  } catch (error) {
    console.log("Error in create in user controller");
    return res.status(500).json({
      message: "Something went wrong",
      data: {},
      success: false,
      err: error,
    });
  }
};

// Error in signIn controller need to fix
const signIn = async (req, res) => {
    try {
        const response = await userService.signIn(
          req.body.email,
          req.body.password
        );
        return res.status(200).json({
            message: "User signed in successfully",
            data: response,
            success: true,
            err: null
        })
    } catch (error) {
        console.log("Error in signIn in user controller");
        return res.status(500).json({
            message: "Something went wrong",
            data:{},
            success: false,
            err: error
        });
    }
}

module.exports = {
  create,
  signIn,
};
