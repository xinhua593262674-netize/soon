import { z } from "zod"

// ============================================================
// 用户相关 Schema
// ============================================================

export const userSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(50),
  email: z.string().email(),
  image: z.string().url().nullable(),
  bio: z.string().max(500).nullable(),
  createdAt: z.date(),
})

export const updateProfileSchema = userSchema.pick({
  name: true,
  bio: true,
  image: true,
})

export type User = z.infer<typeof userSchema>
export type UpdateProfile = z.infer<typeof updateProfileSchema>

// ============================================================
// 帖子相关 Schema
// ============================================================

export const createPostSchema = z.object({
  title: z.string().min(1, "标题不能为空").max(200, "标题最长200字"),
  content: z.string().min(1, "内容不能为空").max(10000, "内容最长10000字"),
  tags: z.array(z.string().max(20)).max(5, "最多5个标签").default([]),
})

export const updatePostSchema = createPostSchema.partial()

export type CreatePost = z.infer<typeof createPostSchema>
export type UpdatePost = z.infer<typeof updatePostSchema>

// ============================================================
// 评论相关 Schema
// ============================================================

export const createCommentSchema = z.object({
  content: z.string().min(1, "评论不能为空").max(2000, "评论最长2000字"),
  postId: z.string(),
  parentId: z.string().optional(),
})

export type CreateComment = z.infer<typeof createCommentSchema>

// ============================================================
// API 响应格式
// ============================================================

export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    message: z.string().optional(),
  })

export type ApiResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}
