import { prisma } from '../src/lib/prisma'
import bcrypt from 'bcryptjs'

async function resetPassword() {
  const email = 'seoshouts@gmail.com'
  const newPassword = 'admin123'

  const hashedPassword = await bcrypt.hash(newPassword, 10)

  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword }
  })

  console.log('✅ Admin password reset successfully!')
  console.log('\n📧 Email:', email)
  console.log('🔑 Password:', newPassword)
  console.log('\nYou can now login at: http://localhost:3000/admin/login/')

  await prisma.$disconnect()
}

resetPassword()
