import React, { useContext, useState } from 'react';
import UserContext from '../context/users/UserContext';
import ImageLightbox from './ImageLightbox';

/* ── Download helper ─────────────────────────────────────────────────────── */
const getDownloaded = () => { try { return JSON.parse(localStorage.getItem('chat_dl') || '{}'); } catch { return {}; } };

const DownloadBtn = ({ url }) => {
  const [dl, setDl] = useState(() => !!getDownloaded()[url]);
  const [loading, setLoading] = useState(false);
  const download = async (e) => {
    e.stopPropagation();
    if (dl || loading) return;
    setLoading(true);
    try {
      const blob = await fetch(url).then(r => r.blob());
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = url.split('/').pop().split('?')[0] || 'file'; a.click();
      URL.revokeObjectURL(a.href);
      const saved = getDownloaded(); saved[url] = true;
      localStorage.setItem('chat_dl', JSON.stringify(saved)); setDl(true);
    } catch { } finally { setLoading(false); }
  };
  return (
    <button onClick={download} title={dl ? 'Already downloaded' : 'Download'}
      className={`absolute bottom-1.5 right-1.5 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs shadow transition-all
        ${dl ? 'bg-green-500' : 'bg-black/50 hover:bg-black/70'}`}
    >
      {loading ? '…' : dl
        ? <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-5.121-5.121a1 1 0 011.414-1.414L8.414 12.172l7.879-7.879a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
        : <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
      }
    </button>
  );
};

/* ── WhatsApp-style media grid ───────────────────────────────────────────── */
const MediaGrid = ({ files, onOpen }) => {
  const show = files.slice(0, 4);
  const extra = files.length - 4;
  return (
    <div className={`grid gap-0.5 rounded-xl overflow-hidden ${files.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} max-w-[220px]`}>
      {show.map((f, i) => (
        <div key={i} className="relative aspect-square bg-gray-200 cursor-pointer"
             onClick={() => f.type === 'image' && onOpen?.(f.url)}>
          {f.type === 'image'
            ? <img src={f.url} alt="img" className="w-full h-full object-cover" />
            : <video src={f.url} className="w-full h-full object-cover" />}
          {i === 3 && extra > 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white text-xl font-bold">+{extra}</span>
            </div>
          )}
          <DownloadBtn url={f.url} />
        </div>
      ))}
    </div>
  );
};

