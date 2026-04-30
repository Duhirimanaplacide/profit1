import { useEffect, useState, useRef } from 'react';
import { getMessages, markAsRead, replyToMessage } from '../api';
import EmojiPicker from 'emoji-picker-react';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://backend-71p0.onrender.com';

const STICKERS = ['😀', '❤️', '👍', '🎉', '🔥', '💯', '🎊', '💪', '👏', '🙏', '😂', '🤣', '😍', '🥰', '😊', '🤗', '🎁', '⭐', '🌟', '💎'];

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyImage, setReplyImage] = useState(null);
  const [smsNotify, setSmsNotify] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [showGif, setShowGif] = useState(false);
  const [gifSearch, setGifSearch] = useState('');
  const [gifs, setGifs] = useState([]);
  const replyFileRef = useRef();
  const replyEmojiRef = useRef();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (replyEmojiRef.current && !replyEmojiRef.current.contains(e.target)) setShowEmoji(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await getMessages();
      const msgs = res.data;
      msgs.forEach(msg => {
        if (msg.status === 'delivered' && msg.sender?.toString() !== user.id) {
          markAsRead(msg._id).catch(() => {});
        }
      });
      setMessages(msgs);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleRead = async (id) => {
    try {
      await markAsRead(id);
      fetchMessages();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedMsg) return;
    try {
      const res = await replyToMessage(selectedMsg._id, replyText, replyImage);
      if (res.data.smsSent) {
        setSmsNotify('SMS sent to user!');
        setTimeout(() => setSmsNotify(''), 3000);
      }
      setReplyText('');
      setReplyImage(null);
      setShowEmoji(false);
      fetchMessages();
    } catch (err) {
      alert('Failed to reply');
    }
  };

  const addEmoji = (emojiObject) => {
    setReplyText(prev => prev + emojiObject.emoji);
  };

  const addSticker = (sticker) => {
    setReplyText(prev => prev + sticker);
    setShowStickers(false);
  };

  const searchGifs = async (query) => {
    setGifSearch(query);
    if (!query) { setGifs([]); return; }
    try {
      const res = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=GlVGYt4MhfDmSzZaEK0CyIqfsXxUx2c&q=${query}&limit=10`);
      const data = await res.json();
      setGifs(data.data || []);
    } catch (err) {
      console.error('GIF search error:', err);
    }
  };

  const selectGif = (gifUrl) => {
    setReplyText(prev => prev + ` ${gifUrl}`);
    setShowGif(false);
    setGifs([]);
    setGifSearch('');
  };

  const renderMessageContent = (text) => {
    const gifRegex = /(https?:\/\/.*\.giphy\.com\/.*\.gif|https?:\/\/giphy\.com\/.*)/gi;
    const parts = text.split(gifRegex);
    return parts.map((part, index) => {
      if (part.match(gifRegex)) {
        return <img key={index} src={part} alt="GIF" className="mt-2 rounded max-w-xs" />;
      }
      return <span key={index}>{part}</span>;
    });
  };

  const getStatusIcon = (msg) => {
    if (msg.sender?.toString() === user.id || msg.sender?._id?.toString() === user.id) {
      if (msg.status === 'read') return <span className="text-blue-500 text-xs">✓✓</span>;
      if (msg.status === 'delivered') return <span className="text-gray-500 text-xs">✓✓</span>;
      return <span className="text-gray-500 text-xs">✓</span>;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const userMessages = messages.filter(m => m.sender?.role !== 'admin');
  const adminReplies = messages.filter(m => m.sender?.role === 'admin');

  return (
    <div className="flex h-[calc(100vh-140px)] bg-gray-100 rounded-2xl overflow-hidden">
      {/* Sidebar */}
      <div className="w-1/3 bg-white border-r flex flex-col">
        <div className="p-4 bg-gray-50 border-b">
          <h2 className="text-lg font-bold">User Messages</h2>
          <span className="text-sm text-gray-500">{messages.filter(m => !m.isRead).length} unread</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {userMessages.map(msg => (
            <div
              key={msg._id}
              onClick={() => { setSelectedMsg(msg); if (!msg.isRead) handleRead(msg._id); }}
              className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${selectedMsg?._id === msg._id ? 'bg-green-50' : ''} ${!msg.isRead ? 'bg-blue-50' : ''}`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm">{msg.sender?.username}</span>
                {!msg.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
              </div>
              <p className="text-xs text-gray-500 truncate mt-1 flex items-center gap-1">
                {msg.subject} {getStatusIcon(msg)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-[#e5ddd3]">
        {selectedMsg ? (
          <>
            <div className="p-3 bg-gray-50 border-b flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">{selectedMsg.sender?.username}</h3>
                <p className="text-xs text-gray-500">{selectedMsg.subject}</p>
              </div>
              <div className="flex gap-3">
                <button className="text-xl hover:scale-110 transition" title="Audio Call">📞</button>
                <button className="text-xl hover:scale-110 transition" title="Video Call">📹</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <div className="bg-white p-3 rounded-lg shadow-sm max-w-md">
                <p className="text-sm whitespace-pre-wrap">{renderMessageContent(selectedMsg.message)}</p>
                {selectedMsg.imageUrl && (
                  <img src={`${API_BASE}${selectedMsg.imageUrl}`} alt="" className="mt-2 rounded max-w-xs" />
                )}
                <p className="text-xs text-gray-400 mt-1 flex items-center justify-end gap-1">
                  {new Date(selectedMsg.createdAt).toLocaleTimeString([])} {getStatusIcon(selectedMsg)}
                </p>
              </div>

              {adminReplies.filter(r => r.replyTo?.toString() === selectedMsg._id.toString()).map(reply => (
                <div key={reply._id} className="bg-[#dcf8c6] p-3 rounded-lg shadow-sm max-w-md ml-auto">
                  <p className="text-sm whitespace-pre-wrap">{renderMessageContent(reply.message)}</p>
                  {reply.imageUrl && (
                    <img src={`${API_BASE}${reply.imageUrl}`} alt="" className="mt-2 rounded max-w-xs" />
                  )}
                </div>
              ))}
            </div>

            <div className="p-3 bg-gray-50 border-t relative">
              <div className="flex gap-2 mb-2">
                <button type="button" onClick={() => { setShowEmoji(!showEmoji); setShowStickers(false); setShowGif(false); }} className="text-xl hover:scale-110 transition" title="Emoji">😊</button>
                <button type="button" onClick={() => { setShowStickers(!showStickers); setShowEmoji(false); setShowGif(false); }} className="text-xl hover:scale-110 transition" title="Stickers">🎨</button>
                <button type="button" onClick={() => { setShowGif(!showGif); setShowEmoji(false); setShowStickers(false); }} className="text-xl hover:scale-110 transition" title="GIF">🎬</button>
                <button type="button" className="text-xl hover:scale-110 transition" title="Audio Call">📞</button>
                <button type="button" className="text-xl hover:scale-110 transition" title="Video Call">📹</button>
                <input type="file" ref={replyFileRef} onChange={(e) => setReplyImage(e.target.files[0])} className="hidden" accept="image/*" />
                <button type="button" onClick={() => replyFileRef.current.click()} className="text-xl hover:scale-110 transition" title="Attach">📎</button>
              </div>

              {showEmoji && (
                <div ref={replyEmojiRef} className="absolute bottom-16 left-3 z-50">
                  <EmojiPicker onEmojiClick={(emojiObject) => addEmoji(emojiObject)} width={300} height={350} />
                </div>
              )}

              {showStickers && (
                <div className="absolute bottom-16 left-3 bg-white rounded-lg shadow-lg p-3 z-50 grid grid-cols-5 gap-2 w-64">
                  {STICKERS.map((sticker, index) => (
                    <button key={index} onClick={() => addSticker(sticker)} className="text-2xl hover:bg-gray-100 rounded p-1 transition">{sticker}</button>
                  ))}
                </div>
              )}

              {showGif && (
                <div className="absolute bottom-16 left-3 bg-white rounded-lg shadow-lg p-3 z-50 w-80">
                  <input type="text" value={gifSearch} onChange={(e) => searchGifs(e.target.value)} placeholder="Search GIFs..." className="w-full px-3 py-2 border rounded-lg mb-2 text-sm" />
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {gifs.map(gif => (
                      <img key={gif.id} src={gif.images.fixed_height_small.url} alt="" onClick={() => selectGif(gif.images.original.url)} className="cursor-pointer rounded hover:opacity-80 transition" />
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleReply} className="flex gap-2">
                <input value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Type a reply..." className="flex-1 px-3 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-500" />
                <button type="submit" className="w-10 h-10 bg-green-500 text-white rounded-full font-bold hover:bg-green-600 transition flex items-center justify-center">↑</button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">Select a message</div>
        )}
      </div>

      {smsNotify && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {smsNotify}
        </div>
      )}
    </div>
  );
}
