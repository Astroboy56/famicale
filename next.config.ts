import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // PWA設定は本番環境では手動で設定可能
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // 外部アクセス許可設定
  ...(process.env.NODE_ENV === 'development' && {
    devIndicators: {
      buildActivity: false,
    },
  }),
};

export default nextConfig;
