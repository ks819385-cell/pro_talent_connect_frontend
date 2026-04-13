import { Link } from "react-router-dom";
import { HomeIcon } from "@heroicons/react/24/outline";

const Pagenotfound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-950 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* 404 Number */}
        <h1 className="text-9xl font-bold bg-gradient-to-r from-red-500 via-red-600 to-red-500 bg-clip-text text-transparent mb-4">
          404
        </h1>

        {/* Message */}
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Page Not Found
        </h2>
        <p className="text-white/60 text-lg mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* CTA Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-8 py-3 bg-[#C4161C] text-white font-semibold rounded-lg transition-all hover:opacity-90 hover:shadow-lg hover:shadow-red-500/50 transform hover:scale-105"
        >
          <HomeIcon className="w-5 h-5" />
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default Pagenotfound;
