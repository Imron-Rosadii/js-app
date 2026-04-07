import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthLayout } from "../components/templates/AuthLayout";
import { FormGroup } from "../components/molecules/Formgroup";
import { Text } from "../components/atoms/Text";
import { useAuth } from "../contexts/AuthContext";
import type { FormField } from "../types";

export const Login = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔥 redirect kalau sudah login
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const fields: FormField[] = [
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
      placeholder: "Masukkan password Anda",
    },
  ];

  const handleLogin = async (data: Record<string, unknown>) => {
    setError("");
    setLoading(true);

    const email = String(data.email || "");
    const password = String(data.password || "");

    const result = await login(email, password);

    if (result.success) {
      navigate("/");
    } else {
      setError(result.error || "Login gagal");
    }

    setLoading(false);
  };

  return (
    <AuthLayout title="Login ke akun Anda">
      <FormGroup
        fields={fields}
        onSubmit={handleLogin}
        submitText="Login"
        loading={loading}
      >
        {error && (
          <Text variant="error" className="text-center">
            {error}
          </Text>
        )}

        <Text variant="small" className="text-center">
          Belum punya akun?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Daftar di sini
          </Link>
        </Text>
      </FormGroup>
    </AuthLayout>
  );
};
