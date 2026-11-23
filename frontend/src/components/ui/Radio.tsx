import React from 'react';
import { cn } from '@/utils/cn';

export interface RadioOption {
  value: string;
  label: string;
  hint?: string;
}

export interface RadioGroupProps {
  name: string;
  legend: string;
  options: RadioOption[];
  selectedValue?: string;
  onChange: (value: string) => void;
  hint?: string;
  errorMessage?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  legend,
  options,
  selectedValue,
  onChange,
  hint,
  errorMessage,
}) => {
  const legendId = `${name}-legend`;
  const hintId = hint ? `${name}-hint` : undefined;
  const errorId = errorMessage ? `${name}-error` : undefined;

  return (
    <fieldset className="flex flex-col gap-2 border-none p-0 m-0" aria-labelledby={legendId} aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}>
      <legend id={legendId} className="font-semibold text-base text-slate-900 dark:text-slate-100 mb-1">
        {legend}
      </legend>

      {hint && (
        <p id={hintId} className="text-sm text-slate-600 dark:text-slate-300 -mt-1 mb-1">
          {hint}
        </p>
      )}

      <div className="flex flex-col gap-3">
        {options.map((opt) => {
          const optionId = `${name}-${opt.value}`;
          const isChecked = selectedValue === opt.value;

          return (
            <div key={opt.value} className="flex items-start gap-3 select-none">
              <div className="relative flex items-center justify-center mt-0.5">
                <input
                  type="radio"
                  id={optionId}
                  name={name}
                  value={opt.value}
                  checked={isChecked}
                  onChange={() => onChange(opt.value)}
                  className={cn(
                    'peer appearance-none w-6 h-6 rounded-full border-2 border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-900 cursor-pointer',
                    'checked:border-blue-600 dark:checked:border-yellow-400',
                    'focus-visible:outline-none'
                  )}
                />
                <span className="w-3 h-3 rounded-full bg-blue-600 dark:bg-yellow-400 absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
              </div>
              <div className="flex flex-col">
                <label htmlFor={optionId} className="font-medium text-base text-slate-900 dark:text-slate-100 cursor-pointer">
                  {opt.label}
                </label>
                {opt.hint && <p className="text-sm text-slate-600 dark:text-slate-300">{opt.hint}</p>}
              </div>
            </div>
          );
        })}
      </div>

      {errorMessage && (
        <p id={errorId} role="alert" className="text-red-600 dark:text-red-400 text-sm font-semibold mt-1">
          {errorMessage}
        </p>
      )}
    </fieldset>
  );
};
