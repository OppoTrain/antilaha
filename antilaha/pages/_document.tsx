import { Html, Head, Main, NextScript } from "next/document"

export default function Document() {
  const logoUrl =
    "https://firebasestorage.googleapis.com/v0/b/curlmaker-ae151.firebasestorage.app/o/LOGO%2Fimage.png?alt=media&token=72933bb0-9073-4327-8ab9-7c997e8c5e68"

  return (
    <Html lang="ar">
      <Head>
        {/* Basic Meta */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#FFFFFF" />

        {/* SEO Meta */}
        <title>Curl Maker | كيرل ميكر</title>
        <meta name="title" content="Curl Maker | كيرل ميكر" />
        <meta
          name="description"
          content="كيرل ميكر - منتجات طبيعية وآمنة للعناية بالشعر في فلسطين - نابلس. Curl Maker - Natural and safe hair care products from Nablus, Palestine."
        />
        <meta
          name="keywords"
          content="Curl Maker, كيرل ميكر, منتجات شعر, العناية بالشعر, نابلس, فلسطين, شعر كيرلي, منتجات طبيعية, Hair Products, Nablus, Palestine, Curly Hair"
        />

        {/* Canonical URL */}
        <link rel="canonical" href="https://www.curlmaker.com" />

        {/* Favicon & Icons */}
        <link rel="shortcut icon" href={logoUrl} />
        <link rel="icon" href={logoUrl} />
        <link rel="apple-touch-icon" href={logoUrl} />
        <link rel="apple-touch-icon" sizes="152x152" href={logoUrl} />
        <link rel="apple-touch-icon" sizes="180x180" href={logoUrl} />
        <link rel="apple-touch-icon" sizes="167x167" href={logoUrl} />

        {/* Social Sharing Meta - Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.curlmaker.com" />
        <meta property="og:title" content="Curl Maker | كيرل ميكر" />
        <meta
          property="og:description"
          content="منتجات طبيعية للعناية بالشعر في فلسطين. Curl Maker offers premium, natural curly hair care products from Nablus, Palestine."
        />
        <meta property="og:image" content={logoUrl} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://www.curlmaker.com" />
        <meta name="twitter:title" content="Curl Maker | كيرل ميكر" />
        <meta
          name="twitter:description"
          content="منتجات طبيعية وآمنة للعناية بالشعر من فلسطين. Curl Maker - Natural Hair Products from Nablus."
        />
        <meta name="twitter:image" content={logoUrl} />

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Apple Web App Meta */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Curl Maker" />

        {/* Windows Tile */}
        <meta name="msapplication-TileImage" content={logoUrl} />
        <meta name="msapplication-TileColor" content="#FFFFFF" />

        {/* iOS Splash Screens */}
        {[
          [1024, 1366],
          [834, 1194],
          [768, 1024],
          [834, 1112],
          [810, 1080],
          [430, 932],
          [393, 852],
          [428, 926],
          [390, 844],
          [375, 812],
          [414, 896],
          [414, 736],
          [375, 667],
          [320, 568],
        ].map(([w, h]) => (
          <link
            key={`${w}-${h}`}
            rel="apple-touch-startup-image"
            href={logoUrl}
            media={`(device-width: ${w}px) and (device-height: ${h}px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)`}
          />
        ))}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
