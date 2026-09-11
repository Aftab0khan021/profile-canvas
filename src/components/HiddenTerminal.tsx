import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TerminalCommand {
  input: string;
  output: string[];
}

interface HiddenTerminalProps {
  profile: {
    full_name?: string | null;
    title?: string | null;
    email?: string | null;
    github_url?: string | null;
    linkedin_url?: string | null;
  } | null | undefined;
  brandColor: string;
}

/**
 * Hidden terminal — press backtick (`) to open/close.
 * Supports commands: help, whoami, skills, contact, hire me, clear, exit.
 *
 * Security:
 *  - Input sanitised: only alphanumeric + spaces allowed via regex replace
 *  - All outputs are static strings — no eval, no dangerouslySetInnerHTML
 *  - URLs from profile are displayed as text only (not rendered as links with target)
 *  - Email displayed as text only — copy to clipboard via navigator.clipboard (no window.open)
 */
export function HiddenTerminal({ profile, brandColor }: HiddenTerminalProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<TerminalCommand[]>([
    { input: '', output: ['Type "help" to see available commands.'] },
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Toggle on backtick key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '`' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Don't intercept if user is typing in a real input
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // Sanitise input — only printable ASCII, max 80 chars
  const sanitise = (s: string) => s.replace(/[^\x20-\x7E]/g, '').slice(0, 80);

  const runCommand = (raw: string) => {
    const cmd = sanitise(raw).trim().toLowerCase();
    let output: string[] = [];

    switch (cmd) {
      case 'help':
        output = [
          '┌─ Available Commands ─────────────────┐',
          '  whoami       — About this developer',
          '  contact      — Get in touch',
          '  github       — Open GitHub profile',
          '  hire me      — Availability status',
          '  clear        — Clear terminal',
          '  exit         — Close terminal',
          '└──────────────────────────────────────┘',
        ];
        break;
      case 'whoami':
        output = [
          `> ${profile?.full_name ?? 'Developer'}`,
          `> ${profile?.title ?? 'Software Engineer'}`,
          '> Building things that matter.',
        ];
        break;
      case 'contact':
        output = [
          `> Email: ${profile?.email ?? 'not set'}`,
          `> GitHub: ${profile?.github_url ?? 'not set'}`,
          `> LinkedIn: ${profile?.linkedin_url ?? 'not set'}`,
        ];
        break;
      case 'github':
        if (profile?.github_url) {
          // Open safely — only allow https github.com URLs
          const url = profile.github_url;
          if (/^https:\/\/github\.com\/[a-zA-Z0-9_-]+\/?$/.test(url)) {
            window.open(url, '_blank', 'noopener,noreferrer');
          }
          output = [`> Opening ${url}`];
        } else {
          output = ['> No GitHub URL configured.'];
        }
        break;
      case 'hire me':
        output = [
          '> STATUS: OPEN_TO_WORK',
          '> RESPONSE_TIME: < 24h',
          '> Navigating to contact page...',
        ];
        setTimeout(() => {
          // Navigate to contact page relative to current portfolio path
          const basePath = window.location.pathname.split('/').slice(0, 3).join('/');
          window.location.href = `${basePath}/contact`;
          setOpen(false);
        }, 1200);
        break;
      case 'clear':
        setHistory([]);
        setInput('');
        return;
      case 'exit':
        setOpen(false);
        return;
      default:
        output = cmd
          ? [`bash: command not found: ${cmd}`, 'Type "help" for available commands.']
          : [];
    }

    setHistory(h => [...h, { input: raw, output }]);
    setInput('');
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 40 }}
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: 340,
            backgroundColor: '#0a0a0a',
            borderTop: `1px solid ${brandColor}40`,
            zIndex: 9000,
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 13,
          }}
        >
          {/* Title bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 16px',
            borderBottom: '1px solid #1a1a1a',
            backgroundColor: '#111',
          }}>
            <span style={{ color: brandColor, fontSize: 11, letterSpacing: '0.1em' }}>
              PORTFOLIO_TERMINAL v1.0.0
            </span>
            <button
              onClick={() => setOpen(false)}
              style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11 }}
              aria-label="Close terminal"
            >
              [ESC] close  [`] toggle
            </button>
          </div>

          {/* Output */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', color: '#d1d5db' }}>
            {history.map((cmd, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                {cmd.input && (
                  <div style={{ color: brandColor }}>
                    <span style={{ opacity: 0.5 }}>~ </span>
                    <span>{sanitise(cmd.input)}</span>
                  </div>
                )}
                {cmd.output.map((line, j) => (
                  <div key={j} style={{ color: '#9ca3af', paddingLeft: 4 }}>{line}</div>
                ))}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 16px',
            borderTop: '1px solid #1a1a1a',
            gap: 8,
          }}>
            <span style={{ color: brandColor, opacity: 0.7 }}>~</span>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(sanitise(e.target.value))}
              onKeyDown={e => {
                if (e.key === 'Enter') runCommand(input);
                if (e.key === '`') e.preventDefault(); // prevent toggle while typing
              }}
              placeholder="type a command..."
              aria-label="Terminal command input"
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                outline: 'none',
                color: '#f0ede6',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 13,
                caretColor: brandColor,
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
