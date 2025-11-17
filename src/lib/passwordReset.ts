import { createHash, randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import { SECURITY_CONFIG } from '@/lib/security'

const TOKEN_BYTE_LENGTH = 32

export const hashPasswordResetToken = (token: string) =>
  createHash('sha256').update(token).digest('hex')

export async function createPasswordResetToken(userId: string) {
  const token = randomBytes(TOKEN_BYTE_LENGTH).toString('hex')
  const tokenHash = hashPasswordResetToken(token)
  const expiresAt = new Date(
    Date.now() + SECURITY_CONFIG.PASSWORD_RESET.TOKEN_EXPIRATION_MS
  )

  await prisma.passwordResetToken.deleteMany({
    where: {
      userId
    }
  })

  const record = await prisma.passwordResetToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt
    }
  })

  return { token, record }
}

export async function findValidPasswordResetToken(token: string) {
  const tokenHash = hashPasswordResetToken(token)
  const record = await prisma.passwordResetToken.findUnique({
    where: {
      tokenHash
    }
  })

  if (!record) {
    return null
  }

  if (record.usedAt || record.expiresAt.getTime() < Date.now()) {
    return null
  }

  return record
}

export async function markPasswordResetTokenUsed(id: string) {
  await prisma.passwordResetToken.update({
    where: { id },
    data: { usedAt: new Date() }
  })
}
