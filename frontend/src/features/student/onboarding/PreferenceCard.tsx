import React from 'react';
import { cn } from '@/utils/cn';
import { handleActionKeyDown } from '@/utils/a11y';
import { Check } from 'lucide-react';
import * as Icons from 'lucide-react';

export interface PreferenceCardProps {
  id: string;
  title: string;
  description: string;
  iconName?: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
  isMultiSelect?: boolean;
}

export const PreferenceCard: React.FC<PreferenceCardProps> = ({
  id,
  title,
  description,
  iconName,
  isSelected,
  onSelect,
  isMultiSelect = true,
}) => {
  const iconDict = Icons as unknown as Record<string, React.ElementType>;
  const IconComponent = (iconName && iconDict[iconName]) ? iconDict[iconName] : Icons.Sparkles;

  return (
    <div
      tabIndex={0}
      role={isMultiSelect ? 'checkbox' : 'radio'}
      aria-checked={isSelected}
      onClick={() => onSelect(id)}
      onKeyDown={(e) => handleActionKeyDown(e, () => onSelect(id))}
      className={cn(
        'relative overflow-hidden rounded-2xl p-5 cursor-pointer border-2 transition-all duration-300 select-none flex items-start gap-4',
        'focus-visible:outline-none',
        isSelected
          ? 'bg-white dark:bg-slate-900 border-teal-500 dark:border-yellow-400 shadow-lg glow-mint'
          : 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-teal-300 dark:hover:border-slate-700 hover:shadow-md'
      )}
    >
      {/* Icon Circle */}
      <div
        className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors',
          isSelected
            ? 'bg-teal-600 dark:bg-yellow-400 text-white dark:text-black shadow-md'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
        )}
      >
        <IconComponent className="w-6 h-6" aria-hidden="true" />
      </div>

      {/* Content */}
      <div className="flex-1 pr-6">
        <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100 mb-1">
          {title}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Selection Check Indicator */}
      <div
        className={cn(
          'absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
          isSelected
            ? 'bg-teal-600 dark:bg-yellow-400 border-teal-600 dark:border-yellow-400 text-white dark:text-black shadow-xs'
            : 'border-slate-300 dark:border-slate-700 bg-transparent'
        )}
      >
        {isSelected && <Check className="w-4 h-4 stroke-[3]" aria-hidden="true" />}
      </div>
    </div>
  );
};
