export interface Section {
  id: string
  slug: string
  title: string
  subtitle?: string
  body?: string
  image?: string
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Collection {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  sortOrder: number
  isActive: boolean
  products?: Product[]
  _count?: { products: number }
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description?: string
  price: number | string
  image?: string
  gallery: string[]
  collectionId: string
  collection?: Collection
  isFeatured: boolean
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface Testimonial {
  id: string
  name: string
  role?: string
  content: string
  avatar?: string
  rating: number
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface Media {
  id: string
  filename: string
  url: string
  mimeType: string
  size: number
  alt?: string
  folder?: string | null
  createdAt: string
}

export interface SiteSetting {
  id: string
  key: string
  value: string
}

export interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  updatedAt: string
}
