// ✅ API: /api/auth/login/route.js
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { signJWT } from "@/lib/jwt"

export async function POST(req) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: "Email y contraseña requeridos" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email } })

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
  }

  const token = signJWT(user)

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      addresses: user.addresses,
      orders: [],
    },
    token,
  })
}

// import { NextResponse } from "next/server"
// import { prisma } from "@/lib/prisma"
// import bcrypt from "bcryptjs"
// import { signJWT } from "@/lib/jwt"

// export async function POST(req) {
//   const { email, password } = await req.json()

//   if (!email || !password) {
//     return NextResponse.json({ error: "Email y contraseña requeridos" }, { status: 400 })
//   }

//   const user = await prisma.user.findUnique({ where: { email } })

//   if (!user || !bcrypt.compareSync(password, user.password)) {
//     return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
//   }

//   const token = signJWT(user)

//   return NextResponse.json({
//     user: {
//       id: user.id,
//       name: user.name,
//       email: user.email,
//       avatar: user.avatar,
//       addresses: user.addresses,
//       orders: [],
//     },
//     token,
//   })
// }
