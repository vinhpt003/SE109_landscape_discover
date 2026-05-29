export type Role = 'Admin' | 'Editor' | 'RegisteredUser'
export type PostStatus = 'Draft' | 'Pending' | 'Publish' | 'Rejected'

export interface User {
  userId: string
  userName: string
  email: string
  role: Role
  avatar: string | null
  createdAt?: string
}

export interface Location {
  locationId: string
  locationName: string
  description: string | null
  coordinates: string | null
}

export interface Post {
  postId: string
  authorId: string
  locationId: string
  title: string
  content: string
  imageUrl: string | null
  status: PostStatus
  createdAt: string
  updatedAt: string
  images: Media[]
  reviews?: Review[]
  hours?: string
  bestTime?: string
}

// Payload gửi lên khi tạo / cập nhật
export interface CreateLandmarkPayload {
  title: string
  description: string
  content: string
  createdAt: string
  user?: Pick<User, 'userId' | 'userName' | 'avatar'>
}

export interface Rating {
  rateId: string
  postId: string
  userId: string
  score: number
  createdAt: string
}

export interface RatingSummary {
  postId: string
  avgRating: number | null
  count: number
}

export interface SavedPost {
  userId: string
  postId: string
  savedAt: string
  post?: Post
}

export interface AuthResponse {
  access_token: string
  user: User
}
