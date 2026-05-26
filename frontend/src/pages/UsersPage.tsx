import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { Plus, Trash2, Pencil, UserCheck } from 'lucide-react';
import type { User } from '@/types';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';

function UserForm({ initial, onSave, onClose }: {
  initial?: User;
  onSave: (data: unknown) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({ name: initial?.name ?? '', email: initial?.email ?? '', password: '', role: initial?.role ?? 'VIEWER' });
  function set(k: string) { return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(f => ({ ...f, [k]: e.target.value })); }
  return (
    <div className="space-y-4">
      <Input label="Name" value={form.name} onChange={set('name')} />
      <Input label="Email" type="email" value={form.email} onChange={set('email')} />
      <Input label="Password" type="password" value={form.password} onChange={set('password')} placeholder={initial ? 'Leave blank to keep' : 'Min 8 chars'} />
      <div>
        <label className="label">Role</label>
        <select className="input" value={form.role} onChange={set('role')}>
          <option value="VIEWER">Viewer</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={() => onSave({ ...form, ...(initial && !form.password && { password: undefined }) })}>
          {initial ? 'Update' : 'Create'} User
        </Button>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const { user: me } = useAuthStore();
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | undefined>();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.list().then(r => r.data),
  });

  const createMut = useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setModalOpen(false); toast.success('User created'); },
    onError: (e: unknown) => toast.error((e as { response?: { data?: { error?: string } } }).response?.data?.error || 'Failed'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => usersApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setModalOpen(false); setEditing(undefined); toast.success('Updated'); },
  });

  const deleteMut = useMutation({
    mutationFn: usersApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('User deleted'); },
    onError: () => toast.error('Failed to delete'),
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => { setEditing(undefined); setModalOpen(true); }}>
          Add User
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Name</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Email</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Role</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-medium text-white flex items-center gap-2">
                    {u.id === me?.id && <UserCheck className="w-3.5 h-3.5 text-primary-400" />}
                    {u.name}
                  </td>
                  <td className="py-3 px-4 text-slate-300">{u.email}</td>
                  <td className="py-3 px-4">
                    <Badge variant={u.role === 'ADMIN' ? 'info' : 'default'}>{u.role}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={u.isActive ? 'success' : 'danger'}>{u.isActive ? 'Active' : 'Inactive'}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => { setEditing(u); setModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      {u.id !== me?.id && (
                        <button onClick={() => deleteMut.mutate(u.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit User' : 'Add User'}>
        <UserForm
          initial={editing}
          onSave={data => editing ? updateMut.mutate({ id: editing.id, data }) : createMut.mutate(data)}
          onClose={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
