export type Role = 'Admin' | 'Editor' | 'RegisteredUser'
export type PostStatus = 'Draft' | 'Pending' | 'Publish' | 'Rejected'
export type Region = 'North' | 'Central' | 'South'

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
  region?: Region | null
}

export interface Post {
  postId: string
  authorId: string
  locationId: string
  title: string
  content: string
  imageUrl: string | null
  imagePublicId: string | null
  status: PostStatus
  createdAt: string
  updatedAt: string
  author?: Pick<User, 'userId' | 'userName' | 'avatar'>
  location?: Pick<Location, 'locationId' | 'locationName'>
  avgRating?: number | null
  ratingCount?: number
  _count?: { comments: number; ratings: number }
}

export interface Comment {
  commentId: string
  postId: string
  userId: string
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

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface CommentWithPost extends Comment {
  post?: Pick<Post, 'postId' | 'title'>
}

export type NotificationType = 'PostApproved' | 'PostRejected' | 'NewComment' | 'PostPending'

export interface Notification {
  notificationId: string
  userId: string
  type: NotificationType
  postId: string | null
  commentId: string | null
  actorId: string | null
  message: string
  read: boolean
  createdAt: string
}

export interface NotificationsPaginated {
  data: Notification[]
  total: number
  page: number
  limit: number
  unreadCount: number
}

export interface DashboardStats {
  totalPosts: number
  pendingPosts: number
  totalUsers: number
  newPostsLast30d: number
  newUsersLast30d: number
  postsByRegion: { region: Region; count: number }[]
}