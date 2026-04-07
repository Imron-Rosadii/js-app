import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "../atoms/Button";
import { SearchBar } from "../molecules/SearchBar";
import { useAuth } from "../../contexts/AuthContext"; // 🔥 ambil dari context

export const Navbar = ({ onSearch }: { onSearch?: (q: string) => void }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { user, logout } = useAuth(); // 🔥 langsung dari context

  const displayName = user?.name || user?.email || "User";

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/">
            <h1 className="text-xl font-bold">MyApp</h1>
          </Link>

          <div className="hidden md:flex items-center space-x-4">
            {onSearch && <SearchBar onSearch={onSearch} />}

            {user ? (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center">
                  {displayName.charAt(0).toUpperCase()}
                </div>

                <span>Hi, {displayName}</span>

                <Button onClick={logout} variant="outline" size="sm">
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link to="/register">
                  <Button>Register</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile button */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)}>☰</button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden p-4 space-y-3">
          {user ? (
            <>
              <p>Hi, {displayName}</p>
              <Button
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};
