/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
          },
        ],
      },
    ]
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "64.media.tumblr.com" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "hebbkx1anhila5yf.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com", pathname: "/v0/b/**" },
    ],
    domains: [
      "firebasestorage.googleapis.com",
      "hebbkx1anhila5yf.public.blob.vercel-storage.com",
      "veiled.com",
      "nextuipro.nyc3.cdn.digitaloceanspaces.com",
      "images.unsplash.com",
      "i.pinimg.com",
      "th.bing.com",
      "ibb.co",
      "media.discordapp.net",
      "wallpaperaccess.com",
      "img-s-msn-com.akamaized.net",
      "media.istockphoto.com",
      "weiboo.pixcelsthemes.com",
      "dricoper.com.au",
      "sablyn.com",
      "www.n22menswear.com",
    ],
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/lahza/:path*",
        destination: "https://api.lahza.io/:path*",
      },
    ]
  },
}

module.exports = nextConfig
