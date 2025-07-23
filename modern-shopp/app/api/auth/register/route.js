// ✅ API: /api/auth/register/route.js
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { signJWT } from "@/lib/jwt"

export async function POST(req) {
  const { name, email, password } = await req.json()

  if (!name || !email || password.length < 6) {
    return NextResponse.json({ error: "Campos inválidos" }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: "El correo ya está registrado" }, { status: 409 })
  }

  const hashed = bcrypt.hashSync(password, 10)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      avatar: `https://ui-avatars.com/api/?name=${name}&background=3b82f6&color=fff`,
    },
  })

  const token = signJWT(user)

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      addresses: [],
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
//   const { name, email, password } = await req.json()

//   if (!name || !email || password.length < 6) {
//     return NextResponse.json({ error: "Campos inválidos" }, { status: 400 })
//   }

//   const existing = await prisma.user.findUnique({ where: { email } })
//   if (existing) {
//     return NextResponse.json({ error: "El correo ya está registrado" }, { status: 409 })
//   }

//   const hashed = bcrypt.hashSync(password, 10)

//   const user = await prisma.user.create({
//     data: {
//       name,
//       email,
//       password: hashed,
//       avatar: `https://ui-avatars.com/api/?name=${name}&background=3b82f6&color=fff`,
//     },
//   })

//   const token = signJWT(user)

//   return NextResponse.json({
//     user: {
//       id: user.id,
//       name: user.name,
//       email: user.email,
//       avatar: user.avatar,
//       addresses: [],
//       orders: [],
//     },
//     token,
//   })
// }
