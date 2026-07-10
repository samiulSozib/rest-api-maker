// middlewares/isAdmin.js
module.exports = (req, res, next) => {
  try {
    // verifyJwtMiddleware must run before this
    if (!req.user) {
      return res.status(401).json({ status: false, message: "No user data found", data: null });
    }

    if (req.user.role !== "user") {
      return res.status(403).json({ status: false, message: "Customer access required", data: null });
    }

    next();
  } catch (error) {
    return res.status(500).json({ status: false, message: "Failed to verify customer access", data: null });
  }
};
