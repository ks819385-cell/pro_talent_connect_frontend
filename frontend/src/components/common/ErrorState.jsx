const ErrorState = ({ icon: Icon, title, message, onRetry }) => {
  return (
    <div className="text-center py-20">
      <div className="inline-block p-6 bg-red-500/5 border border-red-500/10 rounded-3xl mb-6">
        <Icon className="w-16 h-16 text-red-500 mx-auto" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-400 mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300 shadow-lg shadow-red-500/50"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorState;
