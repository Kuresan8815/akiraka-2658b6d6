import { AuthLayout } from "@/components/auth/AuthLayout";
import { SignUpForm } from "@/components/auth/SignUpForm";

const Register = () => {
  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join our community of sustainable shoppers"
    >
      <SignUpForm />
    </AuthLayout>
  );
};

export default Register;