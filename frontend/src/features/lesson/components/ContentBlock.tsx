'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { LessonContentBlock } from '../types/Lesson';

// ─── Type guards ──────────────────────────────────────────────────────────────
function parseBoxes(content: string) {
  try {
    return JSON.parse(content) as { name: string; value: string; type: string }[];
  } catch {
    return [];
  }
}

function parseChecklist(options: string[] | undefined): string[] {
  return options ?? [];
}

// ─── Code Block ──────────────────────────────────────────────────────────────
const CodeBlock: React.FC<{ block: LessonContentBlock; highContrast: boolean }> = ({
  block,
  highContrast,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(block.content ?? '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available */
    }
  };

  return (
    <div
      className={cn(
        'rounded-xl border overflow-hidden shadow-sm',
        highContrast
          ? 'border-slate-800 bg-slate-900'
          : 'border-slate-200 bg-slate-900'
      )}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <span className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">
          {block.language ?? 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          aria-label={copied ? 'Copied!' : 'Copy code'}
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Code content */}
      <pre
        className="p-4 text-sm font-mono text-slate-100 overflow-x-auto leading-relaxed"
        tabIndex={0}
        aria-label={`${block.language ?? 'Code'} example: ${block.title ?? ''}`}
      >
        <code>{block.content ?? ''}</code>
      </pre>
    </div>
  );
};

// ─── Visual Box Explanation (for 'example' type with JSON box data) ───────────
const VariableBoxes: React.FC<{ content: string }> = ({ content }) => {
  const boxes = parseBoxes(content);
  if (!boxes.length) {
    return <p className="text-slate-600 italic text-sm">{content}</p>;
  }
  return (
    <div
      className="flex flex-wrap gap-4"
      role="img"
      aria-label="Variable boxes visual explanation"
    >
      {boxes.map((box) => (
        <div key={box.name} className="flex flex-col items-center">
          <div className="rounded-t-lg bg-cyan-600 text-white text-xs font-bold px-4 py-1.5 tracking-wide">
            {box.name}
          </div>
          <div className="border-2 border-cyan-600 rounded-b-lg bg-white min-w-[80px] px-4 py-3 text-center">
            <span className="text-slate-900 font-bold text-base">{box.value}</span>
            <br />
            <span className="text-slate-400 text-xs">{box.type}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Main ContentBlock Component ──────────────────────────────────────────────
interface ContentBlockProps {
  block: LessonContentBlock;
  highContrast?: boolean;
  increasedSpacing?: boolean;
  simplified?: boolean;
}

export const ContentBlock: React.FC<ContentBlockProps> = ({
  block,
  highContrast = false,
  increasedSpacing = false,
  simplified = false,
}) => {
  const spaceClass = increasedSpacing ? 'mb-8' : 'mb-4';

  switch (block.type) {
    case 'heading':
      return (
        <h3
          className={cn('text-xl font-extrabold text-slate-900', spaceClass)}
        >
          {block.title ?? block.content}
        </h3>
      );

    case 'paragraph':
      return (
        <p
          className={cn(
            'text-slate-700 leading-relaxed',
            simplified ? 'text-base' : 'text-[1.05rem]',
            spaceClass
          )}
        >
          {block.content}
        </p>
      );

    case 'highlight':
      return (
        <div
          className={cn(
            'px-4 py-3 rounded-xl border-l-4 border-cyan-500 bg-cyan-50 text-cyan-900',
            spaceClass
          )}
        >
          <p className="text-sm font-semibold leading-relaxed">{block.content}</p>
        </div>
      );

    case 'tip':
      return (
        <div
          className={cn(
            'flex gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200',
            spaceClass
          )}
          role="note"
          aria-label={`Tip: ${block.title ?? ''}`}
        >
          <div className="flex-1 space-y-0.5">
            {block.title && (
              <p className="text-sm font-bold text-amber-800">{block.title}</p>
            )}
            <p className="text-sm text-amber-700 leading-relaxed">
              {block.content}
            </p>
          </div>
        </div>
      );

    case 'warning':
      return (
        <div
          className={cn(
            'flex gap-3 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200',
            spaceClass
          )}
          role="note"
          aria-label={`Warning: ${block.title ?? ''}`}
        >
          <div className="flex-1 space-y-0.5">
            {block.title && (
              <p className="text-sm font-bold text-rose-700">{block.title}</p>
            )}
            <p className="text-sm text-rose-700 leading-relaxed">{block.content}</p>
          </div>
        </div>
      );

    case 'definition':
      return (
        <div
          className={cn(
            'px-4 py-3 rounded-xl bg-violet-50 border border-violet-200',
            spaceClass
          )}
        >
          {block.title && (
            <p className="text-xs font-bold text-violet-500 uppercase tracking-widest mb-1">
              Definition — {block.title}
            </p>
          )}
          <p className="text-sm text-violet-900 font-medium leading-relaxed">
            {block.content}
          </p>
        </div>
      );

    case 'checklist': {
      const items = parseChecklist(block.options);
      return (
        <div className={cn('space-y-2', spaceClass)}>
          {block.title && (
            <p className="text-sm font-bold text-slate-700">{block.title}</p>
          )}
          <ul className="space-y-1.5" aria-label={block.title ?? 'Checklist'}>
            {items.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-slate-700 text-sm"
              >
                <span
                  className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold"
                  aria-hidden="true"
                >
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      );
    }

    case 'code':
      return (
        <div className={spaceClass}>
          {block.title && (
            <p className="text-sm font-bold text-slate-600 mb-2">{block.title}</p>
          )}
          <CodeBlock block={block} highContrast={highContrast} />
        </div>
      );

    case 'example':
      return (
        <div
          className={cn(
            'p-4 rounded-xl bg-slate-50 border border-slate-200',
            spaceClass
          )}
        >
          {block.title && (
            <p className="text-sm font-bold text-slate-600 mb-3">{block.title}</p>
          )}
          <VariableBoxes content={block.content ?? ''} />
        </div>
      );

    case 'summary':
      return (
        <div
          className={cn(
            'p-5 rounded-xl',
            spaceClass
          )}
          style={{
            background: 'linear-gradient(135deg, #ecfdf5 0%, #ecfeff 100%)',
            border: '1px solid #a7f3d0',
          }}
        >
          {block.title && (
            <p className="font-extrabold text-emerald-800 mb-2">{block.title}</p>
          )}
          <p className="text-slate-700 text-sm leading-relaxed">{block.content}</p>
        </div>
      );

    default:
      return (
        <p className={cn('text-slate-700 leading-relaxed', spaceClass)}>
          {block.content}
        </p>
      );
  }
};
