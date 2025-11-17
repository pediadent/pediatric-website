import { prisma } from '@/lib/prisma'
import { DentistDirectory } from '@/components/home/DentistDirectory'
import { InfoSection } from '@/components/home/InfoSection'
import { FAQSection } from '@/components/home/FAQSection'
import { generateWebsiteSchema, generateOrganizationSchema } from '@/lib/schema-generator'

export const dynamic = 'force-dynamic'

export default async function Home() {
  // Fetch all active dentists for homepage directory
  let dentists = []
  try {
    dentists = await prisma.dentistDirectory.findMany({
      where: { isActive: true },
      orderBy: { rating: 'desc' }
    })
  } catch (error) {
    console.error('Database not ready:', error)
  }

  const websiteSchema = generateWebsiteSchema()
  const organizationSchema = generateOrganizationSchema()
  const combinedSchema = [websiteSchema, organizationSchema]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
      />

      <main className="min-h-screen">
        <DentistDirectory dentists={dentists} />
        <InfoSection />
        <FAQSection />
      </main>
    </>
  )
}
