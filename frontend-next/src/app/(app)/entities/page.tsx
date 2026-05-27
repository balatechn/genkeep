'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { entitiesApi, entityTypesApi } from '@/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Topbar from '@/components/layout/Topbar';
import { Plus, Pencil, Trash2, Search, Building2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import type { Entity, EntityType } from '@/types';
import toast from 'react-hot-toast';

function EntityForm({
  initial, entityTypes, onSave, onClose,
}: {
  initial?: Entity;
  entityTypes: EntityType[];
  onSave: (data: { entityTypeId: string; name: string; description?: string }) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    entityTypeId: initial?.entityTypeId ?? '',
    name: initial?.name ?? '',
    description: initial?.description ?? '',
  });

  return (
    <div className="space-y-4">
      <div>
        <label className="label">Entity Type</label>
        <select className="input" value={form.entityTypeId} onChange={e => setForm(f => ({ ...f, entityTypeId: e.target.value }))}>
          <option value="">Select type…</option>
          {entityTypes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
      </div>
      <Input label="Entity Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
      <Input label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
      <div className="flex gap-3 justify-end pt-2">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={() => onSave(form)} disabled={!form.entityTypeId || !form.name}>
          {initial ? 'Update' : 'Create'} Entity
        </Button>
      </div>
    </div>
  );
}

export default function EntitiesPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Entity | undefined>();

  const { data: entityTypes = [] } = useQuery({
    queryKey: ['entity-types'],
    queryFn: () => entityTypesApi.list().then(r => r.data),
  });

  const { data: entities = [], isLoading } = useQuery({
    queryKey: ['entities', search, typeFilter],
    queryFn: () => entitiesApi.list({ ...(search && { search }), ...(typeFilter && { typeCode: typeFilter }) }).then(r => r.data),
  });

  const createMut = useMutation({
    mutationFn: (data: { entityTypeId: string; name: string; description?: string }) => entitiesApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['entities'] }); setModalOpen(false); toast.success('Entity created'); },
    onError: () => toast.error('Failed to create entity'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<{ name: string; description: string }> }) => entitiesApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['entities'] }); setModalOpen(false); setEditing(undefined); toast.success('Entity updated'); },
  });

  const deleteMut = useMutation({
    mutationFn: entitiesApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['entities'] }); toast.success('Entity deleted'); },
    onError: () => toast.error('Cannot delete entity with credentials'),
  });

  function openCreate() { setEditing(undefined); setModalOpen(true); }
  function openEdit(e: Entity) { setEditing(e); setModalOpen(true); }

  return (
    <>
      <Topbar title="Entities" />
      <main className="flex-1 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input className="input pl-9 w-64" placeholder="Search entities…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="input w-44" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="">All types</option>
              {entityTypes.map(t => <option key={t.code} value={t.code}>{t.label}</option>)}
            </select>
          </div>
          {user?.role === 'ADMIN' && (
            <Button icon={<Plus className="w-4 h-4" />} onClick={openCreate}>Add Entity</Button>
          )}
        </div>

        <Card>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : entities.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No entities found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Name</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Type</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Description</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Credentials</th>
                    {user?.role === 'ADMIN' && <th className="py-3 px-4" />}
                  </tr>
                </thead>
                <tbody>
                  {entities.map(entity => (
                    <tr key={entity.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-medium text-white">{entity.name}</td>
                      <td className="py-3 px-4"><Badge>{entity.entityType?.label}</Badge></td>
                      <td className="py-3 px-4 text-slate-400">{entity.description || '—'}</td>
                      <td className="py-3 px-4 text-slate-300">{entity._count?.credentials ?? 0}</td>
                      {user?.role === 'ADMIN' && (
                        <td className="py-3 px-4">
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => openEdit(entity)} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => deleteMut.mutate(entity.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Entity' : 'Add Entity'}>
          <EntityForm
            initial={editing}
            entityTypes={entityTypes}
            onSave={data => editing ? updateMut.mutate({ id: editing.id, data }) : createMut.mutate(data)}
            onClose={() => setModalOpen(false)}
          />
        </Modal>
      </main>
    </>
  );
}
