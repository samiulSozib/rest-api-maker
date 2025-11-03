// middlewares/isAdmin.js
module.exports = (req, res, next) => {
  try {
    // verifyJwtMiddleware must run before this
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized: No user data found" });
    }

    if (req.user.role !== "user") {
      return res.status(403).json({ error: "Forbidden: Customer access required" });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: "Failed to verify customer access", details: error.message });
  }
};
