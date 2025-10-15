import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';

interface MarkdownRendererProps { content: string; }

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content || !content.trim()) {
    return <div className="text-sm text-muted-foreground">Feedback no disponible</div>;
  }
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]} className="prose dark:prose-invert max-w-none">
      {content}
    </ReactMarkdown>
  );
}
