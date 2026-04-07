import { Text } from "../atoms/Text";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-3">About Us</h3>
            <Text variant="small" className="text-gray-300">
              Building modern web applications with React, Vite, and Tailwind
              CSS.
            </Text>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-300 hover:text-white">
                  Home
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-300 hover:text-white">
                  About
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3">Contact</h3>
            <Text variant="small" className="text-gray-300">
              Email: info@myapp.com
            </Text>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-6 pt-6 text-center">
          <Text variant="small" className="text-gray-400">
            &copy; 2026 MyApp. All rights reserved.
          </Text>
        </div>
      </div>
    </footer>
  );
};
