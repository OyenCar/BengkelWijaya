import React, { useState, useEffect, useCallback } from 'react';
import {
  LogOut, Package, Wrench, Image as ImageIcon, MessageSquareQuote, Inbox,
  Settings as SettingsIcon, Plus, Trash2, Pencil, Eye, EyeOff, X, Upload, Loader2, ExternalLink,
} from 'lucide-react';
import { api, imageUrl } from '../lib/api';

const STATUS = {
  baru: { label: 'Baru', color: 'bg-blue-100 text-blue-700' },
  diproses: { label: 'Diproses', color: 'bg-amber-100 text-amber-700' },
  penawaran_terkirim: { label: 'Penawaran Terkirim', color: 'bg-purple-100 text-purple-700' },
  selesai: { label: 'Selesai', color: 'bg-green-100 text-green-700' },
  batal: { label: 'Batal', color: 'bg-slate-200 text-slate-600' },
};

export default function AdminApp() {
  const [token, setToken] = useState(localStorage.getItem('bw_admin_token'));
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!token) { setChecking(false); return; }
    api.me().then((r) => setUser(r.user)).catch(() => logout()).finally(() => setChecking(false));
  }, [token]);

  const logout = () => {
    localStorage.removeItem('bw_admin_token');
    setToken(null); setUser(null);
  };

  if (checking) return <div className="min-h-screen flex items-center justify-center bg-slate-100"><Loader2 className="animate-spin text-slate-400" size={32} /></div>;
  if (!token || !user) return <Login onLogin={(t, u) => { localStorage.setItem('bw_admin_token', t); setToken(t); setUser(u); }} />;
  return <Dashboard user={user} onLogout={logout} />;
}

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
      const { token, user } = await api.login(username, password);
      onLogin(token, user);
    } catch (e2) { setErr(e2.message); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <form onSubmit={submit} className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">BENGKEL <span className="text-amber-500">WIJAYA</span></h1>
          <p className="text-slate-500 text-sm mt-1">Dashboard Admin</p>
        </div>
        {err && <div className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2 mb-4">{err}</div>}
        <label className="text-sm font-semibold text-slate-700">Username</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full mb-4 mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500" autoFocus />
        <label className="text-sm font-semibold text-slate-700">Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full mb-6 mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500" />
        <button disabled={loading} className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-amber-500 transition disabled:opacity-60">
          {loading ? 'Memproses…' : 'Masuk'}
        </button>
        <p className="text-center text-xs text-slate-400 mt-4">Default: admin / admin123</p>
      </form>
    </div>
  );
}

const TABS = [
  { id: 'inquiries', label: 'Penawaran Masuk', icon: Inbox },
  { id: 'products', label: 'Produk', icon: Package },
  { id: 'services', label: 'Layanan', icon: Wrench },
  { id: 'portfolio', label: 'Portfolio', icon: ImageIcon },
  { id: 'testimonials', label: 'Testimoni', icon: MessageSquareQuote },
  { id: 'settings', label: 'Pengaturan', icon: SettingsIcon },
];

function Dashboard({ user, onLogout }) {
  const [tab, setTab] = useState('inquiries');
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      <aside className="md:w-64 bg-slate-900 text-white md:min-h-screen">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold">BENGKEL <span className="text-amber-500">WIJAYA</span></h1>
          <p className="text-xs text-slate-400 mt-1">Halo, {user.username}</p>
        </div>
        <nav className="p-3 flex md:flex-col gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition ${tab === t.id ? 'bg-amber-500 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
              <t.icon size={18} /> {t.label}
            </button>
          ))}
        </nav>
        <div className="p-3 md:mt-auto md:absolute md:bottom-0 md:w-64">
          <a href="/" target="_blank" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-white"><ExternalLink size={16} /> Lihat Website</a>
          <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-white w-full"><LogOut size={16} /> Keluar</button>
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
        {tab === 'inquiries' && <Inquiries />}
        {tab === 'products' && <Products />}
        {tab === 'services' && <Services />}
        {tab === 'portfolio' && <Portfolio />}
        {tab === 'testimonials' && <Testimonials />}
        {tab === 'settings' && <SettingsPanel />}
      </main>
    </div>
  );
}

