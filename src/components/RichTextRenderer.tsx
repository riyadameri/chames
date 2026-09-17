import React from 'react';

interface RichTextRendererProps {
  content: string;
  onHashtagClick?: (tag: string) => void;
  className?: string;
}

export const RichTextRenderer: React.FC<RichTextRendererProps> = ({
  content,
  onHashtagClick,
  className = ''
}) => {
  if (!content) return null;

  // Split lines to handle headings, quotes, and bullet points properly
  const lines = content.split('\n');

  return (
    <div className={`space-y-1.5 leading-relaxed text-right ${className}`}>
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();

        // Check if line is empty
        if (!trimmed) {
          return <div key={lineIdx} className="h-2" />;
        }

        // Heading 3: ### Heading
        if (line.startsWith('### ')) {
          const headingText = line.replace(/^###\s+/, '');
          return (
            <h4 key={lineIdx} className="text-base font-black text-emerald-950 mt-2 mb-1">
              {renderInlineStyles(headingText, onHashtagClick)}
            </h4>
          );
        }

        // Heading 2: ## Heading
        if (line.startsWith('## ')) {
          const headingText = line.replace(/^##\s+/, '');
          return (
            <h3 key={lineIdx} className="text-lg font-black text-slate-900 mt-3 mb-1.5 border-b border-slate-100 pb-1">
              {renderInlineStyles(headingText, onHashtagClick)}
            </h3>
          );
        }

        // Blockquote: > Quote
        if (line.startsWith('> ')) {
          const quoteText = line.replace(/^>\s+/, '');
          return (
            <blockquote 
              key={lineIdx} 
              className="border-r-4 border-emerald-500 pr-3 py-1 bg-emerald-50/70 rounded-l-xl my-1.5 text-xs sm:text-sm italic font-medium text-emerald-950"
            >
              {renderInlineStyles(quoteText, onHashtagClick)}
            </blockquote>
          );
        }

        // Bullet point: • or - or *
        if (line.match(/^([•\-\*])\s+/)) {
          const bulletText = line.replace(/^([•\-\*])\s+/, '');
          return (
            <div key={lineIdx} className="flex items-start gap-2 pr-1 text-xs sm:text-sm text-slate-800">
              <span className="text-emerald-600 font-bold mt-0.5">•</span>
              <span className="flex-1">{renderInlineStyles(bulletText, onHashtagClick)}</span>
            </div>
          );
        }

        // Regular line with inline formatting
        return (
          <p key={lineIdx} className="text-xs sm:text-sm text-slate-800">
            {renderInlineStyles(line, onHashtagClick)}
          </p>
        );
      })}
    </div>
  );
};

/**
 * Parses bold (**text**), italic (*text*), inline code (`code`), and hashtags (#tag)
 */
function renderInlineStyles(text: string, onHashtagClick?: (tag: string) => void): React.ReactNode[] {
  // Regex to match:
  // 1. Bold: \*\*(.+?)\*\*
  // 2. Italic: \*([^\*]+?)\*
  // 3. Inline code/highlight: `([^`]+?)`
  // 4. Hashtags: #[^\s#.,!?:;()]+
  const regex = /(\*\*[^*]+?\*\*|\*[^*]+?\*|`[^`]+?`|#[^\s#.,!?:;()]+)/g;

  const parts = text.split(regex);

  return parts.map((part, idx) => {
    if (!part) return null;

    // Bold
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      const inner = part.slice(2, -2);
      return (
        <strong key={idx} className="font-black text-slate-900">
          {inner}
        </strong>
      );
    }

    // Italic
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      const inner = part.slice(1, -1);
      return (
        <em key={idx} className="italic text-slate-700">
          {inner}
        </em>
      );
    }

    // Inline highlight / code
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      const inner = part.slice(1, -1);
      return (
        <span 
          key={idx} 
          className="px-1.5 py-0.5 mx-0.5 rounded-md bg-amber-100/80 text-amber-900 font-mono text-[11px] font-bold border border-amber-200"
        >
          {inner}
        </span>
      );
    }

    // Hashtags
    if (part.startsWith('#') && part.length > 1) {
      return (
        <span
          key={idx}
          onClick={(e) => {
            if (onHashtagClick) {
              e.stopPropagation();
              onHashtagClick(part);
            }
          }}
          className={`inline-block px-1.5 py-0.2 mx-0.5 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/70 font-black text-xs transition cursor-pointer ${
            onHashtagClick ? 'hover:underline' : ''
          }`}
          title={`وسم المجتمع: ${part}`}
        >
          {part}
        </span>
      );
    }

    // Regular text
    return <span key={idx}>{part}</span>;
  });
}
