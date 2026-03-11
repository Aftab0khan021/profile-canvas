/**
 * MarkdownRenderer — renders Markdown content safely without external deps.
 * Supports: # headings, **bold**, `code`, [links](url), code blocks, ---
 *
 * Security: only https?:// links are rendered as anchors (prevents XSS).
 */
interface MarkdownRendererProps {
  content: string;
  className?: string;
  /** 'blog' = large body text. 'preview' = compact small text. */
  variant?: 'blog' | 'preview';
}

export function MarkdownRenderer({
  content,
  className = '',
  variant = 'blog',
}: MarkdownRendererProps) {
  if (!content) return null;

  const isPreview = variant === 'preview';
  const lines = content.split('\n');

  const renderInline = (text: string) => {
    // Strip or render inline Markdown
    const html = text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, `<code class="${isPreview ? 'text-xs' : 'text-sm'} bg-muted px-1.5 py-0.5 rounded font-mono">$1</code>`)
      // Only allow https?:// links (security: prevents javascript:)
      .replace(
        /\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g,
        '<a href="$2" class="text-primary underline underline-offset-2 hover:opacity-80" target="_blank" rel="noopener noreferrer">$1</a>'
      );
    return html;
  };

  const elements: JSX.Element[] = [];
  let i = 0;
  let inCodeBlock = false;
  let codeLines: string[] = [];

  while (i < lines.length) {
    const line = lines[i];

    // Code block toggle
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        elements.push(
          <pre
            key={`code-${i}`}
            className="bg-muted rounded-lg p-4 overflow-x-auto my-4 text-sm font-mono"
          >
            <code>{codeLines.join('\n')}</code>
          </pre>
        );
        codeLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      i++;
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      i++;
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      elements.push(<hr key={i} className="my-6 border-border" />);
      i++;
      continue;
    }

    // Headings
    if (!isPreview && line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="text-xl font-semibold mt-8 mb-3 leading-tight">
          {line.slice(4)}
        </h3>
      );
      i++;
      continue;
    }
    if (!isPreview && line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="text-2xl font-bold mt-10 mb-4 leading-tight">
          {line.slice(3)}
        </h2>
      );
      i++;
      continue;
    }
    if (!isPreview && line.startsWith('# ')) {
      elements.push(
        <h1 key={i} className="text-3xl font-bold mt-10 mb-4 leading-tight">
          {line.slice(2)}
        </h1>
      );
      i++;
      continue;
    }

    // Unordered list
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const listItems: JSX.Element[] = [];
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        listItems.push(
          <li
            key={i}
            className={isPreview ? 'text-sm' : 'text-base leading-relaxed'}
            dangerouslySetInnerHTML={{ __html: renderInline(lines[i].slice(2)) }}
          />
        );
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="list-disc list-inside space-y-1 my-3 pl-2">
          {listItems}
        </ul>
      );
      continue;
    }

    // Ordered list
    if (/^\d+\. /.test(line)) {
      const listItems: JSX.Element[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        listItems.push(
          <li
            key={i}
            className={isPreview ? 'text-sm' : 'text-base leading-relaxed'}
            dangerouslySetInnerHTML={{ __html: renderInline(lines[i].replace(/^\d+\. /, '')) }}
          />
        );
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="list-decimal list-inside space-y-1 my-3 pl-2">
          {listItems}
        </ol>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote
          key={i}
          className="border-l-4 border-primary/40 pl-4 italic text-muted-foreground my-4"
          dangerouslySetInnerHTML={{ __html: renderInline(line.slice(2)) }}
        />
      );
      i++;
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      elements.push(<br key={i} className="my-1" />);
      i++;
      continue;
    }

    // Normal paragraph
    elements.push(
      <p
        key={i}
        className={isPreview ? 'text-sm text-muted-foreground' : 'text-base leading-relaxed mb-4'}
        dangerouslySetInnerHTML={{ __html: renderInline(line) }}
      />
    );
    i++;
  }

  return (
    <div
      className={`prose dark:prose-invert max-w-none ${isPreview ? 'prose-sm' : ''} ${className}`}
    >
      {elements}
    </div>
  );
}

/**
 * Strip Markdown to plain text for use in meta descriptions, excerpts, etc.
 */
export function stripMarkdown(text: string, maxLen?: number): string {
  const plain = text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[(.+?)\]\(.*?\)/g, '$1')
    .replace(/^[-*>]\s/gm, '')
    .replace(/^\d+\.\s/gm, '')
    .replace(/---+/g, '')
    .replace(/\n+/g, ' ')
    .trim();
  return maxLen ? plain.slice(0, maxLen) + (plain.length > maxLen ? '…' : '') : plain;
}
