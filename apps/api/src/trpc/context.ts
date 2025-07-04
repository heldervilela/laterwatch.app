import type { Doc, Id } from '../../convex/_generated/dataModel'
import { authService } from '../services/authService'

export async function createContext({ req }: { req: Request }) {
  // Extract and verify JWT from Authorization header
  const authorization = req.headers.get('authorization')
  let user: (Omit<Doc<'users'>, '_id'> & { id: Id<'users'> }) | null = null

  if (authorization?.startsWith('Bearer ')) {
    const token = authorization.slice(7)
    const tokenData = authService.verifyAccessToken(token)

    if (tokenData) {
      const userData = await authService.getUserById(tokenData.userId)
      if (userData) {
        user = {
          id: userData._id,
          email: userData.email,
          name: userData.name,
          createdAt: userData.createdAt,
          _creationTime: userData._creationTime,
          updatedAt: userData.updatedAt,
          isActive: userData.isActive,
          lastLoginAt: userData.lastLoginAt,
          profilePicture: userData.profilePicture,
        }
      }
    }
  }

  return {
    user,
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
