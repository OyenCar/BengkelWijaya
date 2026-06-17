import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { useSwipeable } from 'react-swipeable';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Hammer, Flame, ShieldCheck, Phone, MapPin, Clock, Menu, X, ChevronRight,
  Star, Instagram, Facebook, MessageCircle, Navigation, Factory, ChevronsUp,
  Grid3x3, Wrench, Send, CheckCircle2,
} from 'lucide-react';
import { api, imageUrl } from '../lib/api';
import Chatbot from './Chatbot';

const Hero3D = lazy(() => import('./Hero3D'));

gsap.registerPlugin(ScrollTrigger);

// Map icon names (stored in DB) to lucide components
const ICONS = { Hammer, Flame, ShieldCheck, ChevronRight, Factory, ChevronsUp, Grid3x3, Wrench };
const iconFor = (name) => {
  const Cmp = ICONS[name] || Hammer;
  return <Cmp className="w-8 h-8 text-amber-500" />;
};

const formatNomor = (nomor) => {
  let str = (nomor || '').toString();
  if (str.startsWith('62')) str = '0' + str.slice(2);
  return str.replace(/(\d{4})(\d{4})(\d+)/, '$1-$2-$3');
};

export default function SitePage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Data from backend (data-driven — nothing hardcoded)
  const [services, setServices] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [settings, setSettings] = useState({});
  const [activeCat, setActiveCat] = useState('all');
  const [loadError, setLoadError] = useState(null);

  const nomor = settings.whatsapp || '';
  const nomorDisplay = formatNomor(nomor);

  useEffect(() => {
    Promise.all([
      api.services(), api.portfolio(), api.products(), api.categories(),
      api.testimonials(), api.settings(),
    ])
      .then(([s, pf, pr, cat, t, set]) => {
        setServices(s); setPortfolio(pf); setProducts(pr);
        setCategories(cat); setTestimonials(t); setSettings(set);
      })
      .catch((e) => setLoadError(e.message));
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // GSAP scroll-triggered reveals (run after data renders)
  const rootRef = useRef(null);
  useEffect(() => {
    if (!services.length && !products.length) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.reveal').forEach((el) => {
        gsap.from(el, {
          opacity: 0, y: 48, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%' },
        });
      });
      gsap.utils.toArray('.reveal-stagger').forEach((group) => {
        gsap.from(group.children, {
          opacity: 0, y: 40, duration: 0.6, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: group, start: 'top 80%' },
        });
      });
    }, rootRef);
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [services, products, portfolio, testimonials]);

  const handleNext = () => setActiveTestimonial((p) => (p + 1) % Math.max(testimonials.length, 1));
  const handlePrev = () => setActiveTestimonial((p) => (p === 0 ? testimonials.length - 1 : p - 1));
  const swipeHandlers = useSwipeable({ onSwipedLeft: handleNext, onSwipedRight: handlePrev, trackMouse: true, trackTouch: true });

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  // Quote request form -> backend (mini-CRM) + optional WhatsApp handoff
  const [form, setForm] = useState({ nama: '', noWa: '', kebutuhan: 'Pagar / Gerbang', detail: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleKirim = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createInquiry({ name: form.nama, phone: form.noWa, need: form.kebutuhan, detail: form.detail });
      setSubmitted(true);
      // Hand off to WhatsApp as well
      const pesan = `Halo Bengkel Wijaya, saya ingin minta penawaran.\n\nNama: ${form.nama}\nNo WA: ${form.noWa}\nKebutuhan: ${form.kebutuhan}\nDetail: ${form.detail}`;
      if (nomor) window.open(`https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`, '_blank');
      setForm({ nama: '', noWa: '', kebutuhan: 'Pagar / Gerbang', detail: '' });
      setTimeout(() => setSubmitted(false), 6000);
    } catch (err) {
      alert('Gagal mengirim: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = activeCat === 'all'
    ? products
    : products.filter((p) => p.category_slug === activeCat);

  const navItems = ['Beranda', 'Layanan', 'Katalog', 'Portofolio', 'Testimoni'];

  return (
    <div ref={rootRef} className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Navbar */}
      <nav className={`fixed w-full z-40 transition-all duration-300 ${isScrolled ? 'bg-slate-900/95 backdrop-blur shadow-lg py-3' : 'bg-transparent py-5'}`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/LogoBengkelWeb.webp" alt="Logo" className="w-8 h-8" onError={(e) => (e.target.style.display = 'none')} />
            <span className="text-2xl font-bold tracking-tighter text-white">
              BENGKEL <span className="text-amber-500">WIJAYA</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button key={item} onClick={() => scrollToSection(item.toLowerCase())} className="text-white hover:text-amber-400 font-medium transition-colors">
                {item}
              </button>
            ))}
            <button onClick={() => scrollToSection('kontak')} className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-full font-bold transition-transform hover:scale-105">
              Minta Penawaran
            </button>
          </div>
          <button className="md:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
        {isMobileMenuOpen && (
          <div className="md:hidden bg-slate-900 absolute top-full left-0 w-full p-4 flex flex-col gap-4 shadow-xl border-t border-slate-800">
            {[...navItems, 'Kontak'].map((item) => (
              <button key={item} onClick={() => scrollToSection(item.toLowerCase())} className="text-white text-left py-2 hover:text-amber-500 border-b border-slate-800 last:border-0">
                {item}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Hero */}
      <section id="beranda" className="relative h-screen flex items-center justify-center bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-30">
          <img src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=1920" alt="" className="w-full h-full object-cover" />
        </div>
        {/* Three.js metallic showcase (desktop only, lazy) */}
        <Suspense fallback={null}><Hero3D /></Suspense>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-slate-900/20 z-20" />
        <div className="container mx-auto px-4 relative z-30 text-center pointer-events-none">
          <div className="inline-block bg-amber-500/20 text-amber-400 px-4 py-1 rounded-full text-sm font-semibold mb-6 border border-amber-500/30 backdrop-blur-sm">
            Bengkel Las Profesional &amp; Bergaransi
          </div>
          <h1 className="hero-title text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
            Konstruksi Logam <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">Kuat &amp; Presisi</span>
          </h1>
          <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Melayani pagar, kanopi, teralis, hingga konstruksi baja berat dengan material terbaik dan pengerjaan tepat waktu.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pointer-events-auto">
            <button onClick={() => scrollToSection('kontak')} className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/30">
              <MessageCircle size={20} /> Minta Penawaran
            </button>
            <button onClick={() => scrollToSection('katalog')} className="bg-transparent border-2 border-white hover:bg-white hover:text-slate-900 text-white px-8 py-4 rounded-full font-bold text-lg transition-all">
              Lihat Katalog
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="bg-amber-500 py-6 relative z-30">
        <div className="container mx-auto px-4 flex flex-wrap justify-around gap-6 text-white text-center reveal-stagger">
          {[['10+', 'Tahun Pengalaman'], ['500+', 'Proyek Selesai'], ['100%', 'Garansi Kepuasan']].map(([n, l]) => (
            <div key={l}><div className="text-3xl font-bold">{n}</div><div className="text-sm opacity-90">{l}</div></div>
          ))}
        </div>
      </div>

      {loadError && (
        <div className="bg-red-50 text-red-700 text-center py-3 text-sm">
          Gagal memuat data dari server: {loadError}. Pastikan backend berjalan di {import.meta.env.VITE_API_URL || 'http://localhost:4000'}.
        </div>
      )}

      {/* Services */}
      <section id="layanan" className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 reveal">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Layanan Kami</h2>
            <div className="w-20 h-1 bg-amber-500 mx-auto rounded-full mb-4" />
            <p className="text-slate-600 max-w-xl mx-auto">Solusi lengkap untuk kebutuhan besi dan baja properti Anda dengan standar kualitas tinggi.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 reveal-stagger">
            {services.map((s) => (
              <div key={s.id} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 group hover:-translate-y-2">
                <div className="mb-6 p-4 bg-slate-100 rounded-xl inline-block group-hover:bg-amber-50 transition-colors">{iconFor(s.icon)}</div>
                <h3 className="text-xl font-bold mb-3 text-slate-800">{s.title}</h3>
                <p className="text-slate-600 leading-relaxed text-sm">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Catalog */}
      <section id="katalog" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 reveal">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Katalog Produk</h2>
            <div className="w-20 h-1 bg-amber-500 mx-auto rounded-full mb-4" />
            <p className="text-slate-600">Harga bersifat estimasi — sebagian besar pekerjaan custom. Tekan "Minta Penawaran" untuk perhitungan pasti.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            <button onClick={() => setActiveCat('all')} className={`px-4 py-2 rounded-full text-sm font-semibold transition ${activeCat === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Semua</button>
            {categories.map((c) => (
              <button key={c.id} onClick={() => setActiveCat(c.slug)} className={`px-4 py-2 rounded-full text-sm font-semibold transition ${activeCat === c.slug ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{c.name}</button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 reveal-stagger">
            {filteredProducts.map((p) => (
              <div key={p.id} className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 hover:shadow-xl transition-all duration-300 group">
                <div className="h-52 overflow-hidden bg-slate-200">
                  <img src={imageUrl(p.image_url)} alt={p.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="p-5">
                  {p.category_name && <span className="text-amber-600 text-xs font-bold uppercase tracking-wider">{p.category_name}</span>}
                  <h3 className="text-lg font-bold text-slate-800 mt-1 mb-2">{p.name}</h3>
                  <p className="text-slate-500 text-sm mb-4 line-clamp-2">{p.description}</p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-700">{p.price_label}</span>
                    <button onClick={() => scrollToSection('kontak')} className="text-xs bg-amber-500 text-white px-3 py-2 rounded-lg font-bold hover:bg-amber-600 transition whitespace-nowrap">Minta Penawaran</button>
                  </div>
                </div>
              </div>
            ))}
            {!filteredProducts.length && <p className="col-span-full text-center text-slate-400 py-10">Belum ada produk pada kategori ini.</p>}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500 rounded-full blur-[100px] opacity-20" />
        <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center gap-12 relative z-10">
          <div className="lg:w-1/2 reveal">
            <img src="https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=800" alt="Welder" className="rounded-2xl shadow-2xl border-4 border-slate-800" />
          </div>
          <div className="lg:w-1/2 reveal">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Mengapa Memilih <span className="text-amber-500">Bengkel Wijaya?</span></h2>
            <p className="text-slate-400 mb-8 leading-relaxed">Kami tidak hanya menyambung besi, tapi membangun keamanan dan estetika untuk hunian Anda. Dedikasi pada detail membedakan kami dari bengkel las biasa.</p>
            <div className="space-y-6">
              {[['Material Berkualitas', 'Hanya besi full (bukan banci) dan cat anti karat premium.'], ['Pengerjaan Tepat Waktu', 'Estimasi pengerjaan yang akurat, kami menghargai waktu Anda.'], ['Harga Transparan', 'Estimasi jelas di awal, tanpa biaya tersembunyi.']].map(([t, s], i) => (
                <div key={t} className="flex gap-4">
                  <div className="min-w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-amber-500 font-bold border border-slate-700">{i + 1}</div>
                  <div><h4 className="font-bold text-lg mb-1">{t}</h4><p className="text-sm text-slate-400">{s}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio */}
      <section id="portofolio" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 reveal">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Galeri Proyek</h2>
            <div className="w-20 h-1 bg-amber-500 mx-auto rounded-full mb-4" />
            <p className="text-slate-600">Beberapa hasil karya terbaik yang telah kami selesaikan.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 reveal-stagger">
            {portfolio.map((item) => (
              <div key={item.id} className="group relative overflow-hidden rounded-xl cursor-pointer shadow-md h-72">
                <img src={imageUrl(item.image_url)} alt={item.title} loading="lazy" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <span className="text-amber-400 text-sm font-semibold uppercase tracking-wider">{item.category}</span>
                  <h3 className="text-white text-xl font-bold">{item.title}</h3>
                  {item.description && <p className="text-slate-200 text-sm mt-1 hidden md:block">{item.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimoni" className="py-20 bg-slate-100">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 reveal">Apa Kata Mereka?</h2>
          {testimonials.length > 0 && (
            <div {...swipeHandlers} className="bg-white p-8 md:p-12 rounded-3xl shadow-xl relative cursor-grab active:cursor-grabbing reveal">
              <div className="text-amber-500 mb-6 flex justify-center gap-1">
                {Array.from({ length: testimonials[activeTestimonial]?.rating || 5 }).map((_, i) => <Star key={i} fill="currentColor" size={24} />)}
              </div>
              <div key={activeTestimonial} className="animate-fade-in">
                <p className="text-xl md:text-2xl text-slate-700 italic mb-8 font-light leading-relaxed select-none">"{testimonials[activeTestimonial]?.text}"</p>
                <h4 className="font-bold text-slate-900 text-lg">{testimonials[activeTestimonial]?.name}</h4>
                <span className="text-slate-500 text-sm">{testimonials[activeTestimonial]?.role}</span>
              </div>
              <div className="flex justify-center gap-3 mt-8">
                {testimonials.map((_, idx) => (
                  <button key={idx} onClick={() => setActiveTestimonial(idx)} className={`h-3 rounded-full transition-all duration-300 ${activeTestimonial === idx ? 'bg-amber-500 w-8' : 'bg-slate-300 w-3'}`} aria-label={`Testimoni ${idx + 1}`} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Contact */}
      <section id="kontak" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 reveal">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">Mulai Proyek Anda</h2>
            <p className="text-slate-500">Konsultasikan ide Anda, kami berikan estimasi terbaik.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 reveal-stagger">
            {[[<Phone size={24} />, 'WhatsApp / Telp', nomorDisplay], [<MapPin size={24} />, 'Lokasi Workshop', settings.address], [<Clock size={24} />, 'Jam Buka', settings.hours]].map(([ic, label, val], i) => (
              <div key={i} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl text-amber-500 shadow-sm">{ic}</div>
                <div><p className="text-xs text-slate-500 font-bold uppercase">{label}</p><p className="text-slate-900 font-bold text-sm">{val || '—'}</p></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 reveal">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Form Minta Penawaran</h3>
              {submitted ? (
                <div className="flex flex-col items-center justify-center text-center py-10">
                  <CheckCircle2 size={56} className="text-green-500 mb-4" />
                  <p className="font-bold text-slate-800 text-lg">Permintaan terkirim!</p>
                  <p className="text-slate-500 text-sm mt-1">Tim kami akan menghubungi Anda. Anda juga diarahkan ke WhatsApp kami.</p>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleKirim}>
                  <Field label="Nama"><input type="text" name="nama" value={form.nama} onChange={handleChange} required className={inputCls} placeholder="Nama Lengkap" /></Field>
                  <Field label="Nomor WA"><input type="tel" name="noWa" value={form.noWa} onChange={handleChange} required className={inputCls} placeholder="08xx-xxxx-xxxx" /></Field>
                  <Field label="Kebutuhan">
                    <select name="kebutuhan" value={form.kebutuhan} onChange={handleChange} className={inputCls}>
                      {(categories.length ? categories.map((c) => c.name) : ['Pagar / Gerbang', 'Kanopi', 'Konstruksi Baja', 'Teralis / Railing']).map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </Field>
                  <Field label="Detail"><textarea name="detail" value={form.detail} onChange={handleChange} rows="4" className={inputCls} placeholder="Ceritakan ukuran atau model yang diinginkan…" /></Field>
                  <button type="submit" disabled={submitting} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-amber-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                    <Send size={18} /> {submitting ? 'Mengirim…' : 'Kirim Permintaan'}
                  </button>
                </form>
              )}
            </div>
            <div className="lg:col-span-7 h-[500px] lg:h-auto rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100 relative group reveal">
              {settings.maps_embed ? (
                <iframe src={settings.maps_embed} className="w-full h-full" style={{ border: 0 }} allowFullScreen loading="lazy" title="Lokasi Bengkel" />
              ) : <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">Peta lokasi</div>}
              <div className="absolute bottom-6 left-6 right-6 md:right-auto bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg flex items-center justify-between gap-4">
                <div><p className="text-xs font-bold text-amber-500 uppercase tracking-wider">Navigasi</p><p className="text-slate-900 font-bold text-sm">Bengkel Wijaya Konstruksi</p></div>
                <a href={settings.maps_link || '#'} target="_blank" rel="noreferrer" className="bg-amber-500 text-white p-3 rounded-xl hover:bg-amber-600 transition-colors"><Navigation size={20} /></a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-900">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
            <div className="flex items-center gap-2">
              <div className="bg-slate-800 p-2 rounded-lg"><img src="/LogoBengkelWeb.webp" className="w-10 h-10" onError={(e) => (e.target.style.display = 'none')} /></div>
              <span className="text-2xl font-bold text-white">BENGKEL <span className="text-amber-500">WIJAYA</span></span>
            </div>
            <div className="flex gap-4">
              {[Instagram, Facebook, MessageCircle].map((Icon, i) => (
                <a key={i} href="#" className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all"><Icon size={20} /></a>
              ))}
            </div>
          </div>
          <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>© {new Date().getFullYear()} Bengkel Wijaya Konstruksi. All rights reserved.</p>
            <a href="/admin" className="hover:text-white transition-colors">Dashboard Admin</a>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp */}
      {nomor && (
        <a href={`https://wa.me/${nomor}`} target="_blank" rel="noreferrer" className="fixed bottom-8 right-6 md:right-8 bg-[#25D366] text-white p-4 rounded-full shadow-2xl z-50 hover:scale-110 transition-transform">
          <MessageCircle size={28} />
        </a>
      )}

      <Chatbot />
    </div>
  );
}

const inputCls = 'w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all';
function Field({ label, children }) {
  return <div className="space-y-1"><label className="text-sm font-semibold text-slate-700 ml-1">{label}</label>{children}</div>;
}
