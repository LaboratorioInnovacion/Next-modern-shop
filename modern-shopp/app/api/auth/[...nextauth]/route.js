// /app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../../lib/db";

import GoogleProvider from "next-auth/providers/google";

import bcrypt from "bcryptjs";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isValid) return null;

        return user;
      },
    }),
  ],
  // pages: {
  //   signIn: "/",
  // },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        // Buscar usuario existente con ese email
        const existingUser = await prisma.user.findUnique({ where: { email: user.email }, include: { accounts: true } });
        if (existingUser && !existingUser.accounts?.some(acc => acc.provider === "google")) {
          // Usuario existe pero no tiene Google vinculado
          // Redirige con error personalizado
          return "/?error=account_conflict";
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      console.log("[NextAuth][jwt callback] token:", token, "user:", user);
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("[NextAuth][session callback] session:", session, "token:", token);
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.image = token.image;
        session.user.role = token.role;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

// // Refactor del contexto: auth-context.js
// "use client"

// import { createContext, useContext, useEffect, useReducer } from "react"
// import { useSession, signIn, signOut } from "next-auth/react"

// const AuthContext = createContext()

// const authReducer = (state, action) => {
//   switch (action.type) {
//     case "SET_USER":
//       return {
//         ...state,
//         user: action.payload,
//         isAuthenticated: !!action.payload,
//       }
//     default:
//       return state
//   }
// }

// export function AuthProvider({ children }) {
//   const { data: session } = useSession()

//   const [state, dispatch] = useReducer(authReducer, {
//     user: null,
//     isAuthenticated: false,
//   })

//   useEffect(() => {
//     if (session?.user) {
//       dispatch({ type: "SET_USER", payload: session.user })
//     } else {
//       dispatch({ type: "SET_USER", payload: null })
//     }
//   }, [session])

//   const login = async (email, password) => {
//     const res = await signIn("credentials", {
//       email,
//       password,
//       redirect: false,
//     })
//     return res
//   }

//   const logout = async () => {
//     await signOut()
//   }

//   const value = {
//     user: state.user,
//     isAuthenticated: state.isAuthenticated,
//     login,
//     logout,
//   }

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
// }

// export const useAuth = () => {
//   const context = useContext(AuthContext)
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider")
//   }
//   return context
// }
