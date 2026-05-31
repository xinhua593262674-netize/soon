import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // 启用 React 编译器 (可选)
    // reactCompiler: true,
  },
  images: {
    // 配置允许的图片域名
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "**.googleusercontent.com",
      },
    ],
  },
  // 重定向配置
  async redirects() {
    return [];
  },
  // 安全头配置
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
