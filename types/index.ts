// 假装社区 — 全局类型定义

// ============================================================
// 通用工具类型
// ============================================================

/** 可空类型 */
export type Nullable<T> = T | null

/** 可选属性 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/** 深度 Partial */
export type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T

// ============================================================
// 分页
// ============================================================

export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasMore: boolean
}

// ============================================================
// 服务端 Props 模式
// ============================================================

export interface PageProps<P = Record<string, string>, S = Record<string, string>> {
  params: P
  searchParams: S
}

// ============================================================
// 组件通用 Props
// ============================================================

export interface ChildrenProps {
  children: React.ReactNode
}

export interface ClassNameProps {
  className?: string
}
