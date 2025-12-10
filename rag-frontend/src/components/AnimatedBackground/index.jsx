const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Moving gradient backdrop */}
      <div className="absolute inset-0 bg-animate opacity-60"></div>

      {/* Floating blurred circles */}
      <div
        className="absolute w-72 h-72 rounded-full blur-[120px] opacity-40
                bg-(--grad-2) top-10 left-10 animate-pulse"
      ></div>
      <div
        className="absolute w-72 h-72 rounded-full blur-[120px] opacity-40
                bg-(--grad-3) bottom-10 right-10 animate-pulse"
      ></div>
    </div>
  );
};

export default AnimatedBackground;
