import React, { useState } from "react";

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  startOpen?: boolean;
}

const Accordion: React.FC<AccordionProps> = ({ title, children, startOpen = false }) => {
  const [isOpen, setIsOpen] = useState(startOpen);

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <div className="border border-(--color-border) rounded-lg bg-(--color-panel-bg)/50">
      <button
        onClick={toggleOpen}
        className="w-full flex justify-between items-center p-4 text-left font-semibold text-(--color-text-bright) hover:bg-(--color-interactive-bg-hover) transition-colors rounded-t-lg"
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <svg
          className={`w-5 h-5 transition-transform duration-300 ${isOpen ? "transform rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          ></path>
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="p-4 border-t border-(--color-border)">{children}</div>
      </div>
    </div>
  );
};

export default Accordion;
