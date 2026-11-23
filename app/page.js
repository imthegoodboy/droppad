'use client';

import { useEffect, useRef, useState } from 'react';
import { upload } from '@vercel/blob/client';

const EXT = {
  image: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'svg', 'bmp'],
  video: ['mp4', 'webm', 'mov', 'm4v'],
  audio: ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'],
};
const kindOf = (name) => {
  const ext = name.split('.').pop().toLowerCase();
  return Object.keys(EXT).find((k) => EXT[k].includes(ext)) || 'file';
};
const fmtSize = (n) =>
  n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1048576).toFixed(1)} MB`;
const fmtTime = (t) => new Date(t).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const safeName = (name) => name.replace(/[^\w.\- ()]/g, '_') || 'file';

export default function Home() {
  const [items, setItems] = useState(null);
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const picker = useRef(null);

  const load = () =>
    fetch('/api/items', { cache: 'no-store' })
      .then((r) => r.json())
      .then(setItems)
      .catch(() => setItems([]));

  useEffect(() => {
    load();
  }, []);

  const addFiles = (list) => setFiles((f) => [...f, ...Array.from(list)]);

  async function send() {
    if (busy || (!text.trim() && !files.length)) return;
    setBusy(true);
    try {
      for (const f of files) {
        await upload(`files/${uid()}/${safeName(f.name)}`, f, {
          access: 'public',
          handleUploadUrl: '/api/upload',
          multipart: f.size > 20 * 1024 * 1024,
          onUploadProgress: ({ percentage }) => setStatus(`Uploading ${f.name} ${Math.round(percentage)}%`),
        });
        setFiles((fs) => fs.filter((x) => x !== f));
      }
      if (text.trim()) {
        setStatus('Sending…');
        await upload(`texts/${uid()}.txt`, new Blob([text], { type: 'text/plain' }), {
          access: 'public',
          handleUploadUrl: '/api/upload',
        });
        setText('');
      }
      setStatus('');
    } catch (e) {
      setStatus(`Failed: ${e.message}`);
    }
    await load();
    setBusy(false);
  }

  return (
    <main
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        addFiles(e.dataTransfer.files);
      }}
    >
      <h1>droppad</h1>

      <div className={`box${drag ? ' drag' : ''}`}>
        {files.length > 0 && (
          <div className="row chips">
            {files.map((f, i) => (
              <span className="chip" key={i}>
                {f.name}
                <button onClick={() => setFiles((fs) => fs.filter((x) => x !== f))} aria-label="Remove">
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <textarea
          placeholder="Type a message, or drop / paste files…"
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
        <div className="row">
          <button onClick={() => picker.current.click()} disabled={busy}>
            Attach
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
          <span className="status">{status}</span>
          <button className="send" onClick={send} disabled={busy || (!text.trim() && !files.length)}>
            {busy ? 'Sending…' : 'Send'}
          </button>
        </div>
      </div>

      <div className="feed">
        {items === null ? (
          <p className="muted">Loading…</p>
        ) : items.length === 0 ? (
          <p className="muted">Nothing here yet.</p>
        ) : (
          items.map((it) => <Item key={it.url} it={it} />)
        )}
      </div>
    </main>
  );
}

function Item({ it }) {
  const [copied, setCopied] = useState(false);
  const kind = it.kind === 'text' ? 'text' : kindOf(it.name);

  return (
    <div className="item">
      <div className="time">{fmtTime(it.time)}</div>

      {kind === 'text' && <p className="text">{it.text}</p>}
      {kind === 'image' && (
        <a href={it.url} target="_blank" rel="noreferrer">
          <img src={it.url} alt={it.name} loading="lazy" />
        </a>
      )}
      {kind === 'video' && <video src={it.url} controls preload="metadata" />}
      {kind === 'audio' && <audio src={it.url} controls preload="none" />}
      {kind !== 'text' && (
        <div className="file">
          {it.name} <span className="muted">· {fmtSize(it.size)}</span>
        </div>
      )}

      <div className="actions">
        {kind === 'text' ? (
          <button
            onClick={() => {
              navigator.clipboard.writeText(it.text);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        ) : (
          <a href={it.url} target="_blank" rel="noreferrer">
            View
          </a>
        )}
        <a href={it.downloadUrl}>Download</a>
      </div>
    </div>
  );
}