/* ── Seen ticks ──────────────────────────────────────────────────────────── */
const normalizeStatus = (s) => {
  if (s === 'read' || s === true) return 'read';
  if (s === 'delivered')          return 'delivered';
  if (s === 'sent' || s === false) return 'sent';
  return 'read';
};
const Tick = ({ read }) => (
  <svg viewBox="0 0 22 11" className="w-5 h-3 inline-block" fill="none">
    <path d="M1 5.5L5.5 10L15 1" stroke={read ? '#3b82f6' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 5.5L11.5 10L21 1" stroke={read ? '#3b82f6' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const SingleTick = () => (
  <svg viewBox="0 0 16 11" className="w-4 h-3 inline-block" fill="none">
    <path d="M1 5.5L5.5 10L15 1" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const SeenTick = ({ status }) => {
  const s = normalizeStatus(status);
  if (s === 'sent') return <SingleTick />;
  return <Tick read={s === 'read'} />;
};

/* ── Main component ──────────────────────────────────────────────────────── */
/**
 * isLast: true when this is the last message in a consecutive group from sender.
 *   → adds extra bottom margin to visually separate groups.
 *   → sender never shows an avatar (own messages), but isLast controls spacing.
 */
export const SendMsg = ({ types, send, status, isLast = true }) => {
  const { user } = useContext(UserContext);
  const [lightbox, setLightbox] = useState(null);

  let filesArray = [];
  if (types === 'multiple') { try { filesArray = JSON.parse(send); } catch { } }

  const msgType    = types || 'text';
  const msgContent = send ?? '';

  // Skip completely empty non-media messages (old broken records)
  if (!msgContent && !['image', 'video', 'audio', 'multiple'].includes(msgType)) return null;

  // ── Wrapper spacing: tight within a group, spacious at group end ─────────
  const groupMb = isLast ? 'mb-2' : 'mb-0.5';

  // ── RIGHT side spacer replaces avatar (senders never show own avatar) ────
  const rSpacer = <div className="w-6 flex-shrink-0" />;

  // ── Tick row ─────────────────────────────────────────────────────────────
  const tickRow = (
    <span className="mt-0.5 mr-0.5 self-end flex justify-end">
      <SeenTick status={status} />
    </span>
  );

  // ── TEXT bubble ──────────────────────────────────────────────────────────
  if (msgType === 'text' || !['image', 'video', 'file', 'multiple', 'audio'].includes(msgType)) {
    return (
      <div className={`flex items-end justify-end ${groupMb}`}>
        <div className="flex flex-col items-end max-w-[75%] sm:max-w-xs mx-2">
          <span className="px-4 py-2 rounded-2xl rounded-br-sm bg-indigo-500 text-white text-sm shadow-sm">
            {msgContent}
          </span>
          {tickRow}
        </div>
        {rSpacer}
      </div>
    );
  }

  // ── IMAGE ─────────────────────────────────────────────────────────────────
  if (msgType === 'image') {
    if (!send) return null;
    return (
      <>
        <ImageLightbox src={lightbox} onClose={() => setLightbox(null)} />
        <div className={`flex items-end justify-end ${groupMb}`}>
          <div className="flex flex-col items-end mx-2">
            <div
              className="relative overflow-hidden rounded-2xl rounded-br-sm shadow-md cursor-zoom-in max-w-[220px]"
              onClick={() => setLightbox(send)}
            >
              <img src={send} alt="sent" className="block w-full h-auto max-w-[220px] object-cover" />
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
              <DownloadBtn url={send} />
            </div>
            {tickRow}
          </div>
          {rSpacer}
        </div>
      </>
    );
  }

  // ── VIDEO ─────────────────────────────────────────────────────────────────
  if (msgType === 'video') {
    if (!send) return null;
    return (
      <div className={`flex items-end justify-end ${groupMb}`}>
        <div className="flex flex-col items-end mx-2">
          <div className="relative overflow-hidden rounded-2xl rounded-br-sm shadow-md max-w-[220px]">
            <video controls className="block w-full h-auto max-w-[220px]">
              <source src={send} type="video/mp4" />
            </video>
            <DownloadBtn url={send} />
          </div>
          {tickRow}
        </div>
        {rSpacer}
      </div>
    );
  }

  // ── MULTIPLE ──────────────────────────────────────────────────────────────
  if (msgType === 'multiple' && filesArray.length > 0) {
    const imgs   = filesArray.filter(f => f.type === 'image' || f.type === 'video');
    const others = filesArray.filter(f => f.type !== 'image' && f.type !== 'video');
    return (
      <>
        <ImageLightbox src={lightbox} onClose={() => setLightbox(null)} />
        <div className={`flex items-end justify-end ${groupMb}`}>
          <div className="flex flex-col items-end mx-2 space-y-1">
            {imgs.length > 0 && <MediaGrid files={imgs} onOpen={setLightbox} />}
            {others.map((f, i) => (
              <a key={i} href={f.url} download className="block text-blue-200 underline text-xs">
                Download File {i + 1}
              </a>
            ))}
            {tickRow}
          </div>
          {rSpacer}
        </div>
      </>
    );
  }

  // ── AUDIO ─────────────────────────────────────────────────────────────────
  return (
    <div className={`flex items-end justify-end ${groupMb}`}>
      <div className="flex flex-col items-end mx-2">
        <div className="px-3 py-2 rounded-2xl rounded-br-sm bg-indigo-500 shadow-sm">
          <audio controls className="max-w-[200px] h-8">
            <source src={send} type="audio/mpeg" />
          </audio>
        </div>
        {tickRow}
      </div>
      {rSpacer}
    </div>
  );
};