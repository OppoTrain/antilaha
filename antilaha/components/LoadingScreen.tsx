// "use client"

// import { useState, useEffect } from "react"
// import { motion } from "framer-motion"
// import Image from "next/image"

// export default function LoadingScreen() {
//   const [progress, setProgress] = useState(0)
//   const [isLoading, setIsLoading] = useState(true)

//   // Text content based on language
//   const content = {
//     en: {
//       loading: "Loading",
//       welcome: "Welcome to Curl Maker",
//     },
//     ar: {
//       loading: "جاري التحميل",
//       welcome: "مرحبًا بك في كيرل ميكر",
//     },
//   }

//   useEffect(() => {
//     // Start progress animation with 2-second delay
//     const timer = setTimeout(() => {
//       const interval = setInterval(() => {
//         setProgress((prev) => {
//           if (prev >= 100) {
//             clearInterval(interval)
//             setTimeout(() => setIsLoading(false), 500) // Delay before hiding
//             return 100
//           }
//           return prev + 2 // Increment by 2 to reach 100 in ~2.5s (50ms * 50 updates)
//         })
//       }, 50) // Slower interval for smoother performance

//       // Fallback to ensure loading screen hides after 10 seconds
//       const maxTimeout = setTimeout(() => {
//         clearInterval(interval)
//         setProgress(100)
//         setIsLoading(false)
//       }, 10000)

//       return () => {
//         clearInterval(interval)
//         clearTimeout(maxTimeout)
//       }
//     }, 2000) // 2-second delay before starting

//     return () => clearTimeout(timer)
//   }, [])

//   // Variants for animations
//   const containerVariants = {
//     hidden: { opacity: 1 },
//     visible: { opacity: 1, transition: { duration: 0.5 } },
//     exit: { opacity: 0, transition: { duration: 0.5 } },
//   }

//   const logoVariants = {
//     hidden: { scale: 0.8, opacity: 0, rotate: -10 },
//     visible: {
//       scale: 1,
//       opacity: 1,
//       rotate: 0,
//       transition: {
//         duration: 0.8,
//         ease: "easeOut",
//         scale: { type: "spring", stiffness: 100 },
//       },
//     },
//     animate: {
//       y: [-10, 10, -10],
//       rotate: [-2, 2, -2],
//       transition: {
//         y: { repeat: Infinity, duration: 3, ease: "easeInOut" },
//         rotate: { repeat: Infinity, duration: 4, ease: "easeInOut" },
//       },
//     },
//     exit: {
//       scale: 0.8,
//       opacity: 0,
//       rotate: 10,
//       transition: { duration: 0.3 },
//     },
//   }

//   if (!isLoading) return null

//   return (
//     <motion.div
//       className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-b from-pink-50 to-white"
//       initial="hidden"
//       animate="visible"
//       variants={containerVariants}
//       exit="exit"
//       dir={isRTL ? "rtl" : "ltr"}
//     >
//       <motion.div
//         className="flex flex-col items-center text-center"
//         initial="hidden"
//         animate={["visible", "animate"]}
//         exit="exit"
//         variants={logoVariants}
//       >
//         {/* Logo */}
//         <div className="mb-8 relative w-32 h-32 md:w-40 md:h-40">
//           <Image
//             src="https://firebasestorage.googleapis.com/v0/b/curlmaker-ae151.firebasestorage.app/o/LOGO%2Fimage.png?alt=media&token=72933bb0-9073-4327-8ab9-7c997e8c5e68"
//             alt="Curl Maker Logo"
//             fill
//             sizes="(max-width: 768px) 128px, 160px"
//             className="object-contain drop-shadow-md"
//             priority
//           />
//         </div>

//         {/* Welcome text */}
//         <motion.div
//           className="mb-6 text-xl md:text-2xl font-semibold text-gray-800"
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5, delay: 0.3 }}
//         >
//           {content[language].welcome}
//         </motion.div>

//         {/* Progress bar */}
//         <div className="relative mb-4 h-2 w-72 md:w-96 overflow-hidden rounded-full bg-gray-200/50">
//           <div
//             className="absolute left-0 top-0 h-full bg-gradient-to-r from-pink-400 to-pink-600"
//             style={{ width: `${progress}%`, transition: "width 0.1s linear" }}
//           />
//         </div>

//         {/* Loading text with dots animation */}
//         <div className={`flex items-center text-sm md:text-base font-medium text-gray-600 ${isRTL ? "flex-row-reverse" : ""}`}>
//           <span>{content[language].loading}</span>
//           <motion.span
//             initial={{ opacity: 0 }}
//             animate={{ opacity: [0, 1, 0] }}
//             transition={{ repeat: Infinity, duration: 1.5, times: [0, 0.5, 1] }}
//             className={isRTL ? "mr-1" : "ml-1"}
//           >
//             ...
//           </motion.span>
//           <span className={isRTL ? "mr-2" : "ml-2"}>{progress}%</span>
//         </div>
//       </motion.div>
//     </motion.div>
//   )
// }