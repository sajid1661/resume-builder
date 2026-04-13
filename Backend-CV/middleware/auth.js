import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
  // Accept token in several common header locations
  const authHeader = req.headers.authorization || req.headers.token || req.headers['x-access-token'];
  let token = null;
  if (authHeader && typeof authHeader === 'string') {
    // support "Bearer <token>" and raw token
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else {
      token = authHeader;
    }
  }
  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized: token missing" });
  }

  try {
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment');
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user info to request (don't mutate body)
    req.userId = decoded.id || decoded._id || decoded.userId;
    req.user = decoded;
    next();
  } catch (err) {
    console.error('error in auth middleware:', err.message || err);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

export default authUser;
