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
    { key: 'featureCart', value: 'false' },
    { key: 'featureSeo', value: 'false' },
    { key: 'featureTheme', value: 'false' },
    // Shipping (RajaOngkir)
    { key: 'shippingOriginCityId', value: '' },
    { key: 'shippingOriginCityName', value: '' },
    { key: 'shippingCouriers', value: 'jne,tiki,pos' },
    { key: 'shippingDefaultWeight', value: '500' },
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
    {
      slug: 'hero',
      title: 'Handcrafted in Bali',
      subtitle: 'Jewelry that tells your story',
      body: 'Exquisite, handcrafted jewelry inspired by the island\'s rich cultural heritage.',
      sortOrder: 1,
      metadata: {
        badgeLabel: 'Handcrafted in Bali',
        ctaPrimaryText: 'Explore Collections',
        ctaPrimaryLink: '#collections',
        ctaSecondaryText: 'Our Story',
        ctaSecondaryLink: '#about',
        scrollText: 'Scroll',
      },
    },
    {
      slug: 'about',
      title: 'Born from Balinese Tradition',
      subtitle: 'Our Story',
      body: 'Sense of Jewels was born out of a passion for the enchanting beauty and timeless traditions of Bali. Each piece is lovingly handcrafted by Balinese artisans using traditional techniques passed down through generations.',
      sortOrder: 2,
      metadata: {
        badgeLabel: 'Our Story',
        stat1Value: '15+',
        stat1Label: 'Years of Craft',
        stat2Value: '500+',
        stat2Label: 'Unique Designs',
        stat3Value: '50+',
        stat3Label: 'Countries',
      },
    },
    {
      slug: 'collections',
      title: 'Collections',
      subtitle: 'Explore Our Collection',
      sortOrder: 3,
      metadata: {
        badgeLabel: 'Our Craft',
        viewText: 'View Collection',
        emptySoonText: 'Collections coming soon',
      },
    },
    {
      slug: 'sustainability',
      title: 'Sustainably Crafted',
      subtitle: 'Our Commitment to Sustainability',
      body: 'We are committed to ethical sourcing, fair trade practices, and supporting the local Balinese artisan community.',
      sortOrder: 4,
      metadata: {
        badgeLabel: 'Our Values',
        feature1Title: 'Eco-Friendly',
        feature1Body: 'Recycled metals and sustainable packaging in every order.',
        feature2Title: 'Fair Trade',
        feature2Body: 'Artisans are paid fairly and work in safe, dignified conditions.',
        feature3Title: 'Ethically Sourced',
        feature3Body: 'Gemstones and metals sourced with full traceability.',
        feature4Title: 'Handmade',
        feature4Body: 'Every piece individually crafted — never mass produced.',
      },
    },
    {
      slug: 'testimonials',
      title: 'What Our Customers Say',
      subtitle: null,
      sortOrder: 5,
      metadata: {
        badgeLabel: 'Loved By Many',
        emptySoonText: 'Reviews coming soon',
      },
    },
    {
      slug: 'contact',
      title: 'Visit Our Studio',
      subtitle: 'We would love to hear from you',
      sortOrder: 6,
      metadata: {
        badgeLabel: 'Get In Touch',
        locationLabel: 'Location',
        emailLabel: 'Email',
        socialLabel: 'Follow Us',
      },
    },
  ]
  for (const s of sections) {
    const existing = await prisma.section.findUnique({ where: { slug: s.slug } })
    if (!existing) {
      await prisma.section.create({ data: s })
      console.log(`Section created: ${s.slug}`)
    } else {
      // Update metadata for existing sections that don't have it yet
      if (!existing.metadata) {
        await prisma.section.update({ where: { slug: s.slug }, data: { metadata: s.metadata } })
        console.log(`Section metadata updated: ${s.slug}`)
      }
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
