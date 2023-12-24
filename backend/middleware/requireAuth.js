
const requireAuth = async (req, res, next) => {
  if (req.isAuthenticated()) {
    console.log("user is authenticated" + req.user)
    next()
  } else {
    console.log("user not authenticated" + req.user)
    res.status(401).json({ error: "Unauthorized access to templates" });
  }
}



module.exports = requireAuth