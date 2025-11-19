import React from 'react';
import EditableField from './EditableField';
import { XIcon } from './Icons';
import { RejectableItem } from '../types';

interface BriefSectionProps {
  title: string;
  items: RejectableItem[];
  onUpdate: (index: number, newValue: string) => void;
  onReject: (index: number) => void;
  isRejectable?: boolean;
}

const BriefSection: React.FC<BriefSectionProps> = ({ title, items, onUpdate, onReject, isRejectable = true }) => {
  if (!items || items.length === 0) {
    return null;
  }

  const activeItemsWithOriginalIndex = items
    .map((item, index) => ({ ...item, originalIndex: index }))
    .filter(item => !item.isRejected);
    
  if (activeItemsWithOriginalIndex.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <h4 className="text-xs font-bold uppercase text-[var(--color-secondary)] tracking-wider mb-2">{title}</h4>
      <ul className="space-y-1.5 text-sm">
        {activeItemsWithOriginalIndex.map((item) => (
          <li key={item.originalIndex} className="flex items-start justify-between group">
            <EditableField
              value={item.value}
              onSave={(newValue) => onUpdate(item.originalIndex, newValue)}
              className="flex-grow text-[var(--color-text-default)]"
            />
            {isRejectable && (
              <button
                onClick={() => onReject(item.originalIndex)}
                title={`Reject ${title.slice(0, -1)}`}
                className="ml-2 p-1 rounded-full text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 hover:bg-[var(--color-interactive-bg-hover)] hover:text-[var(--color-danger-text)] transition-opacity"
              >
                <XIcon className="h-4 w-4" />
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BriefSection;