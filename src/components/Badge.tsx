import { ApplicationStatus, ChatTicketStatus } from '@/types';

const APP_MAP: Record<ApplicationStatus, { label: string; cls: string }> = {
  pending:      { label: 'Pending',    cls: 'badge-pending' },
  approved:     { label: 'Approved',   cls: 'badge-approved' },
  declined:     { label: 'Declined',   cls: 'badge-declined' },
  under_review: { label: 'In Review',  cls: 'badge-review' },
};

const TICKET_MAP: Record<ChatTicketStatus, { label: string; cls: string }> = {
  open:     { label: 'Open',     cls: 'badge-open' },
  claimed:  { label: 'Claimed',  cls: 'badge-claimed' },
  resolved: { label: 'Resolved', cls: 'badge-resolved' },
  closed:   { label: 'Closed',   cls: 'badge-closed' },
};

export function AppBadge({ status }: { status: ApplicationStatus }) {
  const { label, cls } = APP_MAP[status] ?? { label: status, cls: 'badge' };
  return <span className={cls}>{label}</span>;
}

export function TicketBadge({ status }: { status: ChatTicketStatus }) {
  const { label, cls } = TICKET_MAP[status] ?? { label: status, cls: 'badge' };
  return <span className={cls}>{label}</span>;
}
