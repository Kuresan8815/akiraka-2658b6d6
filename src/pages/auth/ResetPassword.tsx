import { AuthLayout } from "@/components/auth/AuthLayout";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

const ResetPassword = () => {
  return (
    <AuthLayout
      title="Set New Password"
      subtitle="Create a new password for your account"
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
};

export default ResetPassword;