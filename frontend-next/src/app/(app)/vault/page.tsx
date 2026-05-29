'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { credentialsApi, entitiesApi } from '@/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Topbar from '@/components/layout/Topbar';
import { Plus, Eye, EyeOff, Copy, Pencil, Trash2, Search, KeyRound, ExternalLink } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import type { Credential, Entity } from '@/types';
import { copyToClipboard, formatDate, isExpired, isExpiringSoon } from '@/utils';
import toast from 'react-hot-toast';

function CredentialRow({ cred, onEdit, onDelete, isAdmin }: {
  cred: Credential; onEdit: () => void; onDelete: () => void; isAdmin: boolean;
}) {
  const [revealed, setRevealed] = useState<string | null>(null);
  const [revealing, setRevealing] = useState(false);

  async function handleReveal() {
    if (revealed) { setRevealed(null); return; }
    setRevealing(true);
    try {
      const r = await credentialsApi.reveal(cred.id);
      setRevealed(r.data.password);
      setTimeout(() => setRevealed(null), 30000);
    } catch { toast.error('Failed to reveal'); }
    finally { setRevealing(false); }
  }

  async function handleCopy() {
    setRevealing(true);
    try {
      const r = await credentialsApi.reveal(cred.id);
      await copyToClipboard(r.data.password);
      toast.success('Copied! Clears in 20s');
    } catch { toast.error('Failed to copy'); }
    finally { setRevealing(false); }
  }

  return (
    <tr className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
      <td className="py-3 px-4">
        <div>
          <p className="font-medium text-white">{cred.title}</p>
          <p className="text-xs text-slate-500">{cred.entity?.name}</p>
        </div>
      </td>
      <td className="py-3 px-4"><Badge>{cred.entity?.entityType?.label}</Badge></td>
      <td className="py-3 px-4">
        {cred.urlOrIp ? (
          <span className="text-xs font-mono text-slate-300 flex items-center gap-1">
            {cred.urlOrIp}<ExternalLink className="w-3 h-3 text-slate-500" />
          </span>
        ) : '—'}
      </td>
      <td className="py-3 px-4 text-slate-300 text-sm">{cred.username}</td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-slate-300">{revealed ? revealed : '••••••••••••'}</span>
          <button onClick={handleReveal} disabled={revealing} className="text-slate-400 hover:text-white">
            {revealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
          <button onClick={handleCopy} disabled={revealing} className="text-slate-400 hover:text-primary-400">
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
      <td className="py-3 px-4">
        {cred.expiryDate ? (
          <Badge variant={isExpired(cred.expiryDate) ? 'danger' : isExpiringSoon(cred.expiryDate, 7) ? 'warning' : 'success'}>
            {formatDate(cred.expiryDate)}
          </Badge>
        ) : '—'}
      </td>
      <td className="py-3 px-4">
        <div className="flex gap-2 justify-end">
          <button onClick={onEdit} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          {isAdmin && (
            <button onClick={onDelete} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

function CredentialCard({ cred, onEdit, onDelete, isAdmin }: {
  cred: Credential; onEdit: () => void; onDelete: () => void; isAdmin: boolean;
}) {
  const [revealed, setRevealed] = useState<string | null>(null);
  const [revealing, setRevealing] = useState(false);

  async function handleReveal() {
    if (revealed) { setRevealed(null); return; }
    setRevealing(true);
    try {
      const r = await credentialsApi.reveal(cred.id);
      setRevealed(r.data.password);
      setTimeout(() => setRevealed(null), 30000);
    } catch { toast.error('Failed to reveal'); }
    finally { setRevealing(false); }
  }

  async function handleCopy() {
    setRevealing(true);
    try {
      const r = await credentialsApi.reveal(cred.id);
      await copyToClipboard(r.data.password);
      toast.success('Copied! Clears in 20s');
    } catch { toast.error('Failed to copy'); }
    finally { setRevealing(false); }
  }

  return (
    <div className="bg-dark-900 border border-slate-700/50 rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-white truncate">{cred.title}</p>
          <p className="text-xs text-slate-400 mt-0.5">{cred.entity?.name} · <span className="text-slate-500">{cred.entity?.entityType?.label}</span></p>
        </div>
        <div className="flex gap-1 shrink-0">
          <button onClick={onEdit} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg">
            <Pencil className="w-4 h-4" />
          </button>
          {isAdmin && (
            <button onClick={onDelete} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {cred.urlOrIp && (
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate font-mono">{cred.urlOrIp}</span>
        </div>
      )}

      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-400 text-xs w-16 shrink-0">Username</span>
        <span className="text-slate-200 truncate font-mono text-xs">{cred.username}</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-slate-400 text-xs w-16 shrink-0">Password</span>
        <span className="font-mono text-xs text-slate-200 flex-1 truncate">
          {revealed ? revealed : '••••••••••••'}
        </span>
        <button onClick={handleReveal} disabled={revealing} className="p-1.5 text-slate-400 hover:text-white">
          {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
        <button onClick={handleCopy} disabled={revealing} className="p-1.5 text-primary-400 hover:text-primary-300">
          <Copy className="w-4 h-4" />
        </button>
      </div>

      {cred.expiryDate && (
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-xs w-16 shrink-0">Expiry</span>
          <Badge variant={isExpired(cred.expiryDate) ? 'danger' : isExpiringSoon(cred.expiryDate, 7) ? 'warning' : 'success'}>
            {formatDate(cred.expiryDate)}
          </Badge>
        </div>
      )}
    </div>
  );
}
function CredentialForm({ initial, entities, onSave, onClose }: {
  initial?: Credential; entities: Entity[]; onSave: (data: unknown) => void; onClose: () => void;
}) {
  const [form, setForm] = useState({
    entityId: initial?.entityId ?? '',
    title: initial?.title ?? '',
    urlOrIp: initial?.urlOrIp ?? '',
    username: initial?.username ?? '',
    password: '',
    notes: '',
    expiryDate: initial?.expiryDate ? initial.expiryDate.split('T')[0] : '',
    tags: '',
  });
  const [showPw, setShowPw] = useState(false);
  function set(k: string) { return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value })); }

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto">
      <div>
        <label className="label">Entity</label>
        <select className="input" value={form.entityId} onChange={set('entityId')}>
          <option value="">Select entity…</option>
          {entities.map(e => <option key={e.id} value={e.id}>{e.entityType?.label}: {e.name}</option>)}
        </select>
      </div>
      <Input label="Title" value={form.title} onChange={set('title')} />
      <Input label="URL / IP" value={form.urlOrIp} onChange={set('urlOrIp')} placeholder="192.168.1.1 or https://…" />
      <Input label="Username" value={form.username} onChange={set('username')} />
      <Input
        label="Password"
        type={showPw ? 'text' : 'password'}
        value={form.password}
        onChange={set('password')}
        placeholder={initial ? 'Leave blank to keep existing' : 'Enter password'}
        suffix={
          <button type="button" onClick={() => setShowPw(!showPw)} className="text-slate-400 hover:text-white">
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
      />
      <div>
        <label className="label">Notes</label>
        <textarea className="input resize-none" rows={2} value={form.notes} onChange={set('notes')} />
      </div>
      <Input label="Expiry Date" type="date" value={form.expiryDate} onChange={set('expiryDate')} />
      <Input label="Tags (comma-separated)" value={form.tags} onChange={set('tags')} placeholder="critical, server" />
      <div className="flex gap-3 justify-end pt-2">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button
          onClick={() => onSave({
            entityId: form.entityId, title: form.title, urlOrIp: form.urlOrIp || null,
            username: form.username, ...(form.password && { password: form.password }),
            ...(form.notes ? { notes: form.notes } : {}), expiryDate: form.expiryDate || null,
            tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
          })}
          disabled={!form.entityId || !form.title || !form.username || (!initial && !form.password)}
        >
          {initial ? 'Update' : 'Add'} Credential
        </Button>
      </div>
    </div>
  );
}

export default function VaultPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Credential | undefined>();

  const { data, isLoading } = useQuery({
    queryKey: ['credentials', search, page],
    queryFn: () => credentialsApi.list({ ...(search && { search }), page, limit: 15 }).then(r => r.data),
  });

  const { data: entities = [] } = useQuery({
    queryKey: ['entities-flat'],
    queryFn: () => entitiesApi.list().then(r => r.data),
  });

  const createMut = useMutation({
    mutationFn: credentialsApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['credentials'] }); setModalOpen(false); toast.success('Credential added'); },
    onError: () => toast.error('Failed to add credential'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => credentialsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['credentials'] }); setModalOpen(false); setEditing(undefined); toast.success('Updated'); },
    onError: () => toast.error('Failed to update credential'),
  });

  const deleteMut = useMutation({
    mutationFn: credentialsApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['credentials'] }); toast.success('Deleted'); },
  });

  const totalPages = Math.ceil((data?.total ?? 0) / 15);

  return (
    <>
      <Topbar title="Password Vault" />
      <main className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input className="input pl-9 w-full" placeholder="Search credentials…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <Button icon={<Plus className="w-4 h-4" />} className="shrink-0" onClick={() => { setEditing(undefined); setModalOpen(true); }}>
            Add Credential
          </Button>
        </div>

        <Card>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !data?.data?.length ? (
            <div className="text-center py-12">
              <KeyRound className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No credentials found</p>
            </div>
          ) : (
            <>
              {/* Mobile card list */}
              <div className="sm:hidden space-y-3">
                {data.data.map(cred => (
                  <CredentialCard
                    key={cred.id}
                    cred={cred}
                    isAdmin={user?.role === 'ADMIN'}
                    onEdit={() => { setEditing(cred); setModalOpen(true); }}
                    onDelete={() => deleteMut.mutate(cred.id)}
                  />
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Title</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Type</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">URL/IP</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Username</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Password</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Expiry</th>
                      <th className="py-3 px-4" />
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map(cred => (
                      <CredentialRow
                        key={cred.id}
                        cred={cred}
                        isAdmin={user?.role === 'ADMIN'}
                        onEdit={() => { setEditing(cred); setModalOpen(true); }}
                        onDelete={() => deleteMut.mutate(cred.id)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-700 mt-4">
                  <span className="text-sm text-slate-400">
                    {(page - 1) * 15 + 1}–{Math.min(page * 15, data.total)} of {data.total}
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
                    <Button size="sm" variant="secondary" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>

        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Credential' : 'Add Credential'} size="lg">
          <CredentialForm
            initial={editing}
            entities={entities}
            onSave={data => editing ? updateMut.mutate({ id: editing.id, data }) : createMut.mutate(data)}
            onClose={() => setModalOpen(false)}
          />
        </Modal>
      </main>
    </>
  );
}
