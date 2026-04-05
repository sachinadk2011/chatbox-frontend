import React, { useContext, useState } from 'react';
import MessageContext from '../context/message/MessageContext';
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

/* ── Media grid ──────────────────────────────────────────────────────────── */
const MediaGrid = ({ files, onOpen }) => {
  const show  = files.slice(0, 4);
  const extra = files.length - 4;
  return (
    <div className={`grid gap-0.5 rounded-xl overflow-hidden ${files.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} max-w-[220px]`}>
      {show.map((f, i) => (
        <div key={i} className="relative aspect-square bg-gray-300 cursor-pointer"
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

/* ── Main component ──────────────────────────────────────────────────────── */
/**
 * showAvatar: true on the LAST consecutive message from this person → show avatar.
 * isLast:     true on the LAST consecutive message → add group-end spacing.
 */
export const ReceivedMsg = ({ types, received, showAvatar = true, isLast = true }) => {
  const { Selecteduser } = useContext(MessageContext);
  const [lightbox, setLightbox] = useState(null);

  let filesArray = [];
  if (types === 'multiple') { try { filesArray = JSON.parse(received); } catch { } }

  const profile_url = `https://ui-avatars.com/api/?name=${encodeURIComponent(Selecteduser.receiverName || 'U')}&background=random&color=random&bold=true&rounded=true`;
  const resizedUrl  = Selecteduser.profile_url
    ? Selecteduser.profile_url.replace('/upload/', '/upload/w_200,h_200,c_fill,g_face/')
    : null;

  const msgType    = types || 'text';
  const msgContent = received ?? '';

  // Skip completely empty non-media messages
  if (!msgContent && !['image', 'video', 'audio', 'multiple'].includes(msgType)) return null;

  const groupMb = isLast ? 'mb-2' : 'mb-0.5';

  // Avatar or equal-size spacer (keeps bubbles left-aligned regardless)
  const avatarSlot = (
    <div className="w-6 h-6 flex-shrink-0 mr-2 self-end">
      {showAvatar
        ? <img src={resizedUrl || profile_url} alt="avatar" className="w-6 h-6 rounded-full object-cover" />
        : <div className="w-6 h-6" />}
    </div>
  );

  // ── TEXT bubble ──────────────────────────────────────────────────────────
  if (msgType === 'text' || !['image', 'video', 'file', 'multiple', 'audio'].includes(msgType)) {
    return (
      <div className={`flex items-end ${groupMb}`}>
        {avatarSlot}
        <div className="max-w-[75%] sm:max-w-xs">
          <span className="px-4 py-2 rounded-2xl rounded-bl-sm bg-white border border-gray-100 text-gray-800 text-sm shadow-sm inline-block">
            {msgContent}
          </span>
        </div>
      </div>
    );
  }

  // ── IMAGE ─────────────────────────────────────────────────────────────────
  if (msgType === 'image') {
    if (!received) return null;
    return (
      <>
        <ImageLightbox src={lightbox} onClose={() => setLightbox(null)} />
        <div className={`flex items-end ${groupMb}`}>
          {avatarSlot}
          <div
            className="relative overflow-hidden rounded-2xl rounded-bl-sm shadow-md cursor-zoom-in max-w-[220px]"
            onClick={() => setLightbox(received)}
          >
            <img src={received} alt="received" className="block w-full h-auto max-w-[220px] object-cover" />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
            <DownloadBtn url={received} />
          </div>
        </div>
      </>
    );
  }

  // ── VIDEO ─────────────────────────────────────────────────────────────────
  if (msgType === 'video') {
    if (!received) return null;
    return (
      <div className={`flex items-end ${groupMb}`}>
        {avatarSlot}
        <div className="relative overflow-hidden rounded-2xl rounded-bl-sm shadow-md max-w-[220px]">
          <video controls className="block w-full h-auto max-w-[220px]">
            <source src={received} type="video/mp4" />
          </video>
          <DownloadBtn url={received} />
        </div>
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
        <div className={`flex items-end ${groupMb}`}>
          {avatarSlot}
          <div className="space-y-1">
            {imgs.length > 0 && <MediaGrid files={imgs} onOpen={setLightbox} />}
            {others.map((f, i) => (
              <a key={i} href={f.url} download className="block text-blue-600 underline text-xs">
                Download File {i + 1}
              </a>
            ))}
          </div>
        </div>
      </>
    );
  }

  // ── AUDIO ─────────────────────────────────────────────────────────────────
  return (
    <div className={`flex items-end ${groupMb}`}>
      {avatarSlot}
      <div className="px-3 py-2 rounded-2xl rounded-bl-sm bg-white border border-gray-100 shadow-sm">
        <audio controls className="max-w-[200px] h-8">
          <source src={received} type="audio/mpeg" />
        </audio>
      </div>
    </div>
  );
};