import { XMarkIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

const SuccessModal = ({ show, message, onClose }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-gray-900 via-black to-gray-950 border border-white/10 rounded-2xl p-8 max-w-md w-full relative shadow-2xl shadow-black/20">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <div className="text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon className="w-10 h-10 text-green-500" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Success!</h3>
          <p className="text-gray-300 mb-6">{message}</p>
          <button
            onClick={onClose}
            className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all shadow-lg shadow-red-500/30"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
