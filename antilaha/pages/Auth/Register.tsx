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
import { ArrowLeft, Heart, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

const translations = {
  ar: {
    createAccount: "إنشاء حساب",
    enterInfo: "أدخل معلوماتك لإنشاء حسابك",
    back: "رجوع",
    fullName: "الاسم الكامل",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور",
    termsLabel: "أوافق على شروط الخدمة وسياسة الخصوصية",
    termsOfService: "شروط الخدمة",
    privacyPolicy: "سياسة الخصوصية",
    createAccountButton: "إنشاء حساب",
    creatingAccount: "جارٍ إنشاء الحساب...",
    alreadyHaveAccount: "هل لديك حساب بالفعل؟",
    signIn: "تسجيل الدخول",
    formValidationFailed: "فشل التحقق من النموذج",
    checkFormErrors: "يرجى التحقق من الأخطاء في النموذج وحاول مرة أخرى.",
    fullNameRequired: "الاسم الكامل مطلوب",
    fullNameLength: "يجب أن يكون الاسم الكامل 3 أحرف على الأقل",
    emailRequired: "البريد الإلكتروني مطلوب",
    emailInvalid: "البريد الإلكتروني غير صالح",
    passwordRequired: "كلمة المرور مطلوبة",
    passwordLength: "يجب أن تكون كلمة المرور 8 أحرف على الأقل",
    passwordWeak: "كلمة المرور ضعيفة جدًا",
    confirmPasswordRequired: "يرجى تأكيد كلمة المرور",
    passwordsDontMatch: "كلمات المرور غير متطابقة",
    termsRequired: "يجب قبول شروط الخدمة",
    registrationFailed: "فشل التسجيل",
    emailAlreadyInUse: "هذا البريد الإلكتروني مسجل بالفعل. يرجى استخدام بريد إلكتروني آخر أو تسجيل الدخول.",
    invalidEmail: "عنوان البريد الإلكتروني غير صالح.",
    weakPassword: "كلمة المرور ضعيفة جدًا. يرجى اختيار كلمة مرور أقوى.",
    networkError: "خطأ في الشبكة. يرجى التحقق من اتصالك بالإنترنت وحاول مرة أخرى.",
    accountCreated: "تم إنشاء الحساب بنجاح!",
    verificationEmailSent: "لقد أرسلنا بريدًا إلكترونيًا للتحقق إلى",
    verificationRequired: "التحقق مطلوب",
    verificationPrompt: "يرجى التحقق من بريدك الإلكتروني وانقر على رابط التحقق لتفعيل حسابك.",
    verificationEmailSentSuccess: "تم إرسال بريد التحقق",
    verificationEmailSentDesc: "يرجى التحقق من بريدك الوارد للحصول على رابط التحقق.",
    verificationEmailFailed: "فشل إرسال بريد التحقق",
    verificationEmailFailedDesc: "يرجى المحاولة مرة أخرى لاحقًا.",
    checkSpam: "إذا لم ترَ البريد الإلكتروني في بريدك الوارد، يرجى التحقق من مجلد الرسائل غير المرغوب فيها. ستنتهي صلاحية رابط التحقق خلال 24 ساعة.",
    goToLogin: "الذهاب إلى تسجيل الدخول",
    resendVerification: "إعادة إرسال بريد التحقق",
    passwordStrength: "قوة كلمة المرور:",
    weak: "ضعيف",
    fair: "متوسط",
    good: "جيد",
    strong: "قوي",
    passwordCriteria: {
      length: "8 أحرف على الأقل",
      uppercase: "حرف كبير واحد على الأقل",
      number: "رقم واحد على الأقل",
      special: "رمز خاص واحد على الأقل",
    },
  },
}

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [errors, setErrors] = useState<{
    fullName?: string
    email?: string
    password?: string
    confirmPassword?: string
    terms?: string
    general?: string
  }>({})
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)

  const t = translations.ar 

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }

    if (name === "password") {
      calculatePasswordStrength(value)
    }

    if (name === "confirmPassword" && formData.password !== value) {
      setErrors((prev) => ({ ...prev, confirmPassword: t.passwordsDontMatch }))
    } else if (name === "confirmPassword") {
      setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
    }
  }

  const calculatePasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength += 25
    if (/[A-Z]/.test(password)) strength += 25
    if (/[0-9]/.test(password)) strength += 25
    if (/[^A-Za-z0-9]/.test(password)) strength += 25
    setPasswordStrength(strength)
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 25) return "bg-red-500"
    if (passwordStrength <= 50) return "bg-orange-500"
    if (passwordStrength <= 75) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 25) return t.weak
    if (passwordStrength <= 50) return t.fair
    if (passwordStrength <= 75) return t.good
    return t.strong
  }

  const validateForm = () => {
    const newErrors: typeof errors = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = t.fullNameRequired
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = t.fullNameLength
    }

    if (!formData.email) {
      newErrors.email = t.emailRequired
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t.emailInvalid
    }

    if (!formData.password) {
      newErrors.password = t.passwordRequired
    } else if (formData.password.length < 8) {
      newErrors.password = t.passwordLength
    } else if (passwordStrength < 50) {
      newErrors.password = t.passwordWeak
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t.confirmPasswordRequired
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t.passwordsDontMatch
    }

    if (!termsAccepted) {
      newErrors.terms = t.termsRequired
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

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      const user = userCredential.user

      await updateProfile(user, {
        displayName: formData.fullName,
      })

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        fullName: formData.fullName,
        email: formData.email,
        compliantRole: "customer",
        emailVerified: false,
        createdAt: new Date(),
      })

      await sendEmailVerification(user)

      setRegistrationSuccess(true)

      toast({
        title: t.accountCreated,
        description: `${t.verificationEmailSent} ${formData.email}`,
        variant: "default",
      })
    } catch (error: any) {
      console.error("Registration error:", error)

      let errorMessage = t.registrationFailed

      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage = t.emailAlreadyInUse
          setErrors((prev) => ({ ...prev, email: t.emailAlreadyInUse }))
          break
        case "auth/invalid-email":
          errorMessage = t.invalidEmail
          setErrors((prev) => ({ ...prev, email: t.invalidEmail }))
          break
        case "auth/weak-password":
          errorMessage = t.weakPassword
          setErrors((prev) => ({ ...prev, password: t.weakPassword }))
          break
        case "auth/network-request-failed":
          errorMessage = t.networkError
          setErrors((prev) => ({ ...prev, general: t.networkError }))
          break
        default:
          errorMessage = error.message || errorMessage
          setErrors((prev) => ({ ...prev, general: errorMessage }))
      }

      toast({
        title: t.registrationFailed,
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  }

  if (registrationSuccess) {
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
                <div className="flex items-center justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-center text-purple-800">
                  {t.accountCreated}
                </CardTitle>
                <CardDescription className="text-center text-gray-500">
                  {t.verificationEmailSent} <span className="font-medium">{formData.email}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-600">{t.verificationRequired}</AlertTitle>
                  <AlertDescription className="text-blue-700">{t.verificationPrompt}</AlertDescription>
                </Alert>
                <div className="text-sm text-gray-600 text-right">
                  <p>{t.checkSpam}</p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button
                  className="w-full bg-purple-800 hover:bg-purple-900 text-white"
                  onClick={() => router.push("/Auth/Login")}
                >
                  {t.goToLogin}
                </Button>
                <div className="text-center text-sm text-gray-600">
                  <Button
                    variant="link"
                    className="p-0 h-auto font-medium text-purple-800 hover:text-purple-900"
                    onClick={() => {
                      if (auth.currentUser) {
                        sendEmailVerification(auth.currentUser)
                          .then(() => {
                            toast({
                              title: t.verificationEmailSentSuccess,
                              description: t.verificationEmailSentDesc,
                            })
                          })
                          .catch((error) => {
                            toast({
                              title: t.verificationEmailFailed,
                              description: error.message || t.verificationEmailFailedDesc,
                              variant: "destructive",
                            })
                          })
                      }
                    }}
                  >
                    {t.resendVerification}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>
    )
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
                <Link
                  href="/"
                  className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-purple-800 transition-colors"
                >
                  {t.back}
                  <ArrowLeft className="ml-2 h-4 w-4" />
                </Link>
                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <Heart className="h-4 w-4 text-purple-800" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-purple-800">{t.createAccount}</CardTitle>
              <CardDescription className="text-gray-500">{t.enterInfo}</CardDescription>
            </CardHeader>
            <CardContent>
              {errors.general && (
                <Alert className="mb-4 bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertTitle className="text-red-600">{t.registrationFailed}</AlertTitle>
                  <AlertDescription className="text-red-700">{errors.general}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleSubmit}>
                <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
                  <motion.div className="space-y-2" variants={itemVariants}>
                    <Label htmlFor="fullName" className="text-gray-700">
                      {t.fullName}
                    </Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      placeholder="جون دو"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      className={`border-gray-200 focus:border-purple-800 focus:ring-purple-800 ${
                        errors.fullName ? "border-red-300" : ""
                      } text-right`}
                    />
                    {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
                  </motion.div>
                  <motion.div className="space-y-2" variants={itemVariants}>
                    <Label htmlFor="email" className="text-gray-700">
                      {t.email}
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="البريد@المثال.كوم"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className={`border-gray-200 focus:border-purple-800 focus:ring-purple-800 ${
                        errors.email ? "border-red-300" : ""
                      } text-right`}
                    />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </motion.div>
                  <motion.div className="space-y-2" variants={itemVariants}>
                    <Label htmlFor="password" className="text-gray-700">
                      {t.password}
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className={`border-gray-200 focus:border-purple-800 focus:ring-purple-800 ${
                        errors.password ? "border-red-300" : ""
                      } text-right`}
                    />
                    {formData.password && (
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center justify-between flex-row-reverse text-xs">
                          <span>{t.passwordStrength}</span>
                          <span className={passwordStrength > 75 ? "text-green-600" : "text-gray-600"}>
                            {getPasswordStrengthText()}
                          </span>
                        </div>
                        <Progress value={passwordStrength} className={`h-1 ${getPasswordStrengthColor()}`} />
                        <ul className="text-xs text-gray-500 space-y-1 mt-2 text-right">
                          <li className={formData.password.length >= 8 ? "text-green-600" : ""}>
                            • {t.passwordCriteria.length}
                          </li>
                          <li className={/[A-Z]/.test(formData.password) ? "text-green-600" : ""}>
                            • {t.passwordCriteria.uppercase}
                          </li>
                          <li className={/[0-9]/.test(formData.password) ? "text-green-600" : ""}>
                            • {t.passwordCriteria.number}
                          </li>
                          <li className={/[^A-Za-z0-9]/.test(formData.password) ? "text-green-600" : ""}>
                            • {t.passwordCriteria.special}
                          </li>
                        </ul>
                      </div>
                    )}
                    {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                  </motion.div>
                  <motion.div className="space-y-2" variants={itemVariants}>
                    <Label htmlFor="confirmPassword" className="text-gray-700">
                      {t.confirmPassword}
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`border-gray-200 focus:border-purple-800 focus:ring-purple-800 ${
                        errors.confirmPassword ? "border-red-300" : ""
                      } text-right`}
                    />
                    {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
                  </motion.div>
                  <motion.div className="flex items-start space-x-reverse space-x-2" variants={itemVariants}>
                    <Checkbox
                      id="terms"
                      className={`border-gray-300 text-purple-800 focus:ring-purple-800 mt-1 ${
                        errors.terms ? "border-red-300" : ""
                      }`}
                      checked={termsAccepted}
                      onCheckedChange={(checked) => {
                        setTermsAccepted(checked as boolean)
                        if (checked) {
                          setErrors((prev) => ({ ...prev, terms: undefined }))
                        }
                      }}
                    />
                    <div>
                      <label
                        htmlFor="terms"
                        className="text-sm font-medium leading-none text-gray-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {t.termsLabel}
                      </label>
                      {errors.terms && <p className="text-xs text-red-500 mt-1">{errors.terms}</p>}
                    </div>
                  </motion.div>
                  <motion.div
                    variants={itemVariants}
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
                          {t.creatingAccount}
                        </>
                      ) : (
                        t.createAccountButton
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col">
              <div className="text-center text-sm text-gray-600">
                {t.alreadyHaveAccount}{" "}
                <Link href="/Auth/Login" className="font-medium text-purple-800 hover:text-purple-900 hover:underline">
                  {t.signIn}
                </Link>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}