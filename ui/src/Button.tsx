import { useState } from "endr";

export default function Button({
  onclick,
  children,
  className,
  type,
}: {
  onclick: (e) => void;
  children: string;
  className?: string;
  type?: "button" | "submit" | "reset";
}) {
  const [isPressed, setIsPressed] = useState(false);
  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);

  return (
    <button
      onclick={onclick}
      onpointerdown={handleMouseDown}
      onpointerup={handleMouseUp}
      onpointerleave={handleMouseUp}
      onmouseleave={handleMouseUp}
      className={`px-4 py-2 rounded-md text-white text-center align-middle transition-shadow
                  ${isPressed ? "bg-gray-600 scale-[0.98]" : "bg-gray-500"}
                  ${className}`}
      type={type}
    >
      {children}
    </button>
  );
}