// ---------- Inquiries ----------
function Inquiries() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('');
  const load = useCallback(() => api.inquiries(filter).then(setItems).catch(console.error), [filter]);
  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <Header title="Penawaran Masuk" subtitle="Setiap permintaan dari website tercatat di sini (mini-CRM)." />
      <div className="flex gap-2 mb-4 flex-wrap">
        <FilterBtn active={filter === ''} onClick={() => setFilter('')}>Semua</FilterBtn>
        {Object.entries(STATUS).map(([k, v]) => <FilterBtn key={k} active={filter === k} onClick={() => setFilter(k)}>{v.label}</FilterBtn>)}
      </div>
      <div className="space-y-3">
        {items.map((it) => (
          <div key={it.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex justify-between items-start gap-4 flex-wrap">
              <div>
                <p className="font-bold text-slate-800">{it.name} <span className="text-slate-400 font-normal">· {it.phone}</span></p>
                <p className="text-sm text-amber-600 font-semibold mt-1">{it.need}</p>
                <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">{it.detail}</p>
                <p className="text-xs text-slate-400 mt-2">{new Date(it.created_at).toLocaleString('id-ID')}</p>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <select value={it.status} onChange={(e) => api.setInquiryStatus(it.id, e.target.value).then(load)} className={`text-xs font-bold rounded-lg px-2 py-1 border-0 ${STATUS[it.status]?.color || ''}`}>
                  {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <div className="flex gap-2">
                  <a href={`https://wa.me/${it.phone.replace(/\D/g, '').replace(/^0/, '62')}`} target="_blank" rel="noreferrer" className="text-xs text-green-600 font-semibold">Chat WA</a>
                  <button onClick={() => confirm('Hapus penawaran ini?') && api.deleteInquiry(it.id).then(load)} className="text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {!items.length && <Empty>Belum ada penawaran masuk.</Empty>}
      </div>
    </div>
  );
}

// ---------- Generic resource manager ----------
function ResourceManager({ resource, title, subtitle, columns, fields, withImage }) {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null); // object or null
  const load = useCallback(() => api.adminList(resource).then(setItems).catch(console.error), [resource]);
  useEffect(() => { load(); }, [load]);

  const toggleVisible = (it) => api.adminUpdate(resource, it.id, { is_visible: !it.is_visible }).then(load);
  const remove = (it) => confirm('Hapus item ini?') && api.adminDelete(resource, it.id).then(load);

  return (
    <div>
      <Header title={title} subtitle={subtitle} action={<button onClick={() => setEditing({})} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-amber-500"><Plus size={16} /> Tambah</button>} />
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-left"><tr>{columns.map((c) => <th key={c.key} className="px-4 py-3 font-semibold">{c.label}</th>)}<th className="px-4 py-3" /></tr></thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className="border-t border-slate-100">
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-3 align-top">
                      {c.key === 'image_url'
                        ? (it.image_url ? <img src={imageUrl(it.image_url)} className="w-14 h-14 object-cover rounded-lg" /> : <span className="text-slate-300">—</span>)
                        : <span className={c.key === columns[0].key ? 'font-semibold text-slate-800' : 'text-slate-600'}>{String(it[c.key] ?? '')}</span>}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {'is_visible' in it && (
                      <button onClick={() => toggleVisible(it)} title="Tampil/Sembunyi" className="text-slate-400 hover:text-amber-500 mr-2">
                        {it.is_visible ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                    )}
                    <button onClick={() => setEditing(it)} className="text-slate-400 hover:text-blue-500 mr-2"><Pencil size={18} /></button>
                    <button onClick={() => remove(it)} className="text-slate-400 hover:text-red-500"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
              {!items.length && <tr><td colSpan={columns.length + 1} className="px-4 py-10 text-center text-slate-400">Belum ada data.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      {editing && <EditModal resource={resource} fields={fields} withImage={withImage} item={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
    </div>
  );
}

function EditModal({ resource, fields, withImage, item, onClose, onSaved }) {
  const [form, setForm] = useState(() => {
    const base = {}; fields.forEach((f) => (base[f.key] = item[f.key] ?? f.default ?? '')); return base;
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const isNew = !item.id;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try { const { url } = await api.upload(file); set('image_url', url); }
    catch (e) { alert('Upload gagal: ' + e.message); } finally { setUploading(false); }
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if ('category_id' in payload && payload.category_id === '') payload.category_id = null;
      if (isNew) await api.adminCreate(resource, payload);
      else await api.adminUpdate(resource, item.id, payload);
      onSaved();
    } catch (e2) { alert('Gagal menyimpan: ' + e2.message); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={save} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 sticky top-0 bg-white">
          <h3 className="font-bold text-lg text-slate-800">{isNew ? 'Tambah' : 'Edit'} {resource}</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="text-sm font-semibold text-slate-700">{f.label}</label>
              {f.type === 'textarea' ? (
                <textarea value={form[f.key]} onChange={(e) => set(f.key, e.target.value)} rows="3" className={modalInput} />
              ) : f.type === 'select' ? (
                <select value={form[f.key] ?? ''} onChange={(e) => set(f.key, e.target.value)} className={modalInput}>
                  <option value="">— pilih —</option>
                  {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : f.type === 'number' ? (
                <input type="number" value={form[f.key]} onChange={(e) => set(f.key, Number(e.target.value))} className={modalInput} />
              ) : (
                <input value={form[f.key]} onChange={(e) => set(f.key, e.target.value)} className={modalInput} />
              )}
            </div>
          ))}
          {withImage && (
            <div>
              <label className="text-sm font-semibold text-slate-700">Gambar</label>
              <div className="flex items-center gap-3 mt-1">
                {form.image_url ? <img src={imageUrl(form.image_url)} className="w-16 h-16 object-cover rounded-lg" /> : <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center text-slate-300"><ImageIcon size={20} /></div>}
                <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
                  {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} Upload
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => onUpload(e.target.files[0])} />
                </label>
              </div>
              <input value={form.image_url} onChange={(e) => set('image_url', e.target.value)} placeholder="atau tempel URL gambar" className={modalInput} />
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2 sticky bottom-0 bg-white">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-slate-600 font-semibold">Batal</button>
          <button disabled={saving} className="bg-slate-900 text-white px-5 py-2 rounded-xl font-bold hover:bg-amber-500 disabled:opacity-60">{saving ? 'Menyimpan…' : 'Simpan'}</button>
        </div>
      </form>
    </div>
  );
}

function Products() {
  const [cats, setCats] = useState([]);
  useEffect(() => { api.categories().then(setCats); }, []);
  return (
    <ResourceManager
      resource="products" title="Katalog Produk" subtitle="Tambah, ubah, sembunyikan produk — perubahan langsung tampil di website." withImage
      columns={[{ key: 'name', label: 'Nama' }, { key: 'image_url', label: 'Foto' }, { key: 'price_label', label: 'Harga/Estimasi' }, { key: 'sort_order', label: 'Urutan' }]}
      fields={[
        { key: 'name', label: 'Nama Produk' },
        { key: 'category_id', label: 'Kategori', type: 'select', options: cats.map((c) => ({ value: c.id, label: c.name })) },
        { key: 'description', label: 'Deskripsi', type: 'textarea' },
        { key: 'price_label', label: 'Label Harga / Estimasi', default: 'Minta Penawaran' },
        { key: 'sort_order', label: 'Urutan', type: 'number', default: 0 },
      ]}
    />
  );
}
function Services() {
  return <ResourceManager resource="services" title="Layanan" subtitle="Daftar layanan yang tampil di beranda."
    columns={[{ key: 'title', label: 'Judul' }, { key: 'icon', label: 'Icon' }, { key: 'sort_order', label: 'Urutan' }]}
    fields={[{ key: 'title', label: 'Judul' }, { key: 'description', label: 'Deskripsi', type: 'textarea' }, { key: 'icon', label: 'Icon (Hammer, ShieldCheck, Factory, ChevronsUp, Grid3x3, Wrench, Flame)' }, { key: 'sort_order', label: 'Urutan', type: 'number', default: 0 }]} />;
}
function Portfolio() {
  return <ResourceManager resource="portfolio" title="Portfolio Proyek" subtitle="Galeri hasil pekerjaan (case study)." withImage
    columns={[{ key: 'title', label: 'Judul' }, { key: 'image_url', label: 'Foto' }, { key: 'category', label: 'Kategori' }, { key: 'sort_order', label: 'Urutan' }]}
    fields={[{ key: 'title', label: 'Judul' }, { key: 'category', label: 'Kategori' }, { key: 'description', label: 'Deskripsi', type: 'textarea' }, { key: 'sort_order', label: 'Urutan', type: 'number', default: 0 }]} />;
}
function Testimonials() {
  return <ResourceManager resource="testimonials" title="Testimoni" subtitle="Ulasan pelanggan."
    columns={[{ key: 'name', label: 'Nama' }, { key: 'role', label: 'Peran' }, { key: 'rating', label: 'Rating' }, { key: 'sort_order', label: 'Urutan' }]}
    fields={[{ key: 'name', label: 'Nama' }, { key: 'role', label: 'Peran' }, { key: 'text', label: 'Testimoni', type: 'textarea' }, { key: 'rating', label: 'Rating (1-5)', type: 'number', default: 5 }, { key: 'sort_order', label: 'Urutan', type: 'number', default: 0 }]} />;
}

function SettingsPanel() {
  const [data, setData] = useState({});
  const [saved, setSaved] = useState(false);
  useEffect(() => { api.settings().then(setData); }, []);
  const KEYS = [['business_name', 'Nama Bisnis'], ['whatsapp', 'WhatsApp (62…)'], ['address', 'Alamat'], ['hours', 'Jam Buka'], ['maps_link', 'Link Google Maps'], ['maps_embed', 'Maps Embed URL']];
  const save = async (e) => {
    e.preventDefault();
    await putSettings(data);
    setSaved(true); setTimeout(() => setSaved(false), 3000);
  };
  return (
    <div>
      <Header title="Pengaturan Bisnis" subtitle="Informasi ini tampil di website (kontak, peta, dll)." />
      <form onSubmit={save} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4 max-w-2xl">
        {KEYS.map(([k, label]) => (
          <div key={k}>
            <label className="text-sm font-semibold text-slate-700">{label}</label>
            <input value={data[k] || ''} onChange={(e) => setData({ ...data, [k]: e.target.value })} className={modalInput} />
          </div>
        ))}
        <button className="bg-slate-900 text-white px-5 py-2 rounded-xl font-bold hover:bg-amber-500">{saved ? 'Tersimpan ✓' : 'Simpan'}</button>
      </form>
    </div>
  );
}
async function putSettings(data) {
  const token = localStorage.getItem('bw_admin_token');
  const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const res = await fetch(`${BASE}/api/admin/settings`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(data) });
  if (!res.ok) alert('Gagal menyimpan pengaturan');
}

// ---------- small UI helpers ----------
const modalInput = 'w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-500';
function Header({ title, subtitle, action }) {
  return <div className="flex justify-between items-start gap-4 mb-6 flex-wrap"><div><h2 className="text-2xl font-bold text-slate-900">{title}</h2>{subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}</div>{action}</div>;
}
function FilterBtn({ active, onClick, children }) {
  return <button onClick={onClick} className={`px-3 py-1.5 rounded-full text-xs font-semibold ${active ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>{children}</button>;
}
function Empty({ children }) { return <div className="bg-white rounded-2xl p-10 text-center text-slate-400 border border-slate-100">{children}</div>; }
