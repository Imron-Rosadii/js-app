import { MainLayoutProps } from "../../types";
import { Navbar } from "../organisms/Navbar";
import { Footer } from "../organisms/Footer";

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  onSearch,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar onSearch={onSearch} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};
