'use client';

import { useEffect, useRef, useState } from 'react';
import { upload } from '@vercel/blob/client';
import Stickers, { HeartSticker, MiniHeart } from './stickers';

const EXT = {
  image: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'svg', 'bmp'],
  video: ['mp4', 'webm', 'mov', 'm4v'],
  audio: ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'],
};
const kindOf = (name) => {
  const ext = name.split('.').pop().toLowerCase();
  return Object.keys(EXT).find((k) => EXT[k].includes(ext)) || 'file';
};
const extLabel = (name) => {
  const parts = name.split('.');
  const ext = parts.length > 1 ? parts.pop() : '';
  return ext && ext.length <= 4 ? ext : 'file';
};
const fmtTime = (t) => new Date(t).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const safeName = (name) => name.replace(/[^\w.\- ()]/g, '_') || 'file';
const tone = (s) => `t${[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % 5}`;

const ClipIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);
const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
);

export default function Home() {
  const [items, setItems] = useState(null);
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const picker = useRef(null);
  const box = useRef(null);
  const feed = useRef(null);

  const seen = useRef('');

  // fetch the list (served from Vercel's cache unless something new was saved);
  // `fresh` skips the cache right after we send something ourselves
  const load = async (fresh) => {
    try {
      const r = await fetch(fresh ? `/api/items?t=${Date.now()}` : '/api/items', { cache: 'no-store' });
      if (r.ok) {
        const list = await r.json();
        const sig = `${list.length}:${list[0]?.id}`;
        if (sig !== seen.current) {
          seen.current = sig;
          setItems(list);
        }
      }
    } catch {}
    setItems((prev) => prev ?? []);
  };

  // live: check for new messages every few seconds while the tab is open
  useEffect(() => {
    load();
    const tick = () => document.visibilityState === 'visible' && load();
    const timer = setInterval(tick, 5000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', tick);
    };
  }, []);

  const save = async (body) => {
    const r = await fetch('/api/items', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || 'could not save');
  };

  // grow the message box with its text
  useEffect(() => {
    const t = box.current;
    t.style.height = 'auto';
    t.style.height = `${Math.min(t.scrollHeight, 140)}px`;
  }, [text]);

  // copy the FileList right away: the browser empties it once the event ends
  const addFiles = (list) => {
    const picked = Array.from(list);
    if (picked.length) setFiles((f) => [...f, ...picked]);
  };

  async function send() {
    if (busy || (!text.trim() && !files.length)) return;
    setBusy(true);
    try {
      for (const f of files) {
        const blob = await upload(`files/${uid()}/${safeName(f.name)}`, f, {
          access: 'public',
          handleUploadUrl: '/api/upload',
          multipart: f.size > 100 * 1024 * 1024,
          onUploadProgress: ({ percentage }) => setStatus(`uploading ${f.name} · ${Math.round(percentage)}%`),
        });
        await save({ url: blob.url });
        setFiles((fs) => fs.filter((x) => x !== f));
      }
      if (text.trim()) {
        setStatus('sending…');
        await save({ text });
        setText('');
      }
      setStatus('');
    } catch (e) {
      setStatus(`oops, failed: ${e.message}`);
    }
    await load(true);
    feed.current?.scrollTo({ top: 0, behavior: 'smooth' });
    setBusy(false);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setDrag(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        addFiles(e.dataTransfer.files);
      }}
    >
      <Stickers />

      <h1 className="title">
        droppad <MiniHeart />
      </h1>

      <div className="feed" ref={feed}>
        <div style={{ flex: `0 0 ${files.length || status ? 160 : 112}px` }} />
        {items === null ? (
          <div className="empty">loading…</div>
        ) : items.length === 0 ? (
          <div className="empty">
            <HeartSticker />
            <p>nothing here yet, say hi!</p>
          </div>
        ) : (
          items.map((it) => <Message key={it.id} it={it} />)
        )}
        <div style={{ flex: '0 0 72px' }} />
      </div>

      <div className={`composer${drag ? ' drag' : ''}`}>
        {status && <div className="status">{status}</div>}
        {files.length > 0 && (
          <div className="chips">
            {files.map((f, i) => (
              <span className="chip" key={i}>
                <span>{f.name}</span>
                <button onClick={() => setFiles((fs) => fs.filter((x) => x !== f))} aria-label="Remove">
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="bar">
          <button className="icon attach" onClick={() => picker.current.click()} disabled={busy} aria-label="Attach">
            <ClipIcon />
          </button>
          <input
            ref={picker}
            type="file"
            multiple
            hidden
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = '';
            }}
          />
          <textarea
            ref={box}
            rows={1}
            placeholder="write something cute ♡"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onPaste={(e) => {
              if (e.clipboardData.files.length) {
                e.preventDefault();
                addFiles(e.clipboardData.files);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />
          <button
            className="icon send"
            onClick={send}
            disabled={busy || (!text.trim() && !files.length)}
            aria-label="Send"
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

function Message({ it }) {
  const [copied, setCopied] = useState(false);
  const kind = it.kind === 'text' ? 'text' : kindOf(it.name);
  const t = tone(it.id);
  const downloadText = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([it.text], { type: 'text/plain;charset=utf-8' }));
    a.download = 'message.txt';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="msg" tabIndex={0}>
      {kind === 'text' && <div className={`bubble ${t}`}>{it.text}</div>}
      {kind === 'image' && (
        <a className="media-link" href={it.url} target="_blank" rel="noreferrer">
          <img className="media" src={it.url} alt={it.name} loading="lazy" />
        </a>
      )}
      {kind === 'video' && <video className="media" src={it.url} controls preload="metadata" />}
      {kind === 'audio' && (
        <div className={`bubble ${t}`}>
          <audio src={it.url} controls preload="none" />
        </div>
      )}
      {kind === 'file' && (
        <a className={`bubble file ${t}`} href={it.url} target="_blank" rel="noreferrer">
          <span className="ext">{extLabel(it.name)}</span>
          <span className="fname">{it.name}</span>
        </a>
      )}

      <div className="meta">
        <span className="when">{fmtTime(it.time)}</span>
        {kind === 'text' ? (
          <button
            onClick={() => {
              navigator.clipboard.writeText(it.text);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? 'copied ♡' : 'copy'}
          </button>
        ) : (
          <a href={it.url} target="_blank" rel="noreferrer">
            view
          </a>
        )}
        {kind === 'text' ? <button onClick={downloadText}>download</button> : <a href={it.downloadUrl}>download</a>}
      </div>
    </div>
  );
}
