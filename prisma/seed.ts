import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.$connect()

  // Admin user
  const email = 'admin@senseofjewels.com'
  const existing = await prisma.user.findUnique({ where: { email } })
  if (!existing) {
    const hashed = await bcrypt.hash('admin123', 12)
    const user = await prisma.user.create({
      data: { name: 'Admin', email, password: hashed, role: 'superadmin' },
    })
    console.log(`User created: ${user.email} (superadmin)`)
  } else {
    // Ensure existing seed user is superadmin
    await prisma.user.update({ where: { email }, data: { role: 'superadmin' } })
    console.log(`User ${email} already exists, ensured superadmin role.`)
  }

  // Default site settings
  const settings = [
    { key: 'siteName', value: 'Sense of Jewels' },
    { key: 'siteTagline', value: 'Handcrafted Balinese Jewelry' },
    { key: 'siteUrl', value: 'https://senseofjewels.com' },
    { key: 'contactEmail', value: 'sales@senseofjewels.com' },
    { key: 'contactPhone', value: '+628113994222' },
    { key: 'address', value: 'Jalan Nangka Utara Gg. Camar No. 4 Tonja Denpasar Utara, Denpasar - Bali, Indonesia' },
    { key: 'instagramUrl', value: 'https://instagram.com/senseofjewels' },
    { key: 'whatsappNumber', value: '628113994222' },
    { key: 'colorPrimary', value: '#2a2a2e' },
    { key: 'colorPrimaryContent', value: '#f9f8f5' },
    { key: 'colorSecondary', value: '#c9a96e' },
    { key: 'colorAccent', value: '#b87d5e' },
    { key: 'colorBase100', value: '#f9f8f5' },
    { key: 'colorBaseContent', value: '#2b2b2f' },
    { key: 'fontHeading', value: '' },
    { key: 'fontBody', value: '' },
    { key: 'metaDescription', value: '' },
    { key: 'metaKeywords', value: 'handcrafted jewelry, bali, necklace, earrings, bracelets, rings' },
    { key: 'ogImage', value: '' },
    { key: 'googleAnalyticsId', value: '' },
    // Feature flags (superadmin controls these)
    { key: 'featureShop', value: 'false' },
    { key: 'featureSeo', value: 'false' },
    { key: 'featureTheme', value: 'false' },
  ]
  for (const s of settings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    })
  }
  console.log('Site settings seeded.')

  // Default sections
  const sections = [
    { slug: 'hero', title: 'Hero', subtitle: 'Discover the magic of Bali', body: 'Exquisite, handcrafted jewelry inspired by the island\'s rich cultural heritage.', sortOrder: 1 },
    { slug: 'about', title: 'About Us', subtitle: 'Our Story', body: 'Sense of Jewels was born out of a passion for the enchanting beauty and timeless traditions of Bali.', sortOrder: 2 },
    { slug: 'collections', title: 'Collections', subtitle: 'Explore Our Collection', sortOrder: 3 },
    { slug: 'sustainability', title: 'Sustainability', subtitle: 'Our Commitment to Sustainability', sortOrder: 4 },
    { slug: 'contact', title: 'Contact', subtitle: 'We would love to hear from you', sortOrder: 5 },
  ]
  for (const s of sections) {
    const existing = await prisma.section.findUnique({ where: { slug: s.slug } })
    if (!existing) {
      await prisma.section.create({ data: s })
      console.log(`Section created: ${s.slug}`)
    }
  }

  // Default collections
  const necklaces = await prisma.collection.upsert({
    where: { slug: 'necklaces' },
    update: {},
    create: { name: 'Necklaces', slug: 'necklaces', description: 'Adorn yourself with elegance. Our necklaces are designed to complement any outfit.', sortOrder: 1 },
  })
  const earrings = await prisma.collection.upsert({
    where: { slug: 'earrings' },
    update: {},
    create: { name: 'Earrings', slug: 'earrings', description: 'Add a sparkle to your day. Our earrings range from delicate studs to statement pieces.', sortOrder: 2 },
  })
  const bracelets = await prisma.collection.upsert({
    where: { slug: 'bracelets' },
    update: {},
    create: { name: 'Bracelets', slug: 'bracelets', description: 'Embrace tradition with our beautifully crafted bracelets.', sortOrder: 3 },
  })
  const rings = await prisma.collection.upsert({
    where: { slug: 'rings' },
    update: {},
    create: { name: 'Rings', slug: 'rings', description: 'Celebrate life\'s moments. Our rings are designed for every occasion.', sortOrder: 4 },
  })
  console.log('Collections seeded.')

  // Sample testimonial
  const existingTestimonial = await prisma.testimonial.findFirst()
  if (!existingTestimonial) {
    await prisma.testimonial.create({
      data: {
        name: 'Sarah M.',
        role: 'Customer',
        content: 'The craftsmanship is absolutely stunning. Every piece tells a story and I receive compliments every time I wear my bracelet.',
        rating: 5,
        sortOrder: 1,
      },
    })
    console.log('Sample testimonial created.')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
