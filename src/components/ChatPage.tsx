'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { TicketBadge } from '@/components/Badge';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { ChatTicket, ChatMessage } from '@/types';
import { formatDistanceToNow, format } from 'date-fns';
import { MessageSquare, Search, Send, Zap, CheckCircle, Archive, User } from 'lucide-react';

type Filter = 'all' | 'open' | 'claimed' | 'resolved';

export default function ChatPage() {
  const { admin }      = useAuth();
  const searchParams   = useSearchParams();
  const initialTicket  = searchParams.get('ticket');

  const [tickets, setTickets]             = useState<ChatTicket[]>([]);
  const [selected, setSelected]           = useState<ChatTicket | null>(null);
  const [messages, setMessages]           = useState<ChatMessage[]>([]);
  const [draft, setDraft]                 = useState('');
  const [filter, setFilter]               = useState<Filter>('all');
  const [search, setSearch]               = useState('');
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [loadingMsgs, setLoadingMsgs]     = useState(false);
  const [sending, setSending]             = useState(false);
  const [actionBusy, setActionBusy]       = useState<string | null>(null);

  const bottomRef     = useRef<HTMLDivElement>(null);
  const selectedRef   = useRef<ChatTicket | null>(null);
  selectedRef.current = selected;

  // ── Fetch tickets ───────────────────────────────────────────
  const fetchTickets = useCallback(async () => {
    const { data } = await supabase
      .from('chat_tickets')
      .select('*, claimer:admins(id,full_name)')
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });

    const list = data ?? [];
    setTickets(list);
    setLoadingTickets(false);

    // Auto-select from URL param on first load
    if (initialTicket && !selectedRef.current) {
      const found = list.find((t: ChatTicket) => t.id === initialTicket);
      if (found) openTicket(found);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  // Realtime for ticket list
  useEffect(() => {
    const ch = supabase
      .channel('tickets-list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_tickets' }, fetchTickets)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [fetchTickets]);

  // ── Open ticket / load messages ─────────────────────────────
  const openTicket = async (ticket: ChatTicket) => {
    setSelected(ticket);
    setMessages([]);
    setLoadingMsgs(true);
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('ticket_id', ticket.id)
      .order('created_at', { ascending: true });
    setMessages(data ?? []);
    setLoadingMsgs(false);
  };

  // Realtime for messages in selected ticket
  useEffect(() => {
    if (!selected) return;
    const ch = supabase
      .channel(`msgs-${selected.id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'chat_messages',
        filter: `ticket_id=eq.${selected.id}`,
      }, payload => {
        setMessages(prev => [...prev, payload.new as ChatMessage]);
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [selected?.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Ticket actions ───────────────────────────────────────────
  const claimTicket = async () => {
    if (!selected || !admin) return;
    setActionBusy('claim');
    await supabase.from('chat_tickets').update({
      status: 'claimed', claimed_by: admin.id, claimed_at: new Date().toISOString(),
    }).eq('id', selected.id);
    setSelected(t => t ? { ...t, status: 'claimed', claimed_by: admin.id } : t);
    fetchTickets();
    setActionBusy(null);
  };

  const resolveTicket = async () => {
    if (!selected) return;
    setActionBusy('resolve');
    await supabase.from('chat_tickets').update({ status: 'resolved' }).eq('id', selected.id);
    setSelected(t => t ? { ...t, status: 'resolved' } : t);
    fetchTickets();
    setActionBusy(null);
  };

  const closeTicket = async () => {
    if (!selected) return;
    setActionBusy('close');
    await supabase.from('chat_tickets').update({ status: 'closed' }).eq('id', selected.id);
    setSelected(t => t ? { ...t, status: 'closed' } : t);
    fetchTickets();
    setActionBusy(null);
  };

  // ── Send message ─────────────────────────────────────────────
  const sendMessage = async () => {
    const content = draft.trim();
    if (!content || !selected || !admin) return;
    setSending(true);
    setDraft('');
    await supabase.from('chat_messages').insert({
      ticket_id: selected.id, sender_id: admin.id,
      sender_type: 'admin', sender_name: admin.full_name, content,
    });
    await supabase.from('chat_tickets').update({
      last_message: content, last_message_at: new Date().toISOString(),
    }).eq('id', selected.id);
    setSending(false);
  };

  // ── Derived state ─────────────────────────────────────────────
  const visible = tickets
    .filter(t => filter === 'all' || t.status === filter)
    .filter(t => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return t.user_name.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q);
    });

  const counts: Record<Filter, number> = {
    all:      tickets.length,
    open:     tickets.filter(t => t.status === 'open').length,
    claimed:  tickets.filter(t => t.status === 'claimed').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
  };

  const isMine    = selected?.claimed_by === admin?.id;
  const canSend   = selected?.status === 'claimed' && isMine;
  const canClaim  = selected?.status === 'open';
  const canResolve= selected?.status === 'claimed' && isMine;
  const canClose  = selected?.status === 'resolved' || (selected?.status === 'claimed' && isMine);

  return (
    <AppShell>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

        {/* ── Ticket sidebar ── */}
        <div style={{ width: 300, minWidth: 300, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--bg2)' }}>
          {/* Sidebar header */}
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
              <MessageSquare size={14} style={{ color: 'var(--brand)' }} />
              <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text)' }}>Support</span>
              {counts.open > 0 && (
                <span style={{ marginLeft: 'auto', background: 'rgba(252,211,77,0.12)', color: '#FCD34D', border: '1px solid rgba(252,211,77,0.2)', padding: '1px 8px', borderRadius: 12, fontSize: '0.6875rem', fontWeight: 700 }}>
                  {counts.open} open
                </span>
              )}
            </div>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: 8 }}>
              <Search size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
              <input type="text" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)}
                className="input" style={{ paddingLeft: '1.875rem', fontSize: '0.8125rem', padding: '0.4375rem 0.875rem 0.4375rem 1.875rem' }} />
            </div>

            {/* Filter pills */}
            <div style={{ display: 'flex', gap: 3, background: 'var(--bg3)', borderRadius: 8, padding: 3 }}>
              {(['all','open','claimed','resolved'] as Filter[]).map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  flex: 1, padding: '3px 0', borderRadius: 6, border: 'none', cursor: 'pointer',
                  fontSize: '0.6875rem', fontWeight: filter === f ? 700 : 400,
                  color: filter === f ? 'var(--text)' : 'var(--text3)',
                  background: filter === f ? 'var(--bg4)' : 'transparent',
                  transition: 'all 0.12s', textTransform: 'capitalize',
                }}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Ticket list */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loadingTickets ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto' }} />
              </div>
            ) : visible.length === 0 ? (
              <div style={{ padding: '2.5rem', textAlign: 'center' }}>
                <MessageSquare size={28} style={{ color: 'var(--text3)', opacity: 0.25, margin: '0 auto 8px' }} />
                <p style={{ color: 'var(--text3)', fontSize: '0.8125rem' }}>No tickets found</p>
              </div>
            ) : (
              visible.map(ticket => {
                const isSel  = selected?.id === ticket.id;
                const isOpen = ticket.status === 'open';
                return (
                  <button key={ticket.id} onClick={() => openTicket(ticket)} style={{
                    width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
                    padding: '0.75rem 0.875rem',
                    borderBottom: '1px solid var(--border)',
                    borderLeft: `2px solid ${isSel ? 'var(--brand)' : 'transparent'}`,
                    background: isSel ? 'rgba(147,89,255,0.08)' : 'transparent',
                    transition: 'background 0.12s',
                  }}
                    onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = 'rgba(147,89,255,0.04)'; }}
                    onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ display: 'flex', gap: 8 }}>
                      {/* Avatar with open dot */}
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 8,
                          background: 'rgba(147,89,255,0.18)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.8125rem', fontWeight: 700, color: '#C49BFF',
                        }}>
                          {ticket.user_name.charAt(0).toUpperCase()}
                        </div>
                        {isOpen && (
                          <span style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: '50%', background: '#FCD34D', border: '1.5px solid var(--bg2)' }} />
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 4, marginBottom: 2 }}>
                          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {ticket.user_name}
                          </span>
                          {ticket.last_message_at && (
                            <span style={{ fontSize: '0.625rem', color: 'var(--text3)', flexShrink: 0 }}>
                              {formatDistanceToNow(new Date(ticket.last_message_at), { addSuffix: false })
                                .replace('about ', '').replace(' hours', 'h').replace(' hour', 'h')
                                .replace(' minutes', 'm').replace(' minute', 'm').replace(' days', 'd').replace(' day', 'd')}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>
                          {ticket.subject}
                        </div>
                        {ticket.last_message && (
                          <div style={{ fontSize: '0.6875rem', color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>
                            {ticket.last_message}
                          </div>
                        )}
                        <TicketBadge status={ticket.status} />
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── Chat area ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {!selected ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <MessageSquare size={44} style={{ color: 'var(--text3)', opacity: 0.15 }} />
              <p style={{ color: 'var(--text3)', fontSize: '0.9375rem' }}>Select a ticket to start</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg2)', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(147,89,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, color: '#C49BFF' }}>
                    {selected.user_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text)' }}>{selected.user_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{selected.user_email} · {selected.subject}</div>
                  </div>
                  <div style={{ marginLeft: 6 }}><TicketBadge status={selected.status} /></div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
                  {canClaim && (
                    <button className="btn-primary" onClick={claimTicket} disabled={!!actionBusy} style={{ fontSize: '0.8125rem', padding: '0.4375rem 0.875rem' }}>
                      {actionBusy === 'claim' ? <><div className="spinner" style={{ width: 13, height: 13 }} />Claiming…</> : <><Zap size={13} />Claim Ticket</>}
                    </button>
                  )}
                  {canResolve && (
                    <button className="btn-success" onClick={resolveTicket} disabled={!!actionBusy} style={{ fontSize: '0.8125rem', padding: '0.4375rem 0.875rem' }}>
                      {actionBusy === 'resolve' ? <><div className="spinner" style={{ width: 13, height: 13 }} />Resolving…</> : <><CheckCircle size={13} />Resolve</>}
                    </button>
                  )}
                  {canClose && (
                    <button className="btn-ghost" onClick={closeTicket} disabled={!!actionBusy} style={{ fontSize: '0.8125rem', padding: '0.4375rem 0.875rem' }}>
                      {actionBusy === 'close' ? <><div className="spinner" style={{ width: 13, height: 13 }} />Closing…</> : <><Archive size={13} />Close</>}
                    </button>
                  )}
                  {selected.status === 'claimed' && !isMine && (
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <User size={12} /> Claimed by {(selected.claimer as any)?.full_name ?? 'another admin'}
                    </span>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {loadingMsgs ? (
                  <div style={{ textAlign: 'center', paddingTop: '2rem' }}>
                    <div className="spinner" style={{ margin: '0 auto' }} />
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text3)', fontSize: '0.875rem', paddingTop: '3rem' }}>
                    No messages yet.{canClaim ? ' Claim this ticket to start chatting.' : ''}
                  </div>
                ) : (
                  messages.map(msg => {
                    const isAdmin = msg.sender_type === 'admin';
                    return (
                      <div key={msg.id} style={{ display: 'flex', flexDirection: isAdmin ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 7 }}>
                        <div style={{
                          width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                          background: isAdmin ? 'linear-gradient(135deg,#9359FF,#6B35CC)' : 'rgba(147,89,255,0.18)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.625rem', fontWeight: 700, color: isAdmin ? 'white' : '#C49BFF',
                        }}>
                          {msg.sender_name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ maxWidth: '64%' }}>
                          <div style={{
                            padding: '0.5625rem 0.8125rem',
                            borderRadius: isAdmin ? '11px 11px 4px 11px' : '11px 11px 11px 4px',
                            background: isAdmin ? 'rgba(147,89,255,0.22)' : 'var(--bg3)',
                            border: `1px solid ${isAdmin ? 'rgba(147,89,255,0.28)' : 'var(--border)'}`,
                            fontSize: '0.875rem', color: 'var(--text)', lineHeight: 1.5,
                          }}>
                            {msg.content}
                          </div>
                          <div style={{ fontSize: '0.625rem', color: 'var(--text3)', marginTop: 3, textAlign: isAdmin ? 'right' : 'left' }}>
                            {msg.sender_name} · {format(new Date(msg.created_at), 'HH:mm')}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div style={{ padding: '0.875rem 1.25rem', borderTop: '1px solid var(--border)', background: 'var(--bg2)', flexShrink: 0 }}>
                {!canSend ? (
                  <div style={{ padding: '0.75rem 1rem', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text3)' }}>
                    {selected.status === 'open'     && '⚡ Claim this ticket to reply'}
                    {selected.status === 'claimed' && !isMine && '🔒 Claimed by another admin'}
                    {selected.status === 'resolved' && '✅ Ticket resolved'}
                    {selected.status === 'closed'   && '🗄 Ticket closed'}
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                    <textarea
                      value={draft} onChange={e => setDraft(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                      placeholder="Type a message… (Enter to send)"
                      rows={2} className="input" style={{ flex: 1, resize: 'none', lineHeight: 1.5 }}
                    />
                    <button className="btn-primary" onClick={sendMessage} disabled={sending || !draft.trim()} style={{ padding: '0.5625rem 0.875rem', flexShrink: 0, alignSelf: 'flex-end' }}>
                      {sending ? <div className="spinner" style={{ width: 14, height: 14 }} /> : <Send size={14} />}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
