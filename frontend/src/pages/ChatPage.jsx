import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { getSocket } from '../socket/socket';

export default function ChatPage() {
  const { userId: paramUserId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [friendsList, setFriendsList] = useState([]);
  const [pendingIds, setPendingIds] = useState([]);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { 
     api.get('/chat/conversations').then(r => setConversations(r.data)); 
     api.get('/users/social/friends').then(r => {
        setFriendsList(r.data.friends.map(f => String(f._id)));
        setPendingIds(r.data.friendRequests.map(r => String(r._id)));
     });
  }, []);

  useEffect(() => {
    if (!paramUserId) return;
    api.get(`/chat/${paramUserId}`).then(r => { setActiveUser(r.data.otherUser); setMessages(r.data.messages); });
  }, [paramUserId]);

  useEffect(() => {
    const socket = getSocket();
    if (activeUser) socket.emit('chat:join', { userId: activeUser._id });
    socket.on('chat:message', msg => {
      setMessages(prev => prev.some(m => m._id === msg._id) ? prev : [...prev, msg]);
    });
    return () => socket.off('chat:message');
  }, [activeUser]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  useEffect(() => {
    if (!search.trim() || search.length < 2) { setSearchResults([]); return; }
    const t = setTimeout(() => { api.get(`/users/search?q=${search}`).then(r => setSearchResults(r.data)); }, 280);
    return () => clearTimeout(t);
  }, [search]);

  const openChat = async u => {
    setActiveUser(u); setSearch(''); setSearchResults([]);
    const { data } = await api.get(`/chat/${u._id}`);
    setMessages(data.messages);
    navigate(`/chat/${u._id}`);
    api.get('/chat/conversations').then(r => setConversations(r.data));
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const sendMessage = useCallback(async () => {
    if (!input.trim() || !activeUser || sending) return;
    const content = input.trim(); setInput(''); setSending(true);
    try { getSocket().emit('chat:message', { receiverId: activeUser._id, content }); }
    finally { setSending(false); }
  }, [input, activeUser, sending]);

  const fmtTime = dt => dt ? new Date(dt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) : '';

  const sendFriendReq = async (id) => {
    try {
      await api.post('/users/social/request', { targetId: id });
      setPendingIds(prev => [...prev, String(id)]); // optimistically hide the add button after click
    } catch(err) {} 
  };

  const isFriend = activeUser && friendsList.includes(String(activeUser._id));
  const isReqSent = activeUser && pendingIds.includes(String(activeUser._id));

  return (
    <div className="chat-layout">
      {/* Conversation list */}
      <div className="chat-list">
        <div className="chat-list-header">
          <div className="chat-list-title">Messages</div>
          <input className="chat-search" placeholder="Search by name or #ID…" value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>

        {searchResults.length > 0 && (
          <div style={{borderBottom:'1px solid var(--border)',padding:'4px 6px'}}>
            <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',color:'var(--text-muted)',padding:'4px 6px 6px'}}>Users</div>
            {searchResults.map(u => (
              <div key={u._id} className="chat-convo" onClick={() => openChat(u)}>
                <div className="avatar" style={{background:u.avatarColor,width:28,height:28,fontSize:11}}>{u.username[0].toUpperCase()}</div>
                <div style={{display:'flex',flexDirection:'column',gap:1}}>
                  <span style={{fontSize:13,fontWeight:600}}>{u.username}</span>
                  {u.profileId && <span style={{fontSize:11,color:'var(--text-muted)',fontWeight:500}}>#{u.profileId}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="chat-convo-list">
          {!conversations.length && !search && (
            <div style={{padding:'20px 10px',textAlign:'center',fontSize:13,color:'var(--text-muted)'}}>
              Search for a user above to start a conversation.
            </div>
          )}
          {conversations.map(c => (
            <div key={c.user._id} className={`chat-convo${activeUser?._id===c.user._id?' active':''}`} onClick={() => openChat(c.user)}>
              <div className="avatar" style={{background:c.user.avatarColor,width:28,height:28,fontSize:11}}>{c.user.username[0].toUpperCase()}</div>
              <div className="chat-convo-info">
                <div className="chat-convo-name">{c.user.username}</div>
                <div className="chat-convo-last">{c.lastMessage?.content?.slice(0,32)}</div>
              </div>
              {c.unread > 0 && <div className="chat-unread">{c.unread}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Main chat */}
      <div className="chat-main">
        {!activeUser ? (
          <div className="chat-empty-main">
            <div style={{width:40,height:40,borderRadius:10,background:'var(--bg-hover)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:8}}>
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="var(--text-muted)" strokeWidth="1.5"><path d="M14 10a2 2 0 0 1-2 2H5l-3 3V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6z"/></svg>
            </div>
            <div style={{fontWeight:600,fontSize:14,color:'var(--text-secondary)'}}>Select a conversation</div>
            <div style={{fontSize:13,color:'var(--text-muted)'}}>Search for a user to start messaging.</div>
          </div>
        ) : (
          <>
            <div className="chat-main-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                 <div className="avatar" style={{background:activeUser.avatarColor,width:30,height:30,fontSize:11}}>{activeUser.username[0].toUpperCase()}</div>
                 <div className="chat-main-name">{activeUser.username}</div>
              </div>
              
              {!isFriend && (
                 <button 
                   className={`btn btn-sm ${isReqSent ? 'btn-ghost' : 'btn-outline'}`} 
                   onClick={() => !isReqSent && sendFriendReq(activeUser._id)}
                   disabled={isReqSent}
                 >
                    {isReqSent ? 'Request Sent' : '+ Add Friend'}
                 </button>
              )}
            </div>
            <div className="chat-msgs">
              {!messages.length && (
                <div style={{textAlign:'center',color:'var(--text-muted)',fontSize:13,marginTop:40}}>
                  Start the conversation with {activeUser.username}.
                </div>
              )}
              {messages.map((msg,i) => {
                const mine = String(msg.senderId)===String(user?.id);
                return (
                  <div key={msg._id||i} className={`chat-msg${mine?' mine':' theirs'}`}>
                    {!mine && <div className="avatar" style={{background:activeUser.avatarColor,width:24,height:24,fontSize:9,flexShrink:0}}>{activeUser.username[0].toUpperCase()}</div>}
                    <div>
                      <div className="chat-bubble">{msg.content}</div>
                      <div className="chat-time">{fmtTime(msg.createdAt)}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={endRef}/>
            </div>
            <div className="chat-input-row">
              <textarea ref={inputRef} className="chat-input" rows={1}
                placeholder={`Message ${activeUser.username}…`}
                value={input} onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage();}}}
              />
              <button className="chat-send" onClick={sendMessage} disabled={!input.trim()||sending}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2"><path d="M2 8h12M10 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
