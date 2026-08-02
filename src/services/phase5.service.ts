import { api } from './api'
import type { AuthUser } from '@/types/auth'

export interface NewsItem {
  id: string
  title: string
  slug: string
  summary: string
  content: string
  coverImageUrl?: string
  status: string
  publishedAt?: string
  createdAt?: string
}

export interface ShopProfile {
  id: string
  shopCode: string
  shopName: string
  status: string
}

export async function fetchNews(params?: { page?: number; limit?: number }) {
  const { data } = await api.get<{ items: NewsItem[] }>('/news', { params })
  return data
}

export async function fetchNewsBySlug(slug: string) {
  const { data } = await api.get<NewsItem>(`/news/${slug}`)
  return data
}

export async function fetchProfile() {
  const { data } = await api.get<AuthUser>('/profile')
  return data
}

export async function updateProfile(payload: {
  name?: string
  avatar?: string
}) {
  const { data } = await api.patch<AuthUser>('/profile', payload)
  return data
}

export async function changePassword(payload: {
  currentPassword: string
  newPassword: string
}) {
  const { data } = await api.patch<{ message: string }>(
    '/profile/change-password',
    payload,
  )
  return data
}

export async function fetchMyShop() {
  const { data } = await api.get<ShopProfile>('/shop/me')
  return data
}

export async function updateMyShop(payload: { shopName?: string }) {
  const { data } = await api.patch<ShopProfile>('/shop/me', payload)
  return data
}

export async function fetchRevenueStatistics(days = 30) {
  const { data } = await api.get('/statistics/revenue', { params: { days } })
  return data
}

export async function fetchOrdersStatistics() {
  const { data } = await api.get('/statistics/orders')
  return data
}
