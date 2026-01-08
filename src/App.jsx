import React, { useState, useEffect } from 'react';
import { 
  Hammer, 
  Flame, 
  ShieldCheck, 
  Phone, 
  MapPin, 
  Clock, 
  Menu, 
  X, 
  ChevronRight, 
  Star,
  Instagram,
  Facebook,
  MessageCircle,
  Navigation
} from 'lucide-react';

const App = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Efek scroll untuk navbar transparan ke solid
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const services = [
    {
      title: "Pagar Minimalis & Tempa",
      desc: "Desain pagar modern atau klasik dengan bahan besi hollow galvanis anti karat.",
      icon: <ShieldCheck className="w-8 h-8 text-orange-500" />
    },
    {
      title: "Kanopi & Atap",
      desc: "Pemasangan kanopi Alderon, Polycarbonate, atau Spandek Pasir yang rapi dan kokoh.",
      icon: <Hammer className="w-8 h-8 text-orange-500" />
    },
    {
      title: "Railing Tangga & Balkon",
      desc: "Keamanan maksimal dengan estetika tinggi untuk interior maupun eksterior rumah Anda.",
      icon: <ChevronRight className="w-8 h-8 text-orange-500" />
    },
    {
      title: "Konstruksi Baja Berat",
      desc: "Layanan konstruksi untuk gudang, pabrik, atau struktur bangunan bertingkat.",
      icon: <Flame className="w-8 h-8 text-orange-500" />
    }
  ];

  const portfolio = [
    { id: 1, title: "Pagar Industrial Modern", cat: "Pagar", img: "https://images.unsplash.com/photo-1599690925058-90e1a0b45279?auto=format&fit=crop&q=80&w=800" },
    { id: 2, title: "Kanopi Carport Luas", cat: "Kanopi", img: "https://images.unsplash.com/photo-1595846519845-68e298c2edd8?auto=format&fit=crop&q=80&w=800" },
    { id: 3, title: "Railing Tangga Besi Kayu", cat: "Interior", img: "https://images.unsplash.com/photo-1517646331032-9e85639523a1?auto=format&fit=crop&q=80&w=800" },
    { id: 4, title: "Konstruksi Gudang", cat: "Baja Berat", img: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=800" },
    { id: 5, title: "Teralis Jendela Klasik", cat: "Teralis", img: "https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80&w=800" },
    { id: 6, title: "Pintu Gerbang Lipat", cat: "Pagar", img: "https://images.unsplash.com/photo-1613545325278-f24b0cae1224?auto=format&fit=crop&q=80&w=800" }
  ];

  const testimonials = [
    { name: "Budi Santoso", role: "Pemilik Rumah", text: "Hasil las sangat rapi, pengerjaan cepat, dan harganya masuk akal. Kanopi Alderon saya jadi terlihat mewah." },
    { name: "Siti Aminah", role: "Developer Perumahan", text: "Sudah berlangganan untuk proyek perumahan cluster. Pagar minimalisnya presisi dan catnya awet." },
    { name: "Hendro Wijaya", role: "Manajer Gudang", text: "Konstruksi baja berat untuk gudang kami sangat kokoh. Tim Bengkel Wijaya bekerja sangat profesional." }
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* Navbar */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-slate-900 shadow-lg py-3' : 'bg-transparent py-5'}`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Flame className="w-8 h-8 text-orange-500" />
            <span className={`text-2xl font-bold tracking-tighter ${isScrolled ? 'text-white' : 'text-white'}`}>
              BENGKEL <span className="text-orange-500">WIJAYA</span>
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {['Beranda', 'Layanan', 'Portofolio', 'Testimoni'].map((item, idx) => (
              <button 
                key={idx}
                onClick={() => scrollToSection(item.toLowerCase())}
                className="text-white hover:text-orange-400 font-medium transition-colors"
              >
                {item}
              </button>
            ))}
            <button 
              onClick={() => scrollToSection('kontak')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-full font-bold transition-transform hover:scale-105"
            >
              Hubungi Kami
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-slate-900 absolute top-full left-0 w-full p-4 flex flex-col gap-4 shadow-xl border-t border-slate-800">
            {['Beranda', 'Layanan', 'Portofolio', 'Testimoni', 'Kontak'].map((item, idx) => (
              <button 
                key={idx}
                onClick={() => scrollToSection(item.toLowerCase())}
                className="text-white text-left py-2 hover:text-orange-500 border-b border-slate-800 last:border-0"
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="beranda" className="relative h-screen flex items-center justify-center bg-slate-900 overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute inset-0 z-0 opacity-40">
           <img 
            src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=1920" 
            alt="Welding Background" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent z-10"></div>
        
        <div className="container mx-auto px-4 relative z-20 text-center">
          <div className="inline-block bg-orange-500/20 text-orange-400 px-4 py-1 rounded-full text-sm font-semibold mb-6 border border-orange-500/30 backdrop-blur-sm animate-pulse">
            Bengkel Las Profesional & Bergaransi
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
            Konstruksi Logam <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-500">
              Kuat & Presisi
            </span>
          </h1>
          <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Melayani pembuatan pagar, kanopi, teralis, hingga konstruksi baja berat dengan material terbaik dan pengerjaan tepat waktu.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => scrollToSection('kontak')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50"
            >
              <MessageCircle size={20} />
              Konsultasi Gratis
            </button>
            <button 
              onClick={() => scrollToSection('portofolio')}
              className="bg-transparent border-2 border-white hover:bg-white hover:text-slate-900 text-white px-8 py-4 rounded-full font-bold text-lg transition-all"
            >
              Lihat Hasil Karya
            </button>
          </div>
        </div>
      </section>

      {/* Statistics Strip */}
      <div className="bg-orange-500 py-6 relative z-30">
        <div className="container mx-auto px-4 flex flex-wrap justify-around gap-6 text-white text-center">
          <div>
            <div className="text-3xl font-bold">10+</div>
            <div className="text-sm opacity-90">Tahun Pengalaman</div>
          </div>
          <div>
            <div className="text-3xl font-bold">500+</div>
            <div className="text-sm opacity-90">Proyek Selesai</div>
          </div>
          <div>
            <div className="text-3xl font-bold">100%</div>
            <div className="text-sm opacity-90">Garansi Kepuasan</div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <section id="layanan" className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Layanan Kami</h2>
            <div className="w-20 h-1 bg-orange-500 mx-auto rounded-full mb-4"></div>
            <p className="text-slate-600 max-w-xl mx-auto">Kami menyediakan solusi lengkap untuk kebutuhan besi dan baja properti Anda dengan standar kualitas tinggi.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 group hover:-translate-y-2">
                <div className="mb-6 p-4 bg-slate-100 rounded-xl inline-block group-hover:bg-orange-50 transition-colors">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-800">{service.title}</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {service.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500 rounded-full blur-[100px] opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-10"></div>
        
        <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center gap-12 relative z-10">
          <div className="lg:w-1/2">
             <img 
              src="https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=800" 
              alt="Welder at work" 
              className="rounded-2xl shadow-2xl border-4 border-slate-800"
            />
          </div>
          <div className="lg:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Mengapa Memilih <span className="text-orange-500">Bengkel Wijaya?</span></h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Kami tidak hanya menyambung besi, tapi kami membangun keamanan dan estetika untuk hunian Anda. Dedikasi kami terhadap detail membedakan kami dari bengkel las biasa.
            </p>

            <div className="space-y-6">
              {[
                { title: "Material Berkualitas", sub: "Hanya menggunakan besi full (bukan banci) dan cat anti karat premium." },
                { title: "Pengerjaan Tepat Waktu", sub: "Kami menghargai waktu Anda dengan estimasi pengerjaan yang akurat." },
                { title: "Harga Transparan", sub: "Rincian biaya jelas di awal, tanpa biaya tersembunyi." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="min-w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-orange-500 font-bold border border-slate-700">
                    {i+1}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                    <p className="text-sm text-slate-400">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portofolio" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Galeri Proyek</h2>
            <div className="w-20 h-1 bg-orange-500 mx-auto rounded-full mb-4"></div>
            <p className="text-slate-600">Beberapa hasil karya terbaik yang telah kami selesaikan.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolio.map((item) => (
              <div key={item.id} className="group relative overflow-hidden rounded-xl cursor-pointer shadow-md">
                <img 
                  src={item.img} 
                  alt={item.title} 
                  className="w-full h-72 object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <span className="text-orange-400 text-sm font-semibold uppercase tracking-wider">{item.cat}</span>
                  <h3 className="text-white text-xl font-bold">{item.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimoni" className="py-20 bg-slate-100">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-12">Apa Kata Mereka?</h2>
          
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl relative">
            <div className="text-orange-500 mb-6 flex justify-center gap-1">
              {[1,2,3,4,5].map(star => <Star key={star} fill="currentColor" size={24} />)}
            </div>
            <p className="text-xl md:text-2xl text-slate-700 italic mb-8 font-light leading-relaxed">
              "{testimonials[activeTestimonial].text}"
            </p>
            <div>
              <h4 className="font-bold text-slate-900 text-lg">{testimonials[activeTestimonial].name}</h4>
              <span className="text-slate-500 text-sm">{testimonials[activeTestimonial].role}</span>
            </div>

            {/* Testimonial Nav */}
            <div className="flex justify-center gap-3 mt-8">
              {testimonials.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveTestimonial(idx)}
                  className={`w-3 h-3 rounded-full transition-all ${activeTestimonial === idx ? 'bg-orange-500 w-8' : 'bg-slate-300'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="kontak" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            
            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl font-bold text-slate-900 mb-4">Mari Wujudkan <br/>Ide Anda</h2>
                <p className="text-slate-600 text-lg">
                  Konsultasikan kebutuhan Anda sekarang. Survei lokasi gratis untuk wilayah Jabodetabek.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-orange-100 rounded-lg text-orange-600">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Lokasi Bengkel</h4>
                    <p className="text-slate-600">Jl. Industri Raya No. 45, Kecamatan Sukamaju, Kota Besi.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-orange-100 rounded-lg text-orange-600">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Telepon / WhatsApp</h4>
                    <p className="text-slate-600">0812-3456-7890 (Admin)</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-orange-100 rounded-lg text-orange-600">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Jam Operasional</h4>
                    <p className="text-slate-600">Senin - Sabtu: 08.00 - 17.00 WIB</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="bg-slate-50 p-8 rounded-3xl shadow-lg border border-slate-100">
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                  <input type="text" className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all" placeholder="Nama Anda" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">No. WhatsApp</label>
                  <input type="tel" className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all" placeholder="08xx-xxxx-xxxx" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Kebutuhan</label>
                  <select className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all">
                    <option>Pagar Besi</option>
                    <option>Kanopi</option>
                    <option>Teralis & Railing</option>
                    <option>Konstruksi Baja</option>
                    <option>Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Pesan Tambahan</label>
                  <textarea rows="3" className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all" placeholder="Jelaskan detail ukuran atau model..."></textarea>
                </div>
                <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/30 transition-all hover:-translate-y-1">
                  Kirim Pesan
                </button>
              </form>
            </div>
          </div>

          {/* Map Section */}
          <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-200 h-[400px] relative w-full">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2355.605924108673!2d110.84246818049397!3d-6.8134276167226036!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e70c5d3afdf8d2b%3A0x15cbd851befe3108!2sBengkel%20Las%20Wijaya%20Konstruksi!5e0!3m2!1sen!2sid!4v1767910506237!5m2!1sen!2sid" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Lokasi Bengkel Bengkel Wijaya"
            ></iframe>
            
            {/* Map Overlay Card */}
            <div className="absolute bottom-6 left-6 bg-white p-4 rounded-xl shadow-lg max-w-xs border border-slate-100 hidden md:block">
               <div className="flex items-start gap-3">
                 <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                    <Navigation size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Bengkel Wijaya Workshop</h4>
                    <p className="text-xs text-slate-500 mt-1">Gunakan Google Maps untuk rute tercepat ke lokasi kami.</p>
                    <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="text-xs text-orange-500 font-bold mt-2 inline-block hover:underline">
                      Buka di Google Maps →
                    </a>
                  </div>
               </div>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-orange-500" />
            <span className="text-xl font-bold text-white">
              BENGKEL <span className="text-orange-500">WIJAYA</span>
            </span>
          </div>
          
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-white transition-colors">Tentang Kami</a>
            <a href="#" className="hover:text-white transition-colors">Syarat & Ketentuan</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          </div>

          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all"><Instagram size={20} /></a>
            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all"><Facebook size={20} /></a>
          </div>
        </div>
        <div className="text-center mt-8 text-sm opacity-50">
          © 2024 Bengkel Wijaya. All rights reserved.
        </div>
      </footer>

      {/* Floating WA Button */}
      <a 
        href="https://wa.me/" 
        target="_blank" 
        rel="noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg shadow-green-500/40 z-50 transition-transform hover:scale-110 flex items-center gap-2"
      >
        <MessageCircle size={24} />
        <span className="font-bold hidden md:inline">WhatsApp</span>
      </a>

    </div>
  );
};

export default App;