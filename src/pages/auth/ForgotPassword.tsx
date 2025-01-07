import { AuthLayout } from "@/components/auth/AuthLayout";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

const ForgotPassword = () => {
  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your email to reset your password"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
};

export default ForgotPassword;