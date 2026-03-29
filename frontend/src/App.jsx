import { lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import {
  HeroSection,
  StatsSection,
  FeaturedPlayers,
} from "./components/HomeComponents";
import "./App.css";

// Lazy-loaded pages for code splitting
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogDetailPage = lazy(() => import("./pages/BlogDetailPage"));
const About = lazy(() => import("./pages/About"));
const Players = lazy(() => import("./pages/Players"));
const Services = lazy(() => import("./pages/Services"));
const Contact = lazy(() => import("./pages/Contact"));
const Login = lazy(() => import("./pages/Login"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Pagenotfound = lazy(() => import("./components/Pagenotfound"));

// Loading fallback for lazy-loaded routes
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-950">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 text-sm">Loading...</p>
    </div>
  </div>
);

function App() {
  const location = useLocation();

  // Don't show NavBar and Footer for login and admin pages
  const showLayout =
    !location.pathname.includes("login") &&
    !location.pathname.includes("admin");

  return (
    <div className="min-h-screen">
      <ScrollToTop />
      {showLayout && <NavBar />}
      <div className="md:pb-0 pb-16">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route
              path="/"
              element={
                <div className="min-h-screen bg-linear-to-b from-gray-900 via-black to-gray-950">
                  <main>
                    <HeroSection />
                    <FeaturedPlayers />
                    <StatsSection />
                  </main>
                </div>
              }
            />
            <Route path="/about" element={<About />} />
            <Route path="/players" element={<Players />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:id" element={<BlogDetailPage />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<Pagenotfound />} />
          </Routes>
        </Suspense>
        {showLayout && <Footer />}
      </div>
    </div>
  );
}

export default App;
