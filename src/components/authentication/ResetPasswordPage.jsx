import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { Formik, Field } from "formik"
import * as Yup from "yup"
import { Lock } from "lucide-react"
import FormInput from "../common/FormInput"
import { resetPasswordWithToken } from "../../utils/authUtils"
import { showToast, TOAST_TYPES } from "../../utils/toastUtils"

const resetSchema = Yup.object({
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .max(20, "Password must not exceed 20 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])/,
      "Password must contain at least one uppercase letter, and one special character")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Please confirm your password")
})

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const [token, setToken] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    const tokenParam = searchParams.get("resetToken")
    if (tokenParam) {
      setToken(tokenParam)
    } else {
      showToast("Invalid or missing reset token", TOAST_TYPES.ERROR)
      navigate("/")
    }
  }, [searchParams, navigate])

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      const result = await resetPasswordWithToken(token, values.password)
      if (result.success) {
        showToast(result.message, TOAST_TYPES.SUCCESS)
        // Redirect to home/login
        navigate("/")
      }
    } catch (error) {
      console.error('Reset password error:', error)
      setFieldError('password', error.message)
      showToast(error.message, TOAST_TYPES.ERROR)
    } finally {
      setSubmitting(false)
    }
  }

  if (!token) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col pt-24 sm:pt-32 pb-12 px-4 sm:px-6 relative overflow-hidden transition-colors duration-300">
      {/* Background gradients similar to Auth modals */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 dark:bg-purple-900/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 dark:bg-blue-900/20 blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-md mx-auto relative z-10">
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 sm:p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Reset Your Password
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Please enter your new password below.
            </p>
          </div>

          <Formik
            initialValues={{ password: "", confirmPassword: "" }}
            validationSchema={resetSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, handleSubmit: formikSubmit }) => (
              <div className="space-y-4">
                <Field name="password">
                  {({ field, form }) => (
                    <FormInput
                      field={field}
                      form={form}
                      placeholder="New password"
                      icon={Lock}
                      showPasswordToggle
                      showPassword={showPassword}
                      onPasswordToggle={() => setShowPassword(!showPassword)}
                    />
                  )}
                </Field>

                <Field name="confirmPassword">
                  {({ field, form }) => (
                    <FormInput
                      field={field}
                      form={form}
                      placeholder="Confirm new password"
                      icon={Lock}
                      showPasswordToggle
                      showPassword={showConfirmPassword}
                      onPasswordToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                    />
                  )}
                </Field>

                <button
                  type="button"
                  onClick={formikSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transform hover:scale-[1.02] transition-all duration-300 shadow-lg mt-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            )}
          </Formik>
        </div>
      </div>
    </div>
  )
}
