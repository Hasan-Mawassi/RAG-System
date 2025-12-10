import React, { useState } from "react";

const icons = [
  "📄", // PDF
  "🤖", // AI bot
  "🔍", // Retrieval
  "💬", // Chat
  "📘", // Document knowledge
  "🧠", // LLM brain
  "📝", // Notes
  "🌑",
  "🚀",
];

const RagLoginBackground = () => {
  // Generate RANDOM values only once using lazy initializer
  const [iconPositions] = useState(() =>
    Array.from({ length: 14 }).map(() => ({
      left: Math.random() * 90,
      top: Math.random() * 90,
      delay: Math.random() * 6,
      duration: 7 + Math.random() * 6,
      icon: icons[Math.floor(Math.random() * icons.length)],
    }))
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none bg-animate z-0">
      {iconPositions.map((pos, index) => (
        <span
          key={index}
          className="absolute text-4xl opacity-[0.28] animate-floatingIcon select-none"
          style={{
            left: `${pos.left}%`,
            top: `${pos.top}%`,
            animationDelay: `${pos.delay}s`,
            animationDuration: `${pos.duration}s`,
          }}
        >
          {pos.icon}
        </span>
      ))}
    </div>
  );
};

export default RagLoginBackground;