import { useEffect, useState, useRef } from 'react';
import { getMessages, sendMessage, editMessage, deleteMessage, updateMessageStatus, replyToMessage } from '../api';
import EmojiPicker from 'emoji-picker-react';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://backend-71p0.onrender.com';

const STICKERS = ['😀', '❤️', '👍', '🎉', '🔥', '💯', '🎊', '💪', '👏', '🙏', '😂', '🤣', '😍', '🥰', '😊', '🤗', '🎁', '⭐', '🌟', '💎'];

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [form, setForm] = useState({ subject: '', message: '' });
  const [image, setImage] = useState(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyImage, setReplyImage] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [showGif, setShowGif] = useState(false);
  const [gifSearch, setGifSearch] = useState('');
  const [gifs, setGifs] = useState([]);
  const fileInputRef = useRef();
  const replyFileRef = useRef();
  const emojiRef = useRef();
  const replyEmojiRef = useRef();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) setShowEmoji(false);
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
        const recipientId = msg.recipient?._id?.toString() || msg.recipient?.toString();
        if (msg.status === 'sent' && recipientId === user.id) {
          updateMessageStatus(msg._id, 'delivered').catch(() => {});
        }
      });
      setMessages(msgs);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      await sendMessage(form, image);
      setSuccess('Message sent!');
      setForm({ subject: '', message: '' });
      setImage(null);
      setShowCompose(false);
      fetchMessages();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send');
    }
    setSending(false);
  };

  const handleEdit = async (id) => {
    try {
      await editMessage(id, editText);
      setEditingId(null);
      setEditText('');
      fetchMessages();
    } catch (err) {
      alert('Failed to edit');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await deleteMessage(id);
      if (selectedMsg?._id === id) setSelectedMsg(null);
      fetchMessages();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
      await replyToMessage(selectedMsg._id, replyText, replyImage);
      setReplyText('');
      setReplyImage(null);
      setShowEmoji(false);
      fetchMessages();
    } catch (err) {
      alert('Failed to reply');
    }
  };

  const addEmoji = (emojiObject, isReply = false) => {
    if (isReply) {
      setReplyText(prev => prev + emojiObject.emoji);
    } else {
      setForm(prev => ({ ...prev, message: prev.message + emojiObject.emoji }));
    }
  };

  const addSticker = (sticker, isReply = false) => {
    if (isReply) {
      setReplyText(prev => prev + sticker);
    } else {
      setForm(prev => ({ ...prev, message: prev.message + sticker }));
    }
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

  const selectGif = (gifUrl, isReply = false) => {
    if (isReply) {
      setReplyText(prev => prev + ` ${gifUrl}`);
    } else {
      setForm(prev => ({ ...prev, message: prev.message + ` ${gifUrl}` }));
    }
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
    const senderId = msg.sender?._id?.toString() || msg.sender?.toString();
    if (senderId !== user.id) return null;
    if (msg.status === 'read') return <span className="text-blue-500 text-xs">✓✓</span>;
    if (msg.status === 'delivered') return <span className="text-gray-500 text-xs">✓✓</span>;
    return <span className="text-gray-500 text-xs">✓</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const userMsgs = messages.filter(m => m.sender?._id === user.id || m.sender === user.id);
  const adminReplies = messages.filter(m => m.replyTo && (m.recipient?._id === user.id || m.recipient === user.id));

  return (
    <div className="flex h-[calc(100vh-140px)] bg-gray-100 rounded-2xl overflow-hidden">
      {/* Sidebar */}
      <div className="w-1/3 bg-white border-r flex flex-col">
        <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold">Chats</h2>
          <button onClick={() => { setForm({ subject: '', message: '' }); setShowCompose(true); }} className="w-8 h-8 bg-green-500 text-white rounded-full text-xl hover:bg-green-600">+</button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {userMsgs.length === 0 ? (
            <p className="text-center text-gray-400 mt-8">No messages yet</p>
          ) : (
            [...userMsgs].reverse().map(msg => (
              <div key={msg._id} onClick={() => setSelectedMsg(msg)} className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${selectedMsg?._id === msg._id ? 'bg-green-50' : ''}`}>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm truncate">{msg.subject}</span>
                  {!msg.isRead && (msg.recipient?._id === user.id || msg.recipient === user.id) && <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span>}
                </div>
                <p className="text-xs text-gray-500 truncate mt-1 flex items-center gap-1">
                  {msg.message.substring(0, 30)} {getStatusIcon(msg)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-[#e5ddd3]">
        {selectedMsg ? (
          <>
            <div className="p-3 bg-gray-50 border-b flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">{selectedMsg.subject}</h3>
                <p className="text-xs text-gray-500">{selectedMsg.sender?.username}</p>
              </div>
              <div className="flex gap-3 items-center">
                <button className="text-xl hover:scale-110 transition" title="Audio Call">📞</button>
                <button className="text-xl hover:scale-110 transition" title="Video Call">📹</button>
                <button onClick={() => { setEditingId(selectedMsg._id); setEditText(selectedMsg.message); }} className="text-blue-500 text-xs hover:underline">Edit</button>
                <button onClick={() => handleDelete(selectedMsg._id)} className="text-red-500 text-xs hover:underline">Delete</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <div className="bg-white p-3 rounded-lg shadow-sm max-w-md ml-auto">
                <p className="text-sm whitespace-pre-wrap">{renderMessageContent(selectedMsg.message)}</p>
                {selectedMsg.imageUrl && <img src={`${API_BASE}${selectedMsg.imageUrl}`} alt="" className="mt-2 rounded max-w-xs" />}
                {selectedMsg.isEdited && <span className="text-xs text-gray-400">edited</span>}
                <p className="text-xs text-gray-400 mt-1 flex items-center justify-end gap-1">
                  {new Date(selectedMsg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} {getStatusIcon(selectedMsg)}
                </p>
              </div>

              {adminReplies.filter(r => r.replyTo?.toString() === selectedMsg._id.toString()).map(reply => (
                <div key={reply._id} className="bg-[#dcf8c6] p-3 rounded-lg shadow-sm max-w-md">
                  <p className="text-xs text-gray-500 mb-1">Admin</p>
                  <p className="text-sm whitespace-pre-wrap">{renderMessageContent(reply.message)}</p>
                  {reply.imageUrl && <img src={`${API_BASE}${reply.imageUrl}`} alt="" className="mt-2 rounded max-w-xs" />}
                </div>
              ))}
            </div>

            {editingId === selectedMsg._id ? (
              <div className="p-3 bg-white border-t flex gap-2">
                <input value={editText} onChange={(e) => setEditText(e.target.value)} className="flex-1 px-3 py-2 border rounded-lg" autoFocus />
                <button onClick={() => handleEdit(editingId)} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Save</button>
                <button onClick={() => setEditingId(null)} className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">Cancel</button>
              </div>
            ) : (
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
                    <EmojiPicker onEmojiClick={(emojiObject) => addEmoji(emojiObject, true)} width={300} height={350} />
                  </div>
                )}

                {showStickers && (
                  <div className="absolute bottom-16 left-3 bg-white rounded-lg shadow-lg p-3 z-50 grid grid-cols-5 gap-2 w-64">
                    {STICKERS.map((sticker, index) => (
                      <button key={index} onClick={() => addSticker(sticker, true)} className="text-2xl hover:bg-gray-100 rounded p-1 transition">{sticker}</button>
                    ))}
                  </div>
                )}

                {showGif && (
                  <div className="absolute bottom-16 left-3 bg-white rounded-lg shadow-lg p-3 z-50 w-80">
                    <input type="text" value={gifSearch} onChange={(e) => searchGifs(e.target.value)} placeholder="Search GIFs..." className="w-full px-3 py-2 border rounded-lg mb-2 text-sm" />
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {gifs.map(gif => (
                        <img key={gif.id} src={gif.images.fixed_height_small.url} alt="" onClick={() => selectGif(gif.images.original.url, true)} className="cursor-pointer rounded hover:opacity-80 transition" />
                      ))}
                    </div>
                  </div>
                )}

                <form onSubmit={handleReply} className="flex gap-2">
                  <input value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Type a message..." className="flex-1 px-3 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-500" />
                  <button type="submit" className="w-10 h-10 bg-green-500 text-white rounded-full font-bold hover:bg-green-600 transition flex items-center justify-center">↑</button>
                </form>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">Select a chat</div>
        )}
      </div>

      {showCompose && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">New Message</h2>
            {error && <div className="mb-3 p-2 bg-red-50 text-red-600 rounded text-sm">{error}</div>}
            {success && <div className="mb-3 p-2 bg-green-50 text-green-600 rounded text-sm">{success}</div>}
            <form onSubmit={handleSubmit} className="space-y-3">
              <select value={form.subject} onChange={(e) => setForm({...form, subject: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required>
                <option value="">Select topic</option>
                <option value="Price Decrease Request">Price Decrease</option>
                <option value="Price Increase Request">Price Increase</option>
                <option value="Product Availability">Availability</option>
                <option value="Other">Other</option>
              </select>
              <div className="relative">
                <textarea value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} placeholder="Message..." className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" rows={3} required></textarea>
                <div className="flex gap-2 mt-2">
                  <button type="button" onClick={() => setShowEmoji(!showEmoji)} className="text-xl">😊</button>
                  <button type="button" onClick={() => setShowStickers(!showStickers)} className="text-xl">🎨</button>
                  <button type="button" onClick={() => setShowGif(!showGif)} className="text-xl">🎬</button>
                </div>
                {showEmoji && (
                  <div ref={emojiRef} className="absolute left-0 bottom-20 z-50">
                    <EmojiPicker onEmojiClick={(emojiObject) => addEmoji(emojiObject)} width={300} height={350} />
                  </div>
                )}
                {showStickers && (
                  <div className="absolute left-0 bottom-20 bg-white rounded-lg shadow-lg p-3 z-50 grid grid-cols-5 gap-2 w-64">
                    {STICKERS.map((sticker, index) => (
                      <button key={index} onClick={() => addSticker(sticker)} className="text-2xl hover:bg-gray-100 rounded p-1">{sticker}</button>
                    ))}
                  </div>
                )}
                {showGif && (
                  <div className="absolute left-0 bottom-20 bg-white rounded-lg shadow-lg p-3 z-50 w-80">
                    <input type="text" value={gifSearch} onChange={(e) => searchGifs(e.target.value)} placeholder="Search GIFs..." className="w-full px-3 py-2 border rounded-lg mb-2 text-sm" />
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {gifs.map(gif => (
                        <img key={gif.id} src={gif.images.fixed_height_small.url} alt="" onClick={() => selectGif(gif.images.original.url)} className="cursor-pointer rounded hover:opacity-80" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={(e) => setImage(e.target.files[0])} className="hidden" accept="image/*" />
              <button type="button" onClick={() => fileInputRef.current.click()} className="text-sm text-violet-600 hover:underline">
                📎 Attach Image {image && '(1)'}
              </button>
              <div className="flex gap-2">
                <button type="submit" disabled={sending} className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition">
                  {sending ? 'Sending...' : 'Send'}
                </button>
                <button type="button" onClick={() => { setShowCompose(false); setShowEmoji(false); setShowStickers(false); setShowGif(false); }} className="flex-1 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
