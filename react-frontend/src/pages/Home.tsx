import { MainLayout } from "../components/templates/MainLayout";
import { Text } from "../components/atoms/Text";
import { Heading } from "../components/atoms/Heading";
import { Card } from "../components/organisms/Card";

export const Home = () => {
  return (
    <MainLayout>
      <Heading level={1} className="mb-4">
        Welcome to MyApp 🚀
      </Heading>

      <Text className="mb-6">
        This is a scalable React architecture using Atomic Design.
      </Text>

      <div className="grid md:grid-cols-3 gap-6">
        <Card
          title="Fast Development"
          description="Using Vite + React + TypeScript"
        />
        <Card title="Reusable Components" description="Atomic Design Pattern" />
        <Card title="Modern Styling" description="Tailwind CSS" />
      </div>
    </MainLayout>
  );
};
