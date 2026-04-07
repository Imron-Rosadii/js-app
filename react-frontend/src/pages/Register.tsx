import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthLayout } from "../components/templates/AuthLayout";
import { FormGroup } from "../components/molecules/Formgroup";
import { Text } from "../components/atoms/Text";
import { useAuth } from "../contexts/AuthContext";
import type { FormField } from "../types";

export const Register = () => {
  const navigate = useNavigate();
  const { register, loading: authLoading, user } = useAuth();

  const [error, setError] = useState("");
  // 🔥 redirect kalau sudah login
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const fields: FormField[] = [
    {
      name: "name",
      label: "Name",
      type: "text",
      required: true,
      placeholder: "Nama Anda",
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      required: true,
      placeholder: "user@example.com",
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      required: true,
      placeholder: "Minimal 6 karakter",
    },
  ];

  const handleRegister = async (data: Record<string, unknown>) => {
    setError("");

    const result = await register(
      data.name as string,
      data.email as string,
      data.password as string,
    );

    if (result.success) {
      // ✅ redirect setelah register
      navigate("/");
    } else {
      setError(result.error || "Register gagal");
    }
  };

  return (
    <AuthLayout title="Create new account">
      <FormGroup
        fields={fields}
        onSubmit={handleRegister}
        submitText="Register"
        loading={authLoading}
      >
        {error && (
          <Text variant="error" className="text-center">
            {error}
          </Text>
        )}

        <Text variant="small" className="text-center">
          Sudah punya akun?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login di sini
          </Link>
        </Text>
      </FormGroup>
    </AuthLayout>
  );
};
