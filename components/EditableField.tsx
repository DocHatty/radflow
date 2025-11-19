import React, { useRef } from 'react';

const EditableField: React.FC<{ value: string | null; onSave: (newValue: string) => void; className?: string }> = ({ value, onSave, className }) => {
    const ref = useRef<HTMLDivElement>(null);

    const handleBlur = () => {
        if (ref.current && ref.current.innerText.trim() !== (value || '')) {
            onSave(ref.current.innerText.trim());
        }
    };
    
    // Using a key ensures the component re-renders and displays the correct external value
    // if the state is updated from somewhere else (e.g., an item is rejected).
    return (
        <div
            key={value}
            ref={ref}
            contentEditable
            suppressContentEditableWarning
            onBlur={handleBlur}
            role="textbox"
            aria-multiline="false"
            className={`outline-none focus:bg-[var(--color-interactive-bg-hover)] rounded-sm px-2 -mx-2 py-1 -my-1 transition-all focus:ring-1 focus:ring-[var(--color-primary)] ${className}`}
            dangerouslySetInnerHTML={{ __html: value || '' }}
        />
    );
};

export default EditableField;