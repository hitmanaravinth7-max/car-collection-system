import React, { useState, useEffect, useMemo } from 'react';
import { 
  Car, 
  Plus, 
  Search, 
  LayoutGrid, 
  Table as TableIcon, 
  Trash2, 
  Edit3, 
  Eye, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ArrowRight, 
  Sparkles, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  LogOut, 
  User, 
  Gauge, 
  Zap, 
  RotateCcw,
  RefreshCw,
  ChevronRight,
  Menu,
  Upload,
  Crown
} from 'lucide-react';
import { INITIAL_CARS, PRESET_IMAGE_OPTIONS } from './data/sampleCars';

export default function App() {
  // Navigation & Route State
  const [currentRoute, setCurrentRoute] = useState(() => {
    const path = window.location.pathname.replace(/^\//, '').toLowerCase();
    if (!path || path === 'home') return 'home';
    if (['dashboard', 'cars', 'add', 'contact', 'login'].includes(path)) return path;
    return path;
  });

  // Persistent Cars State
  const [cars, setCars] = useState(() => {
    try {
      const saved = localStorage.getItem('car_collection_data');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load cars from storage:', e);
    }
    return INITIAL_CARS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('car_collection_data', JSON.stringify(cars));
    } catch (e) {
      console.error('Failed to persist cars:', e);
    }
  }, [cars]);

  // Persistent User Session
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('car_collection_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load user:', e);
    }
    return { name: 'Alexander Vance', email: 'director@prestigecars.com', role: 'Collection Director' };
  });

  // Active Modals & Selected Car
  const [selectedCar, setSelectedCar] = useState(null);
  const [editingCar, setEditingCar] = useState(null);
  const [carToDelete, setCarToDelete] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedFuel, setSelectedFuel] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortOption, setSortOption] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Sync navigation with browser history
  const navigateTo = (route) => {
    setCurrentRoute(route);
    setMobileMenuOpen(false);
    window.history.pushState({}, '', route === 'home' ? '/' : `/${route}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const onPopState = () => {
      const path = window.location.pathname.replace(/^\//, '').toLowerCase();
      setCurrentRoute(path || 'home');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const showToast = (msg, isError = false) => {
    setToastMessage({ text: msg, isError });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filtered & Sorted Cars
  const filteredCars = useMemo(() => {
    return cars.filter(car => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        car.brand.toLowerCase().includes(q) ||
        car.model.toLowerCase().includes(q) ||
        (car.name && car.name.toLowerCase().includes(q)) ||
        car.registrationNumber.toLowerCase().includes(q) ||
        car.color.toLowerCase().includes(q);

      const matchesBrand = selectedBrand === 'All' || car.brand === selectedBrand;
      const matchesFuel = selectedFuel === 'All' || car.fuelType === selectedFuel;
      const matchesStatus = selectedStatus === 'All' || car.status === selectedStatus;

      return matchesSearch && matchesBrand && matchesFuel && matchesStatus;
    }).sort((a, b) => {
      if (sortOption === 'price-low') return a.price - b.price;
      if (sortOption === 'price-high') return b.price - a.price;
      if (sortOption === 'year-new') return b.year - a.year;
      if (sortOption === 'year-old') return a.year - b.year;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
  }, [cars, searchQuery, selectedBrand, selectedFuel, selectedStatus, sortOption]);

  // Statistics
  const stats = useMemo(() => {
    const total = cars.length;
    const available = cars.filter(c => c.status === 'Available').length;
    const sold = cars.filter(c => c.status === 'Sold').length;
    const reserved = cars.filter(c => c.status === 'Reserved').length;
    const maintenance = cars.filter(c => c.status === 'In Maintenance').length;
    const totalVal = cars.reduce((acc, c) => acc + (Number(c.price) || 0), 0);

    const fuels = {
      Petrol: cars.filter(c => c.fuelType === 'Petrol').length,
      Electric: cars.filter(c => c.fuelType === 'Electric').length,
      Hybrid: cars.filter(c => c.fuelType === 'Hybrid').length,
      Diesel: cars.filter(c => c.fuelType === 'Diesel').length,
    };

    return { total, available, sold, reserved, maintenance, totalVal, fuels };
  }, [cars]);

  const brandsList = useMemo(() => {
    return ['All', ...new Set(cars.map(c => c.brand))];
  }, [cars]);

  // CRUD Handlers
  const handleSaveCar = (carData) => {
    try {
      if (editingCar) {
        setCars(prev => prev.map(c => c.id === editingCar.id ? { ...c, ...carData } : c));
        showToast(`Updated ${carData.brand} ${carData.model} successfully.`);
        setEditingCar(null);
      } else {
        const newCar = {
          ...carData,
          id: `CAR-${Math.floor(100 + Math.random() * 900)}`,
          createdAt: Date.now()
        };
        setCars(prev => [newCar, ...prev]);
        showToast(`Saved vehicle: ${newCar.brand} ${newCar.model} added to fleet!`);
        navigateTo('cars');
      }
    } catch (err) {
      showToast('Failed to save vehicle. Please check input values.', true);
    }
  };

  const handleDeleteCar = (id) => {
    try {
      setCars(prev => prev.filter(c => c.id !== id));
      setCarToDelete(null);
      if (selectedCar?.id === id) setSelectedCar(null);
      showToast('Vehicle removed from collection.');
    } catch (err) {
      showToast('Error deleting vehicle record.', true);
    }
  };

  const handleUpdateStatus = (id, newStatus) => {
    setCars(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    if (selectedCar?.id === id) {
      setSelectedCar(prev => ({ ...prev, status: newStatus }));
    }
    showToast(`Status updated to ${newStatus}.`);
  };

  const handleResetData = () => {
    setCars(INITIAL_CARS);
    localStorage.removeItem('car_collection_data');
    showToast('Showroom reset to pristine showcase fleet.');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070D19] text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border text-sm font-semibold transition-all ${
          toastMessage.isError 
            ? 'bg-red-950 text-red-200 border-red-700' 
            : 'bg-[#101B33] text-[#F3C952] border-[#D4AF37]/50 shadow-gold'
        }`}>
          {toastMessage.isError ? <AlertCircle size={20} className="text-red-400" /> : <CheckCircle2 size={20} className="text-[#D4AF37]" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Header / Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#0B1325]/95 backdrop-blur-md border-b border-[#1C2C4E]">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          {/* Logo & Prestige Badge */}
          <div 
            onClick={() => navigateTo('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#E1BE53] to-[#B8860B] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20 group-hover:scale-105 transition-transform">
              <Crown className="text-[#070D19]" size={22} />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg tracking-wider text-white block leading-tight font-display">
                CAR COLLECTION SYSTEM
              </span>
              <span className="text-[11px] text-[#D4AF37] font-semibold tracking-widest block uppercase">
                Prestige Dealership
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-[#0F1A32] p-1.5 rounded-xl border border-[#223766]">
            {[
              { id: 'home', label: 'Home' },
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'cars', label: 'View Cars' },
              { id: 'add', label: 'Add Car' },
              { id: 'contact', label: 'Contact' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => navigateTo(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  currentRoute === tab.id 
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#070D19] font-bold shadow-md' 
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* User Profile / Quick Login */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-[#1F325C]">
                <div className="text-right">
                  <div className="text-sm font-bold text-white">{user.name}</div>
                  <div className="text-xs text-[#D4AF37] font-medium">{user.role}</div>
                </div>
                <button
                  onClick={() => setShowLoginModal(true)}
                  title="Switch User / Account"
                  className="w-10 h-10 rounded-xl bg-[#142242] hover:border-[#D4AF37] border border-[#233760] flex items-center justify-center text-[#D4AF37] transition-all"
                >
                  <User size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="btn-gold"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0B1325] border-b border-[#1C2C4E] px-4 py-4 space-y-2">
            {[
              { id: 'home', label: 'Home' },
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'cars', label: 'View Cars' },
              { id: 'add', label: 'Add New Car' },
              { id: 'contact', label: 'Contact Showroom' },
              { id: 'login', label: 'Staff Login' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => navigateTo(tab.id)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold ${
                  currentRoute === tab.id ? 'bg-[#D4AF37] text-[#070D19] font-bold' : 'text-slate-300 hover:bg-[#142242]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Main Body Routing */}
      <main className="flex-1">
        {currentRoute === 'home' && (
          <HomePage 
            stats={stats} 
            cars={cars} 
            onNavigate={navigateTo} 
            onSelectCar={setSelectedCar} 
          />
        )}

        {currentRoute === 'dashboard' && (
          <DashboardPage 
            stats={stats} 
            cars={cars} 
            onNavigate={navigateTo} 
            onSelectCar={setSelectedCar}
            onResetData={handleResetData}
          />
        )}

        {currentRoute === 'cars' && (
          <CarsListPage 
            cars={filteredCars}
            totalCount={cars.length}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedBrand={selectedBrand}
            setSelectedBrand={setSelectedBrand}
            selectedFuel={selectedFuel}
            setSelectedFuel={setSelectedFuel}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            sortOption={sortOption}
            setSortOption={setSortOption}
            viewMode={viewMode}
            setViewMode={setViewMode}
            brandsList={brandsList}
            onSelectCar={setSelectedCar}
            onEditCar={(car) => setEditingCar(car)}
            onDeleteCar={(car) => setCarToDelete(car)}
            onNavigate={navigateTo}
          />
        )}

        {currentRoute === 'add' && (
          <CarFormPage 
            onSave={handleSaveCar} 
            onCancel={() => navigateTo('cars')} 
          />
        )}

        {currentRoute === 'contact' && (
          <ContactPage showToast={showToast} />
        )}

        {currentRoute === 'login' && (
          <LoginPage 
            user={user} 
            setUser={setUser} 
            onSuccess={() => navigateTo('dashboard')} 
          />
        )}

        {/* 404 Route Handler */}
        {!['home', 'dashboard', 'cars', 'add', 'contact', 'login'].includes(currentRoute) && (
          <NotFoundPage onHome={() => navigateTo('home')} currentRoute={currentRoute} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#050A14] border-t border-[#1C2C4E] py-12 text-slate-400 text-sm">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E1BE53] to-[#B8860B] flex items-center justify-center text-[#070D19]">
              <Crown size={16} />
            </div>
            <div>
              <span className="font-bold text-white tracking-wider block">CAR COLLECTION SYSTEM</span>
              <span className="text-[10px] text-[#D4AF37] font-semibold tracking-widest block uppercase">Prestige Dealership</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 text-xs text-slate-300">
            <button onClick={() => navigateTo('home')} className="hover:text-[#D4AF37] transition-colors">Home</button>
            <button onClick={() => navigateTo('dashboard')} className="hover:text-[#D4AF37] transition-colors">Dashboard</button>
            <button onClick={() => navigateTo('cars')} className="hover:text-[#D4AF37] transition-colors">View Cars</button>
            <button onClick={() => navigateTo('add')} className="hover:text-[#D4AF37] transition-colors">Add Car</button>
            <button onClick={() => navigateTo('contact')} className="hover:text-[#D4AF37] transition-colors">Contact</button>
            <button onClick={handleResetData} className="hover:text-[#D4AF37] transition-colors">Reset Fleet</button>
          </div>

          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Car Collection System – Prestige Dealership.
          </p>
        </div>
      </footer>

      {/* Car Details Modal */}
      {selectedCar && (
        <CarDetailsModal 
          car={selectedCar} 
          onClose={() => setSelectedCar(null)}
          onEdit={() => { setEditingCar(selectedCar); setSelectedCar(null); }}
          onDelete={() => { setCarToDelete(selectedCar); setSelectedCar(null); }}
          onStatusChange={(status) => handleUpdateStatus(selectedCar.id, status)}
        />
      )}

      {/* Edit Car Modal */}
      {editingCar && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0B1325] border border-[#D4AF37]/40 rounded-2xl max-w-2xl w-full p-6 my-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-[#1C2C4E] pb-4">
              <h3 className="text-xl font-bold text-white font-display">Edit Vehicle Details</h3>
              <button onClick={() => setEditingCar(null)} className="text-slate-400 hover:text-white">
                <X size={22} />
              </button>
            </div>
            <CarForm 
              initialData={editingCar}
              onSave={handleSaveCar}
              onCancel={() => setEditingCar(null)}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {carToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B1325] border border-red-500/40 rounded-2xl max-w-md w-full p-6 text-center shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Remove Vehicle?</h3>
            <p className="text-slate-300 text-sm mb-6">
              Are you sure you want to delete <strong className="text-white">{carToDelete.brand} {carToDelete.model}</strong> ({carToDelete.registrationNumber}) from your collection?
            </p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setCarToDelete(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDeleteCar(carToDelete.id)}
                className="btn-danger"
              >
                Yes, Remove Vehicle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login / User Modal */}
      {showLoginModal && (
        <UserModal 
          user={user}
          setUser={setUser}
          onClose={() => setShowLoginModal(false)}
          showToast={showToast}
        />
      )}
    </div>
  );
}

// -------------------------------------------------------------
// PAGE: Home / Showcase Landing
// -------------------------------------------------------------
function HomePage({ stats, cars, onNavigate, onSelectCar }) {
  const featuredCars = cars.slice(0, 3);

  return (
    <div>
      {/* Luxury Hero Banner */}
      <section className="relative overflow-hidden pt-16 pb-24 border-b border-[#1C2C4E]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#142242]/40 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-bold tracking-wider uppercase mb-6">
              <Crown size={14} /> Prestige Automotive Dealership & Private Fleet
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6 font-display">
              Curate, Manage & Showcase Prestige Automobiles.
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed mb-8">
              A comprehensive system designed for tracking vehicle acquisition, readiness telemetry, provenance, valuation accounting, and client showroom inquiries.
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => onNavigate('cars')} className="btn-gold text-base px-7 py-3.5">
                Browse Entire Fleet ({stats.total}) <ArrowRight size={18} />
              </button>
              <button onClick={() => onNavigate('dashboard')} className="btn-secondary text-base px-7 py-3.5">
                Showroom Dashboard
              </button>
            </div>
          </div>

          {/* 4 Quick Stat Counters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
            <div className="bg-[#0D162B] border border-[#223766] rounded-2xl p-5 shadow-lg">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Total Fleet</div>
              <div className="text-3xl font-extrabold text-white">{stats.total}</div>
              <div className="text-xs text-[#D4AF37] mt-1 font-medium">Active in database</div>
            </div>
            <div className="bg-[#0D162B] border border-[#223766] rounded-2xl p-5 shadow-lg">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Available Units</div>
              <div className="text-3xl font-extrabold text-emerald-400">{stats.available}</div>
              <div className="text-xs text-emerald-500 mt-1 font-medium">Ready for delivery</div>
            </div>
            <div className="bg-[#0D162B] border border-[#223766] rounded-2xl p-5 shadow-lg">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Sold Units</div>
              <div className="text-3xl font-extrabold text-red-400">{stats.sold}</div>
              <div className="text-xs text-red-400 mt-1 font-medium">Closed acquisitions</div>
            </div>
            <div className="bg-[#0D162B] border border-[#223766] rounded-2xl p-5 shadow-lg">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Total Valuation</div>
              <div className="text-3xl font-extrabold text-[#F3C952]">
                ${(stats.totalVal / 1000000).toFixed(2)}M
              </div>
              <div className="text-xs text-amber-400 mt-1 font-medium">Calculated fleet asset</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Fleet Section */}
      <section className="py-20 bg-[#070D19]">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <span className="text-xs text-[#D4AF37] font-bold uppercase tracking-wider">Spotlight</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-display">Featured Supercars</h2>
            </div>
            <button 
              onClick={() => onNavigate('cars')} 
              className="text-sm font-semibold text-[#D4AF37] hover:text-[#FFE28A] flex items-center gap-1.5 transition-colors"
            >
              View all inventory ({cars.length}) <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredCars.map(car => (
              <CarCard key={car.id} car={car} onSelect={() => onSelectCar(car)} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// -------------------------------------------------------------
// PAGE: Dashboard
// -------------------------------------------------------------
function DashboardPage({ stats, cars, onNavigate, onSelectCar, onResetData }) {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest">Live Operations</span>
          <h1 className="text-3xl font-extrabold text-white font-display">Dealership Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Real-time inventory statistics and telemetry</p>
        </div>

        <div className="flex gap-3">
          <button onClick={() => onNavigate('add')} className="btn-gold">
            <Plus size={18} /> Add New Car
          </button>
          <button onClick={onResetData} className="btn-secondary" title="Restore factory fleet">
            <RotateCcw size={16} /> Reset Demo Fleet
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <div className="luxury-card p-6">
          <div className="flex justify-between items-start mb-4">
            <span className="text-slate-400 text-sm font-medium">Total Vehicles</span>
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center">
              <Car size={20} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">{stats.total}</div>
          <p className="text-xs text-[#D4AF37] mt-2 font-medium">100% accounted for in database</p>
        </div>

        <div className="luxury-card p-6">
          <div className="flex justify-between items-start mb-4">
            <span className="text-slate-400 text-sm font-medium">Available Units</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">{stats.available}</div>
          <p className="text-xs text-emerald-400 mt-2 font-medium">Ready for client delivery</p>
        </div>

        <div className="luxury-card p-6">
          <div className="flex justify-between items-start mb-4">
            <span className="text-slate-400 text-sm font-medium">Sold Units</span>
            <div className="w-10 h-10 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">{stats.sold}</div>
          <p className="text-xs text-red-400 mt-2 font-medium">Completed acquisitions</p>
        </div>

        <div className="luxury-card p-6">
          <div className="flex justify-between items-start mb-4">
            <span className="text-slate-400 text-sm font-medium">Total Valuation</span>
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 text-[#F3C952] flex items-center justify-center">
              <Gauge size={20} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#F3C952]">
            ${stats.totalVal.toLocaleString()}
          </div>
          <p className="text-xs text-slate-400 mt-2 font-medium">Average ${(stats.totalVal / (stats.total || 1)).toFixed(0).toLocaleString()} per unit</p>
        </div>
      </div>

      {/* Analytics Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Status Breakdown */}
        <div className="bg-[#0D162B] border border-[#223766] rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-1 font-display">Inventory Status Readiness</h3>
          <p className="text-slate-400 text-xs mb-6">Breakdown across availability lifecycle</p>

          <div className="space-y-4">
            {[
              { label: 'Available', count: stats.available, color: 'bg-emerald-500', text: 'text-emerald-400' },
              { label: 'Sold', count: stats.sold, color: 'bg-red-500', text: 'text-red-400' },
              { label: 'Reserved', count: stats.reserved, color: 'bg-amber-500', text: 'text-amber-400' },
              { label: 'In Maintenance', count: stats.maintenance, color: 'bg-purple-500', text: 'text-purple-400' },
            ].map(item => {
              const pct = stats.total > 0 ? (item.count / stats.total) * 100 : 0;
              return (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1.5 font-medium">
                    <span className="text-slate-300">{item.label}</span>
                    <span className={item.text}>{item.count} units ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#070D19] rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.color} transition-all duration-500 rounded-full`} 
                      style={{ width: `${pct}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Powertrain Breakdown */}
        <div className="bg-[#0D162B] border border-[#223766] rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-1 font-display">Powertrain & Fuel Systems</h3>
          <p className="text-slate-400 text-xs mb-6">Propulsion type classifications</p>

          <div className="space-y-4">
            {[
              { label: 'Electric (EV)', count: stats.fuels.Electric, color: 'bg-cyan-500', text: 'text-cyan-400' },
              { label: 'Hybrid Plug-In', count: stats.fuels.Hybrid, color: 'bg-emerald-500', text: 'text-emerald-400' },
              { label: 'Petrol (V6 / V8 / V12)', count: stats.fuels.Petrol, color: 'bg-amber-500', text: 'text-amber-400' },
              { label: 'Diesel', count: stats.fuels.Diesel, color: 'bg-indigo-500', text: 'text-indigo-400' },
            ].map(item => {
              const pct = stats.total > 0 ? (item.count / stats.total) * 100 : 0;
              return (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1.5 font-medium">
                    <span className="text-slate-300">{item.label}</span>
                    <span className={item.text}>{item.count} units ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#070D19] rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.color} transition-all duration-500 rounded-full`} 
                      style={{ width: `${pct}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recently Added Vehicles */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white font-display">Recently Added Vehicles</h3>
          <button 
            onClick={() => onNavigate('cars')} 
            className="text-sm font-semibold text-[#D4AF37] hover:text-[#FFE28A]"
          >
            View all inventory →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cars.slice(0, 3).map(car => (
            <CarCard key={car.id} car={car} onSelect={() => onSelectCar(car)} />
          ))}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// PAGE: View Cars (Inventory)
// -------------------------------------------------------------
function CarsListPage({
  cars,
  totalCount,
  searchQuery,
  setSearchQuery,
  selectedBrand,
  setSelectedBrand,
  selectedFuel,
  setSelectedFuel,
  selectedStatus,
  setSelectedStatus,
  sortOption,
  setSortOption,
  viewMode,
  setViewMode,
  brandsList,
  onSelectCar,
  onEditCar,
  onDeleteCar,
  onNavigate
}) {
  return (
    <div className="container mx-auto px-4 py-10">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest">Fleet Telemetry</span>
          <h1 className="text-3xl font-extrabold text-white font-display">Vehicle Inventory ({cars.length} of {totalCount})</h1>
          <p className="text-slate-400 text-sm mt-1">Search, filter, and manage dealership showroom units</p>
        </div>

        <button onClick={() => onNavigate('add')} className="btn-gold">
          <Plus size={18} /> Add New Car
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#0D162B] border border-[#223766] rounded-2xl p-5 mb-8 space-y-4 shadow-xl">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by brand, model, registration, or color..."
            className="form-input pl-11"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#1C2C4E]">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="bg-[#09101F] text-slate-200 text-xs font-medium border border-[#223766] rounded-lg px-3 py-2 outline-none"
            >
              <option value="All">All Brands</option>
              {brandsList.filter(b => b !== 'All').map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>

            <select
              value={selectedFuel}
              onChange={(e) => setSelectedFuel(e.target.value)}
              className="bg-[#09101F] text-slate-200 text-xs font-medium border border-[#223766] rounded-lg px-3 py-2 outline-none"
            >
              <option value="All">All Fuel Types</option>
              <option value="Petrol">Petrol</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Diesel">Diesel</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-[#09101F] text-slate-200 text-xs font-medium border border-[#223766] rounded-lg px-3 py-2 outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Sold">Sold</option>
              <option value="Reserved">Reserved</option>
              <option value="In Maintenance">In Maintenance</option>
            </select>

            {(selectedBrand !== 'All' || selectedFuel !== 'All' || selectedStatus !== 'All' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedBrand('All');
                  setSelectedFuel('All');
                  setSelectedStatus('All');
                  setSearchQuery('');
                }}
                className="text-xs text-[#D4AF37] hover:underline font-semibold"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Sort & View Mode */}
          <div className="flex items-center gap-3">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="bg-[#09101F] text-slate-200 text-xs font-medium border border-[#223766] rounded-lg px-3 py-2 outline-none"
            >
              <option value="newest">Sort: Date Added</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="year-new">Year: Newest First</option>
              <option value="year-old">Year: Oldest First</option>
            </select>

            <div className="flex bg-[#09101F] border border-[#223766] rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-[#D4AF37] text-[#070D19]' : 'text-slate-400'}`}
                title="Grid Cards"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-[#D4AF37] text-[#070D19]' : 'text-slate-400'}`}
                title="Table View"
              >
                <TableIcon size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cards or Table */}
      {cars.length === 0 ? (
        <div className="bg-[#0D162B] border border-[#223766] rounded-2xl p-16 text-center">
          <Car size={56} className="text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Vehicles Found</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
            Adjust your search parameters or reset your filters to browse the entire fleet.
          </p>
          <button 
            onClick={() => {
              setSelectedBrand('All');
              setSelectedFuel('All');
              setSelectedStatus('All');
              setSearchQuery('');
            }}
            className="btn-gold"
          >
            Clear All Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map(car => (
            <CarCard 
              key={car.id} 
              car={car} 
              onSelect={() => onSelectCar(car)}
              onEdit={() => onEditCar(car)}
              onDelete={() => onDeleteCar(car)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-[#0D162B] border border-[#223766] rounded-2xl overflow-x-auto shadow-xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#070D19] text-slate-400 text-xs uppercase font-semibold border-b border-[#223766]">
              <tr>
                <th className="py-4 px-5">Vehicle</th>
                <th className="py-4 px-5">Year</th>
                <th className="py-4 px-5">Fuel / Trans</th>
                <th className="py-4 px-5">Registration</th>
                <th className="py-4 px-5">Price</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C2C4E]">
              {cars.map(car => (
                <tr key={car.id} className="hover:bg-[#142242] transition-colors">
                  <td className="py-4 px-5 flex items-center gap-3">
                    <img 
                      src={car.imageUrl} 
                      alt={car.name || car.model} 
                      className="w-12 h-9 rounded object-cover border border-[#223766]" 
                    />
                    <div>
                      <div className="font-bold text-white">{car.brand} {car.model}</div>
                      <div className="text-xs text-slate-400">{car.color}</div>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-slate-300 font-medium">{car.year}</td>
                  <td className="py-4 px-5 text-slate-300">
                    <div>{car.fuelType}</div>
                    <div className="text-xs text-slate-500">{car.transmission}</div>
                  </td>
                  <td className="py-4 px-5 font-mono text-xs text-[#D4AF37]">{car.registrationNumber}</td>
                  <td className="py-4 px-5 font-bold text-[#F3C952]">${car.price.toLocaleString()}</td>
                  <td className="py-4 px-5">
                    <StatusBadge status={car.status} />
                  </td>
                  <td className="py-4 px-5 text-right space-x-2">
                    <button 
                      onClick={() => onSelectCar(car)} 
                      className="p-1.5 text-slate-300 hover:text-[#D4AF37] hover:bg-[#1B2C54] rounded transition-colors"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      onClick={() => onEditCar(car)} 
                      className="p-1.5 text-slate-300 hover:text-amber-400 hover:bg-[#1B2C54] rounded transition-colors"
                      title="Edit"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button 
                      onClick={() => onDeleteCar(car)} 
                      className="p-1.5 text-slate-300 hover:text-red-400 hover:bg-[#1B2C54] rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// COMPONENT: Car Card
// -------------------------------------------------------------
function CarCard({ car, onSelect, onEdit, onDelete }) {
  return (
    <div className="luxury-card flex flex-col group">
      {/* Photo Container with fixed 220px aspect ratio and object-fit cover */}
      <div className="car-image-container cursor-pointer" onClick={onSelect}>
        <img 
          src={car.imageUrl} 
          alt={`${car.brand} ${car.model}`}
          loading="lazy"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80";
          }}
        />
        <div className="absolute top-3 left-3">
          <StatusBadge status={car.status} />
        </div>
        <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs font-bold text-white border border-white/10">
          {car.year}
        </div>
        <div className="absolute bottom-3 right-3 bg-black/85 backdrop-blur-sm border border-[#D4AF37]/50 px-3 py-1 rounded-lg text-sm font-extrabold text-[#F3C952]">
          ${car.price.toLocaleString()}
        </div>
      </div>

      {/* Body Info */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-1">
            {car.brand}
          </div>
          <h4 
            onClick={onSelect}
            className="text-lg font-bold text-white group-hover:text-[#F3C952] transition-colors cursor-pointer truncate font-display"
          >
            {car.model}
          </h4>

          {/* Specs Chips */}
          <div className="flex flex-wrap gap-2 mt-3 mb-4">
            <span className="px-2 py-0.5 rounded bg-[#070D19] text-slate-300 text-xs border border-[#1C2C4E]">
              {car.fuelType}
            </span>
            <span className="px-2 py-0.5 rounded bg-[#070D19] text-slate-300 text-xs border border-[#1C2C4E]">
              {car.transmission}
            </span>
            <span className="px-2 py-0.5 rounded bg-[#070D19] text-slate-300 text-xs border border-[#1C2C4E]">
              {car.mileage.toLocaleString()} mi
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-[#1C2C4E] flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-slate-300">{car.registrationNumber}</span>

          <div className="flex items-center gap-2">
            {onEdit && (
              <button 
                onClick={onEdit}
                className="p-1.5 hover:text-amber-400 hover:bg-[#142242] rounded transition-colors"
                title="Edit Car"
              >
                <Edit3 size={15} />
              </button>
            )}
            {onDelete && (
              <button 
                onClick={onDelete}
                className="p-1.5 hover:text-red-400 hover:bg-[#142242] rounded transition-colors"
                title="Delete Car"
              >
                <Trash2 size={15} />
              </button>
            )}
            <button 
              onClick={onSelect}
              className="text-[#D4AF37] hover:text-[#FFE28A] font-bold flex items-center gap-1"
            >
              Details <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// PAGE: Add New Vehicle to Fleet
// -------------------------------------------------------------
function CarFormPage({ onSave, onCancel }) {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-8">
        <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest">Fleet Expansion</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
          Add New Vehicle to Fleet
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Input complete vehicle specifications, high-definition imagery, and acquisition pricing
        </p>
      </div>

      <div className="bg-[#0D162B] border border-[#223766] rounded-2xl p-6 sm:p-8 shadow-2xl">
        <CarForm onSave={onSave} onCancel={onCancel} />
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// COMPONENT: Car Form (Save Vehicle, Reset, Cancel)
// -------------------------------------------------------------
function CarForm({ initialData = null, onSave, onCancel }) {
  const defaultState = {
    name: initialData?.name || initialData?.model || '',
    brand: initialData?.brand || '',
    model: initialData?.model || '',
    year: initialData?.year || new Date().getFullYear(),
    price: initialData?.price || '',
    mileage: initialData?.mileage || '',
    fuelType: initialData?.fuelType || 'Petrol',
    transmission: initialData?.transmission || 'Automatic',
    color: initialData?.color || 'Silver',
    status: initialData?.status || 'Available',
    registrationNumber: initialData?.registrationNumber || `PRESTIGE-${Math.floor(100 + Math.random() * 900)}`,
    imageUrl: initialData?.imageUrl || PRESET_IMAGE_OPTIONS[0].url,
    description: initialData?.description || ''
  };

  const [formData, setFormData] = useState(defaultState);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, imageUrl: event.target?.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      price: '',
      mileage: '',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      color: 'Silver',
      status: 'Available',
      registrationNumber: `PRESTIGE-${Math.floor(100 + Math.random() * 900)}`,
      imageUrl: PRESET_IMAGE_OPTIONS[0].url,
      description: ''
    });
    setErrors({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.brand.trim()) newErrors.brand = 'Vehicle brand is required';
    if (!formData.model.trim()) newErrors.model = 'Vehicle model is required';
    if (!formData.price || Number(formData.price) <= 0) newErrors.price = 'Valid price is required';
    if (!formData.year || Number(formData.year) < 1900 || Number(formData.year) > 2030) newErrors.year = 'Enter a valid year (1900-2030)';
    if (!formData.mileage || Number(formData.mileage) < 0) newErrors.mileage = 'Valid mileage is required';
    if (!formData.registrationNumber.trim()) newErrors.registrationNumber = 'Registration number is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      ...formData,
      name: formData.name.trim() || `${formData.brand} ${formData.model}`,
      year: Number(formData.year),
      price: Number(formData.price),
      mileage: Number(formData.mileage)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Vehicle Photo Preview: Fixed Aspect Ratio & Object-Fit Cover */}
      <div>
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
          Vehicle Photo Preview
        </label>
        
        {/* Fixed aspect ratio container (220px fixed height, object-fit: cover) */}
        <div className="w-full h-56 rounded-xl overflow-hidden bg-[#070D19] border border-[#223766] mb-3 relative shadow-inner">
          <img 
            src={formData.imageUrl} 
            alt="Vehicle Preview" 
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              e.target.src = PRESET_IMAGE_OPTIONS[0].url;
            }}
          />
        </div>

        {/* Preset Photo Selector & File Upload */}
        <div className="space-y-3">
          <div>
            <span className="text-xs text-slate-400 block mb-1.5 font-medium">Select from Curated HD Presets:</span>
            <div className="flex flex-wrap gap-2">
              {PRESET_IMAGE_OPTIONS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, imageUrl: preset.url }))}
                  className={`text-xs px-2.5 py-1 rounded-md border transition-all ${
                    formData.imageUrl === preset.url 
                      ? 'bg-[#D4AF37] border-[#FFE28A] text-[#070D19] font-bold' 
                      : 'bg-[#09101F] border-[#223766] text-slate-400 hover:text-white'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input 
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="Or paste custom image URL..."
              className="form-input text-xs"
            />

            <label className="btn-secondary text-xs cursor-pointer flex items-center justify-center gap-2">
              <Upload size={14} /> Upload Local Image
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload} 
                className="hidden" 
              />
            </label>
          </div>
        </div>
      </div>

      {/* Brand & Model */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
            Brand *
          </label>
          <input 
            type="text" 
            name="brand" 
            value={formData.brand} 
            onChange={handleChange} 
            placeholder="e.g. Porsche, Ferrari, Mercedes-AMG"
            className={`form-input ${errors.brand ? 'border-red-500' : ''}`}
          />
          {errors.brand && <span className="text-xs text-red-400 mt-1 block">{errors.brand}</span>}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
            Model *
          </label>
          <input 
            type="text" 
            name="model" 
            value={formData.model} 
            onChange={handleChange} 
            placeholder="e.g. 911 GT3 RS, 296 GTB"
            className={`form-input ${errors.model ? 'border-red-500' : ''}`}
          />
          {errors.model && <span className="text-xs text-red-400 mt-1 block">{errors.model}</span>}
        </div>
      </div>

      {/* Car Name & Year */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
            Car Title / Name
          </label>
          <input 
            type="text" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            placeholder="e.g. Porsche 911 GT3 RS Weissach"
            className="form-input"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
            Manufacturing Year *
          </label>
          <input 
            type="number" 
            name="year" 
            value={formData.year} 
            onChange={handleChange} 
            placeholder="2024"
            className={`form-input ${errors.year ? 'border-red-500' : ''}`}
          />
          {errors.year && <span className="text-xs text-red-400 mt-1 block">{errors.year}</span>}
        </div>
      </div>

      {/* Price & Mileage */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
            Price (USD $) *
          </label>
          <input 
            type="number" 
            name="price" 
            value={formData.price} 
            onChange={handleChange} 
            placeholder="e.g. 285000"
            className={`form-input ${errors.price ? 'border-red-500' : ''}`}
          />
          {errors.price && <span className="text-xs text-red-400 mt-1 block">{errors.price}</span>}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
            Mileage (miles) *
          </label>
          <input 
            type="number" 
            name="mileage" 
            value={formData.mileage} 
            onChange={handleChange} 
            placeholder="e.g. 1850"
            className={`form-input ${errors.mileage ? 'border-red-500' : ''}`}
          />
          {errors.mileage && <span className="text-xs text-red-400 mt-1 block">{errors.mileage}</span>}
        </div>
      </div>

      {/* Fuel Type, Transmission & Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
            Fuel Type
          </label>
          <select 
            name="fuelType" 
            value={formData.fuelType} 
            onChange={handleChange} 
            className="form-input"
          >
            <option value="Petrol">Petrol</option>
            <option value="Electric">Electric</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Diesel">Diesel</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
            Transmission
          </label>
          <select 
            name="transmission" 
            value={formData.transmission} 
            onChange={handleChange} 
            className="form-input"
          >
            <option value="Automatic">Automatic</option>
            <option value="Manual">Manual</option>
            <option value="Dual-Clutch">Dual-Clutch</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
            Status
          </label>
          <select 
            name="status" 
            value={formData.status} 
            onChange={handleChange} 
            className="form-input"
          >
            <option value="Available">Available</option>
            <option value="Sold">Sold</option>
            <option value="Reserved">Reserved</option>
            <option value="In Maintenance">In Maintenance</option>
          </select>
        </div>
      </div>

      {/* Color & Registration Number */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
            Exterior Color
          </label>
          <input 
            type="text" 
            name="color" 
            value={formData.color} 
            onChange={handleChange} 
            placeholder="e.g. Shark Blue, Rosso Corsa"
            className="form-input"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
            Registration Number *
          </label>
          <input 
            type="text" 
            name="registrationNumber" 
            value={formData.registrationNumber} 
            onChange={handleChange} 
            placeholder="e.g. GT3-992-RS"
            className={`form-input ${errors.registrationNumber ? 'border-red-500' : ''}`}
          />
          {errors.registrationNumber && <span className="text-xs text-red-400 mt-1 block">{errors.registrationNumber}</span>}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
          Vehicle Overview / Package Options
        </label>
        <textarea 
          name="description" 
          value={formData.description} 
          onChange={handleChange} 
          rows={3}
          placeholder="Add key features, aerodynamic packages, carbon ceramic brakes, or history notes..."
          className="form-input"
        />
      </div>

      {/* Buttons: Save Vehicle, Reset, Cancel */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#1C2C4E]">
        <button type="submit" className="btn-gold flex-1">
          Save Vehicle
        </button>

        <button type="button" onClick={handleReset} className="btn-reset">
          <RotateCcw size={16} /> Reset
        </button>

        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}

// -------------------------------------------------------------
// COMPONENT: Car Details Modal
// -------------------------------------------------------------
function CarDetailsModal({ car, onClose, onEdit, onDelete, onStatusChange }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0B1325] border border-[#D4AF37]/40 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl my-8">
        {/* Hero Image */}
        <div className="relative h-72 sm:h-80 bg-[#070D19]">
          <img 
            src={car.imageUrl} 
            alt={car.name} 
            className="w-full h-full object-cover" 
          />
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors"
          >
            <X size={20} />
          </button>
          <div className="absolute top-4 left-4">
            <StatusBadge status={car.status} />
          </div>
          <div className="absolute bottom-4 right-4 bg-black/85 px-4 py-2 rounded-xl text-xl font-extrabold text-[#F3C952] border border-[#D4AF37]/40">
            ${car.price.toLocaleString()}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1C2C4E] pb-5">
            <div>
              <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest">{car.brand}</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">{car.model}</h2>
              <span className="text-xs text-slate-400 font-mono">REG: {car.registrationNumber} • ID: {car.id}</span>
            </div>
          </div>

          {/* Quick Status Buttons */}
          <div className="bg-[#070D19] p-3.5 rounded-xl border border-[#1C2C4E] flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Status Lifecycle:</span>
            <div className="flex gap-2">
              <button 
                onClick={() => onStatusChange('Available')}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  car.status === 'Available' ? 'bg-emerald-600 text-white' : 'bg-[#142242] text-slate-300 hover:text-white'
                }`}
              >
                Available
              </button>
              <button 
                onClick={() => onStatusChange('Sold')}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  car.status === 'Sold' ? 'bg-red-600 text-white' : 'bg-[#142242] text-slate-300 hover:text-white'
                }`}
              >
                Mark Sold
              </button>
              <button 
                onClick={() => onStatusChange('Reserved')}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  car.status === 'Reserved' ? 'bg-amber-600 text-white' : 'bg-[#142242] text-slate-300 hover:text-white'
                }`}
              >
                Reserved
              </button>
            </div>
          </div>

          {/* Specifications Grid */}
          <div>
            <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-3">Specifications</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#09101F] p-3 rounded-xl border border-[#1C2C4E]">
                <div className="text-xs text-slate-400">Year</div>
                <div className="text-sm font-bold text-white mt-1">{car.year}</div>
              </div>
              <div className="bg-[#09101F] p-3 rounded-xl border border-[#1C2C4E]">
                <div className="text-xs text-slate-400">Mileage</div>
                <div className="text-sm font-bold text-white mt-1">{car.mileage.toLocaleString()} mi</div>
              </div>
              <div className="bg-[#09101F] p-3 rounded-xl border border-[#1C2C4E]">
                <div className="text-xs text-slate-400">Fuel Type</div>
                <div className="text-sm font-bold text-white mt-1">{car.fuelType}</div>
              </div>
              <div className="bg-[#09101F] p-3 rounded-xl border border-[#1C2C4E]">
                <div className="text-xs text-slate-400">Transmission</div>
                <div className="text-sm font-bold text-white mt-1">{car.transmission}</div>
              </div>
              <div className="bg-[#09101F] p-3 rounded-xl border border-[#1C2C4E]">
                <div className="text-xs text-slate-400">Color</div>
                <div className="text-sm font-bold text-white mt-1">{car.color}</div>
              </div>
              <div className="bg-[#09101F] p-3 rounded-xl border border-[#1C2C4E]">
                <div className="text-xs text-slate-400">Horsepower</div>
                <div className="text-sm font-bold text-white mt-1">{car.horsepower || 'N/A'} HP</div>
              </div>
            </div>
          </div>

          {/* Description */}
          {car.description && (
            <div>
              <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-2">Curator Overview</h4>
              <p className="text-slate-300 text-sm leading-relaxed bg-[#09101F] p-4 rounded-xl border border-[#1C2C4E]">
                {car.description}
              </p>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-4 border-t border-[#1C2C4E] flex justify-between gap-4">
            <button onClick={onDelete} className="btn-danger flex items-center gap-2">
              <Trash2 size={16} /> Delete Car
            </button>
            <div className="flex gap-3">
              <button onClick={onEdit} className="btn-secondary">
                <Edit3 size={16} /> Edit Details
              </button>
              <button onClick={onClose} className="btn-gold">
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// PAGE: Contact Showroom
// -------------------------------------------------------------
function ContactPage({ showToast }) {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    setSubmitted(true);
    showToast('Inquiry dispatched. Our concierge will contact you promptly.');
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest">Global Showroom Coordinates</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1 font-display">Contact Dealership Desk</h1>
        <p className="text-slate-400 text-sm max-w-md mx-auto mt-2">
          Connect with our private acquisitions concierge for vehicle viewings, private orders, and collection advisory.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Info */}
        <div className="bg-[#0D162B] border border-[#223766] rounded-2xl p-8 space-y-6 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-2 font-display">Showroom Coordinates</h3>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center shrink-0">
              <MapPin size={20} />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase">Showroom Address</div>
              <div className="text-sm text-white font-medium mt-0.5">100 Grand Prix Boulevard, Beverly Hills, CA 90210</div>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center shrink-0">
              <Phone size={20} />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase">Direct Concierge</div>
              <div className="text-sm text-white font-medium mt-0.5">+1 (800) 555-CARS • (800) 555-2277</div>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center shrink-0">
              <Mail size={20} />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase">Acquisitions Email</div>
              <div className="text-sm text-white font-medium mt-0.5">concierge@carcollectionsystem.com</div>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase">Operating Hours</div>
              <div className="text-sm text-white font-medium mt-0.5">Mon - Sat: 9:00 AM - 7:00 PM • Sunday by Appointment</div>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="bg-[#0D162B] border border-[#223766] rounded-2xl p-8 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4 font-display">Send Vehicle Inquiry</h3>

          {submitted ? (
            <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-xl p-6 text-center">
              <CheckCircle2 className="text-emerald-400 mx-auto mb-2" size={36} />
              <h4 className="text-lg font-bold text-white">Inquiry Dispatched!</h4>
              <p className="text-xs text-slate-300 mt-1">
                Thank you, {formData.name}. Our collection concierge will reply to {formData.email} within 2 business hours.
              </p>
              <button 
                onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', subject: '', message: '' }); }}
                className="btn-secondary text-xs mt-4"
              >
                Send Another Note
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Your Name *</label>
                <input 
                  type="text" 
                  required
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                  className="form-input" 
                  placeholder="e.g. Michael Thorne"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Email Address *</label>
                <input 
                  type="email" 
                  required
                  value={formData.email} 
                  onChange={e => setFormData({ ...formData, email: e.target.value })} 
                  className="form-input" 
                  placeholder="michael@luxuryauto.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Vehicle of Interest</label>
                <input 
                  type="text" 
                  value={formData.subject} 
                  onChange={e => setFormData({ ...formData, subject: e.target.value })} 
                  className="form-input" 
                  placeholder="e.g. Porsche 911 GT3 RS"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Inquiry Message</label>
                <textarea 
                  rows={3}
                  value={formData.message} 
                  onChange={e => setFormData({ ...formData, message: e.target.value })} 
                  className="form-input" 
                  placeholder="Tell us about your acquisition timeline or questions..."
                />
              </div>

              <button type="submit" className="btn-gold w-full">
                Dispatch Inquiry to Concierge
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// PAGE: Staff Login
// -------------------------------------------------------------
function LoginPage({ user, setUser, onSuccess }) {
  const [email, setEmail] = useState('director@prestigecars.com');
  const [password, setPassword] = useState('password123');

  const handleLogin = (e) => {
    e.preventDefault();
    setUser({
      name: email.includes('director') ? 'Alexander Vance' : 'Sarah Connor',
      email: email,
      role: email.includes('director') ? 'Collection Director' : 'Acquisitions Specialist'
    });
    onSuccess();
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <div className="bg-[#0D162B] border border-[#223766] rounded-2xl p-8 shadow-2xl text-center">
        <div className="w-14 h-14 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center mx-auto mb-4">
          <Crown size={28} />
        </div>
        <h2 className="text-2xl font-bold text-white font-display mb-1">Staff Portal</h2>
        <p className="text-xs text-slate-400 mb-6">Sign in to manage showroom inventory</p>

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              className="form-input"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              className="form-input"
            />
          </div>

          <button type="submit" className="btn-gold w-full mt-2">
            Sign In to Dealership
          </button>
        </form>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// COMPONENT: Status Badge Helper
// -------------------------------------------------------------
function StatusBadge({ status }) {
  const badgeClass = {
    'Available': 'badge-available',
    'Sold': 'badge-sold',
    'Reserved': 'badge-reserved',
    'In Maintenance': 'badge-maintenance'
  }[status] || 'badge-available';

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${badgeClass}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

// -------------------------------------------------------------
// MODAL: User Profile / Switch Account
// -------------------------------------------------------------
function UserModal({ user, setUser, onClose, showToast }) {
  const handleDemoDirector = () => {
    const newUser = { name: 'Alexander Vance', email: 'director@prestigecars.com', role: 'Collection Director' };
    setUser(newUser);
    try {
      localStorage.setItem('car_collection_user', JSON.stringify(newUser));
    } catch (e) {}
    showToast('Signed in as Alexander Vance (Director)');
    onClose();
  };

  const handleDemoStaff = () => {
    const newUser = { name: 'Sarah Connor', email: 'staff@prestigecars.com', role: 'Acquisitions Specialist' };
    setUser(newUser);
    try {
      localStorage.setItem('car_collection_user', JSON.stringify(newUser));
    } catch (e) {}
    showToast('Signed in as Sarah Connor (Specialist)');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0D162B] border border-[#223766] rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl">
        <div className="w-14 h-14 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center mx-auto mb-3">
          <User size={28} />
        </div>
        <h3 className="text-xl font-bold text-white mb-1 font-display">User Profile</h3>
        <p className="text-xs text-slate-400 mb-6">Switch between demo profiles or staff roles</p>

        <div className="space-y-3 mb-6">
          <button 
            onClick={handleDemoDirector}
            className="w-full py-3 px-4 rounded-xl bg-[#142242] hover:border-[#D4AF37] border border-[#223766] text-left transition-colors"
          >
            <div className="text-sm font-bold text-white">Alexander Vance</div>
            <div className="text-xs text-[#D4AF37]">Collection Director (Admin)</div>
          </button>

          <button 
            onClick={handleDemoStaff}
            className="w-full py-3 px-4 rounded-xl bg-[#142242] hover:border-[#D4AF37] border border-[#223766] text-left transition-colors"
          >
            <div className="text-sm font-bold text-white">Sarah Connor</div>
            <div className="text-xs text-[#D4AF37]">Acquisitions Specialist (Staff)</div>
          </button>
        </div>

        <button onClick={onClose} className="btn-secondary w-full">
          Close Window
        </button>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// PAGE: 404 Route Not Found
// -------------------------------------------------------------
function NotFoundPage({ onHome, currentRoute }) {
  return (
    <div className="container mx-auto px-4 py-24 text-center">
      <div className="w-20 h-20 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-6">
        <AlertCircle size={44} />
      </div>
      <h1 className="text-5xl font-extrabold text-white mb-3 font-display">404</h1>
      <h2 className="text-2xl font-bold text-white mb-3 font-display">Vehicle Route Not Found</h2>
      <p className="text-slate-400 text-sm max-w-md mx-auto mb-8">
        The path <code className="text-[#D4AF37] font-mono bg-[#142242] px-2 py-0.5 rounded">/{currentRoute}</code> is not a valid showroom route.
      </p>
      <button onClick={onHome} className="btn-gold px-7 py-3">
        Return to Showroom Home
      </button>
    </div>
  );
}
