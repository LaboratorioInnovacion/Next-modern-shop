// ✅ /lib/jwt.js
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "secret123"

export function signJWT(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" })
}

// import jwt from "jsonwebtoken"

// const JWT_SECRET = process.env.JWT_SECRET || "secret123"

// export function signJWT(user) {
//   return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" })
// }
