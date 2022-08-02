/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 従来よりもビルドが高速な Next.js コンパイラを利用する（Experimental Features）
  swcMinify: true,
  compiler: {
    // styledComponentsの有効化
    styledComponents: true,
  },
}

module.exports = nextConfig
