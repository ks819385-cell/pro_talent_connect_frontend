const Newsletter = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription
  };

  return (
    <section className="relative py-24 px-4 mt-20">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-red-500 rounded-3xl p-12 md:p-16 shadow-2xl shadow-red-500/50 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <p className="text-white/90 text-lg mb-8">
              Subscribe to our newsletter for the latest football news and player updates
            </p>
            
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                required
                className="flex-1 px-6 py-4 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-white/30"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
