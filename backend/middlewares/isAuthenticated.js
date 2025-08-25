import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
  try {
    // retrieve the token from the cookies
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        message: "User is not authenticated",
        success: false,
      });
    }
    // verify the token user jwt.verify
    const decode = await jwt.verify(token, process.env.SECRET_KEY);
    // response with an error if token verification fails
    if (!token) {
      res.status(401).json({
        message: "Invalid token",
        success: false,
      });
    }
    // Attach the decoded user ID to the request object
    req.id = decode.userId;
    // Proceed to the next middleware or route handles
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};

export default isAuthenticated;
