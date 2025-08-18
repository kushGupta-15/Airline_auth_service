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
    console.log("Error in create in user controller", error);
    return res.status(500).json({
      message: "Something went wrong",
      data: {},
      success: false,
      err: error,
    });
  }
};

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
        console.log("Error in signIn in user controller", error);
        return res.status(500).json({
            message: "Something went wrong",
            data:{},
            success: false,
            err: error
        });
    }
}

const isAuthenticated = async (req, res) => {
    try {
        const token = req.headers['x-access-token'];
        const response = await userService.isAuthenticated(token);
        return res.status(200).json({
            message: "User is authenticated and token is valid",
            data: response,
            success: true,
            err: {}
        })
    } catch (error) {
        console.log("Error in isAuthenticated in user controller", error);
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
  isAuthenticated
};
