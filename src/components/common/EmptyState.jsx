const EmptyState = ({ icon: Icon, title, message, action }) => {
  return (
    <div className="text-center py-20">
      <div className="inline-block p-6 bg-white/5 border border-white/10 rounded-3xl mb-6">
        <Icon className="w-16 h-16 text-gray-400 mx-auto" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-400 mb-6">{message}</p>
      {action}
    </div>
  );
};

export default EmptyState;
