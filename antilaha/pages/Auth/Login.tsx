"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Loader2, AlertCircle, Mail } from "lucide-react"
import { signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"

// Arabic translations
const translations = {
  ar: {
    welcomeBack: "مرحبًا بعودتك",
    enterCredentials: "أدخل بياناتك للوصول إلى حسابك",
    back: "رجوع",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    forgotPassword: "هل نسيت كلمة المرور؟",
    signIn: "تسجيل الدخول",
    signingIn: "جارٍ تسجيل الدخول...",
    noAccount: "ليس لديك حساب؟",
    register: "تسجيل",
    formValidationFailed: "فشل التحقق من النموذج",
    checkFormErrors: "يرجى التحقق من الأخطاء في النموذج وحاول مرة أخرى.",
    emailRequired: "البريد الإلكتروني مطلوب",
    emailInvalid: "البريد الإلكتروني غير صالح",
    passwordRequired: "كلمة المرور مطلوبة",
    loginFailed: "فشل تسجيل الدخول",
    invalidEmail: "عنوان البريد الإلكتروني غير صالح.",
    userDisabled: "هذا الحساب تم تعطيله. يرجى التواصل مع الدعم.",
    userNotFound: "لم يتم العثور على حساب بهذا البريد الإلكتروني. يرجى التحقق من البريد أو التسجيل.",
    wrongPassword: "كلمة المرور غير صحيحة. حاول مرة أخرى.",
    tooManyRequests: "محاولات تسجيل دخول غير ناجحة كثيرة. يرجى المحاولة لاحقًا أو إعادة تعيين كلمة المرور.",
    networkError: "خطأ في الشبكة. يرجى التحقق من اتصالك بالإنترنت وحاول مرة أخرى.",
    loginSuccessful: "تسجيل الدخول ناجح",
    welcomeMessage: "مرحبًا بعودتك!",
    emailNotVerified: "البريد الإلكتروني غير موثق",
    verifyEmailPrompt: "يرجى التحقق من عنوان بريدك الإلكتروني قبل تسجيل الدخول.",
    resendVerification: "إعادة إرسال بريد التحقق",
    verificationEmailSent: "تم إرسال بريد التحقق",
    verificationEmailDesc: "يرجى التحقق من بريدك الوارد للحصول على رابط التحقق.",
    verificationEmailFailed: "فشل إرسال بريد التحقق",
    verificationEmailFailedDesc: "يرجى المحاولة مرة أخرى لاحقًا.",
    resetPassword: "إعادة تعيين كلمة المرور",
    resetPasswordDesc: "أدخل عنوان بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيين كلمة المرور.",
    resetEmailSent: "تم إرسال بريد إعادة تعيين كلمة المرور",
    resetEmailSentDesc: "يرجى التحقق من بريدك الوارد للحصول على رابط إعادة تعيين كلمة المرور.",
    invalidResetEmail: "بريد إلكتروني غير صالح",
    invalidResetEmailDesc: "يرجى إدخال عنوان بريد إلكتروني صالح.",
    resetPasswordFailed: "فشل إعادة تعيين كلمة المرور",
    resetPasswordFailedDesc: "فشل إرسال بريد إعادة تعيين كلمة المرور. يرجى المحاولة مرة أخرى.",
    userNotFoundReset: "لم يتم العثور على حساب بهذا البريد الإلكتروني.",
    sendResetLink: "إرسال رابط إعادة التعيين",
    sending: "جارٍ الإرسال...",
    cancel: "إلغاء",
    close: "إغلاق",
  },
}

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<{
    email?: string
    password?: string
    general?: string
  }>({})
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetEmailSent, setResetEmailSent] = useState(false)
  const [resetEmailLoading, setResetEmailLoading] = useState(false)
  const [showVerificationAlert, setShowVerificationAlert] = useState(false)

  const t = translations.ar // Only Arabic translations

  const validateForm = () => {
    const newErrors: typeof errors = {}

    if (!email) {
      newErrors.email = t.emailRequired
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t.emailInvalid
    }

    if (!password) {
      newErrors.password = t.passwordRequired
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: t.formValidationFailed,
        description: t.checkFormErrors,
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setShowVerificationAlert(false)

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Uncomment to enforce email verification
      // if (!user.emailVerified) {
      //   setShowVerificationAlert(true)
      //   setIsLoading(false)
      //   return
      // }

      const userDoc = await getDoc(doc(db, "users", user.uid))
      let userRole = "customer" // Default role

      if (userDoc.exists() && userDoc.data().compliantRole) {
        userRole = userDoc.data().compliantRole
        console.log("User role from Firestore:", userRole)
      } else {
        console.warn("Firestore document or compliantRole missing for user:", user.uid)
      }

      document.cookie = `session=${user.uid}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict; Secure`

      toast({
        title: t.loginSuccessful,
        description: t.welcomeMessage,
      })

      if (typeof userRole === "string" && userRole.toLowerCase() === "admin") {
        router.push("/admin")
      } else {
        router.push("/")
      }
    } catch (error: any) {
      console.error("Login error:", error.code, error.message)
      let errorMessage = t.loginFailed

      switch (error.code) {
        case "auth/invalid-email":
          errorMessage = t.invalidEmail
          setErrors((prev) => ({ ...prev, email: t.invalidEmail }))
          break
        case "auth/user-disabled":
          errorMessage = t.userDisabled
          setErrors((prev) => ({ ...prev, general: errorMessage }))
          break
        case "auth/user-not-found":
          errorMessage = t.userNotFound
          setErrors((prev) => ({ ...prev, email: t.userNotFound }))
          break
        case "auth/wrong-password":
          errorMessage = t.wrongPassword
          setErrors((prev) => ({ ...prev, password: t.wrongPassword }))
          break
        case "auth/too-many-requests":
          errorMessage = t.tooManyRequests
          setErrors((prev) => ({ ...prev, general: errorMessage }))
          break
        case "auth/network-request-failed":
          errorMessage = t.networkError
          setErrors((prev) => ({ ...prev, general: errorMessage }))
          break
        default:
          errorMessage = error.message || errorMessage
          setErrors((prev) => ({ ...prev, general: errorMessage }))
      }

      toast({
        title: t.loginFailed,
        description: errorMessage,
        variant: "destructive",
      })

      setIsLoading(false)
    }
  }

  const handleResendVerification = async () => {
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser, {
          url: "https://your-app-domain.com/Auth/FirebaseActionHandler",
        })
        console.log("Verification email sent to:", auth.currentUser.email)
        toast({
          title: t.verificationEmailSent,
          description: t.verificationEmailDesc,
        })
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        await sendEmailVerification(userCredential.user, {
          url: "https://your-app-domain.com/Auth/FirebaseActionHandler",
        })
        console.log("Verification email sent to:", userCredential.user.email)
        toast({
          title: t.verificationEmailSent,
          description: t.verificationEmailDesc,
        })
      }
    } catch (error: any) {
      console.error("Email verification error:", error.code, error.message)
      toast({
        title: t.verificationEmailFailed,
        description: error.message || t.verificationEmailFailedDesc,
        variant: "destructive",
      })
    }
  }

  const handleResetPassword = async () => {
    if (!resetEmail || !/\S+@\S+\.\S+/.test(resetEmail)) {
      toast({
        title: t.invalidResetEmail,
        description: t.invalidResetEmailDesc,
        variant: "destructive",
      })
      return
    }

    setResetEmailLoading(true)

    try {
      await sendPasswordResetEmail(auth, resetEmail, {
        url: "https://your-app-domain.com/Auth/FirebaseActionHandler",
        handleCodeInApp: true,
      })
      console.log("Password reset email sent to:", resetEmail)
      setResetEmailSent(true)
      toast({
        title: t.resetEmailSent,
        description: t.resetEmailSentDesc,
      })
    } catch (error: any) {
      console.error("Password reset error:", error.code, error.message)
      let errorMessage = t.resetPasswordFailedDesc

      switch (error.code) {
        case "auth/invalid-email":
          errorMessage = t.invalidResetEmailDesc
          break
        case "auth/user-not-found":
          errorMessage = t.userNotFoundReset
          break
        case "auth/too-many-requests":
          errorMessage = t.tooManyRequests
          break
        case "auth/network-request-failed":
          errorMessage = t.networkError
          break
        default:
          errorMessage = error.message || t.resetPasswordFailedDesc
      }

      toast({
        title: t.resetPasswordFailed,
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setResetEmailLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const { value } = e.target

    if (field === "email") {
      setEmail(value)
    } else if (field === "password") {
      setPassword(value)
    } else if (field === "reset-email") {
      setResetEmail(value)
    }

    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white"
      dir="rtl"
    >
      <div className="container flex flex-1 items-center justify-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-none shadow-lg">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between flex-row-reverse">
             
                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <Heart className="h-4 w-4 text-purple-800" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-purple-800">{t.welcomeBack}</CardTitle>
              <CardDescription className="text-gray-500">{t.enterCredentials}</CardDescription>
            </CardHeader>
            <CardContent>
              {errors.general && (
                <Alert className="mb-4 bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertTitle className="text-red-600">{t.loginFailed}</AlertTitle>
                  <AlertDescription className="text-red-700">{errors.general}</AlertDescription>
                </Alert>
              )}

              {showVerificationAlert && (
                <Alert className="mb-4 bg-amber-50 border-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="text-amber-600">{t.emailNotVerified}</AlertTitle>
                  <AlertDescription className="text-amber-700">
                    {t.verifyEmailPrompt}{" "}
                    <Button
                      variant="link"
                      className="p-0 h-auto text-amber-700 underline"
                      onClick={handleResendVerification}
                    >
                      {t.resendVerification}
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">
                    {t.email}
                  </Label>
                  <motion.div whileTap={{ scale: 0.99 }}>
                    <Input
                      id="email"
                      type="email"
                      placeholder="البريد@المثال.كوم"
                      required
                      value={email}
                      onChange={(e) => handleInputChange(e, "email")}
                      className={`border-gray-200 focus:border-purple-800 focus:ring-purple-800 ${
                        errors.email ? "border-red-300" : ""
                      } text-right`}
                    />
                  </motion.div>
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between flex-row-reverse">
                    <Label htmlFor="password" className="text-gray-700">
                      {t.password}
                    </Label>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-xs text-gray-500 hover:text-purple-800 transition-colors"
                      onClick={() => {
                        setShowResetDialog(true)
                        setResetEmail(email)
                        setResetEmailSent(false)
                      }}
                    >
                      {t.forgotPassword}
                    </Button>
                  </div>
                  <motion.div whileTap={{ scale: 0.99 }}>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => handleInputChange(e, "password")}
                      className={`border-gray-200 focus:border-purple-800 focus:ring-purple-800 ${
                        errors.password ? "border-red-300" : ""
                      } text-right`}
                    />
                  </motion.div>
                  {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                </div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button
                    type="submit"
                    className="w-full bg-purple-800 hover:bg-purple-900 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        {t.signingIn}
                      </>
                    ) : (
                      t.signIn
                    )}
                  </Button>
                </motion.div>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-center text-sm text-gray-600">
                {t.noAccount}{" "}
                <Link href="/Auth/Register" className="font-medium text-purple-800 hover:text-purple-900 hover:underline">
                  {t.register}
                </Link>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>

      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>{t.resetPassword}</DialogTitle>
            <DialogDescription>
              {resetEmailSent ? t.resetEmailSentDesc : t.resetPasswordDesc}
            </DialogDescription>
          </DialogHeader>
          {!resetEmailSent ? (
            <>
              <div className="flex items-center space-x-2">
                <div className="grid flex-1 gap-2">
                  <Label htmlFor="reset-email" className="sr-only">
                    {t.email}
                  </Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="البريد@المثال.كوم"
                    value={resetEmail}
                    onChange={(e) => handleInputChange(e, "reset-email")}
                    className="text-right"
                  />
                </div>
              </div>
              <DialogFooter className="sm:justify-between flex-row-reverse">
                <Button variant="outline" onClick={() => setShowResetDialog(false)}>
                  {t.cancel}
                </Button>
                <Button
                  type="submit"
                  onClick={handleResetPassword}
                  disabled={resetEmailLoading}
                  className="bg-purple-800 hover:bg-purple-900 text-white"
                >
                  {resetEmailLoading ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      {t.sending}
                    </>
                  ) : (
                    <>
                      <Mail className="ml-2 h-4 w-4" />
                      {t.sendResetLink}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <DialogFooter>
              <Button
                onClick={() => setShowResetDialog(false)}
                className="w-full bg-purple-800 hover:bg-purple-900 text-white"
              >
                {t.close}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}