import type { FormField } from "../../types";
import { Input } from "../atoms/Input";
import { Button } from "../atoms/Button";

interface Props {
  fields: FormField[];
  onSubmit: (data: Record<string, unknown>) => void;
  submitText?: string;
  loading?: boolean;
  children?: React.ReactNode; // Tambahkan ini
}

export const FormGroup = ({
  fields,
  onSubmit,
  submitText = "Submit",
  loading = false,
  children, // Tambahkan ini
}: Props) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {};

    fields.forEach((field) => {
      data[field.name] = formData.get(field.name);
    });

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((field) => (
        <Input
          key={field.name}
          label={field.label}
          type={field.type}
          name={field.name}
          placeholder={field.placeholder}
          required={field.required}
        />
      ))}
      <Button type="submit" variant="primary" disabled={loading}>
        {loading ? "Loading..." : submitText}
      </Button>
      {children} {/* Tambahkan ini */}
    </form>
  );
};
