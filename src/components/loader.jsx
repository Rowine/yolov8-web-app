const Loader = (props) => {
  return (
    <div className="fixed inset-0 bg-green-50/80 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-sm text-center">
        <div className="animate-spin h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-700">{props.children}</p>
      </div>
    </div>
  );
};

export default Loader;
