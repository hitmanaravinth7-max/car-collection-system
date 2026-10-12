import React, { useState, useEffect, useMemo } from 'react';
import { 
  Car, 
  Plus, 
  Search, 
  SlidersHorizontal, 
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
  Key, 
  Gauge, 
  Zap, 
  RefreshCw,
  ChevronRight,
  Menu
} from 'lucide-react';
import { INITIAL_CARS, PRESET_IMAGE_OPTIONS } from './data/sampleCars';

export default function App() {
  // Navigation & Route State
  const [currentRoute, setCurrentRoute] = useState(() => {
    const path = window.location.pathname.replace(/^\//, '').toLowerCase();
    if (!path || path === 'home') return 'home';
    if (['dashboard', 'cars', 'add', 'contact', 'login'].includes(path)) return path;
    return path; // May trigger 404 if not recognized
  });

  // Persistent Cars State
  const [cars, setCars] = useState(() => {
    const saved = localStorage.getItem('car_collection_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_CARS;
      }
    }
    return INITIAL_CARS;
  });

  useEffect(() => {
    localStorage.setItem('car_collection_data', JSON.stringify(cars));
  }, [cars]);

  // Persistent User Session
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('car_collection_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return { name: 'Alexander Vance', email: 'admin@carcollection.com', role: 'Collection Director' };
      }
    }
    return { name: 'Alexander Vance', email: 'admin@carcollection.com', role: 'Collection Director' };
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

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
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
      showToast(`Added ${newCar.brand} ${newCar.model} to collection.`);
      navigateTo('cars');
    }
  };

  const handleDeleteCar = (id) => {
    setCars(prev => prev.filter(c => c.id !== id));
    setCarToDelete(null);
    if (selectedCar?.id === id) setSelectedCar(null);
    showToast('Vehicle removed from collection.');
  };

  const handleUpdateStatus = (id, newStatus) => {
    setCars(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    if (selectedCar?.id === id) {
      setSelectedCar(prev => ({ ...prev, status: newStatus }));
    }
    showToast(`Status changed to ${newStatus}.`);
  };

  const handleResetData = () => {
    setCars(INITIAL_CARS);
    localStorage.removeItem('car_collection_data');
    showToast('Reset collection to initial showcase fleet.');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B1325] text-slate-100">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-blue-400 animate-bounce">
          <CheckCircle2 size={20} />
          <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Top Header / Navigation */}
      <header className="sticky top-0 z-40 bg-[#0F1A30]/90 backdrop-blur-md border-b border-[#233760]">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          {/* Logo */}
          <div 
            onClick={() => navigateTo('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
              <Car className="text-white" size={24} />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-wider text-white block leading-tight">
                CAR COLLECTION
              </span>
              <span className="text-xs text-blue-400 font-semibold tracking-widest block">
                PRESTIGE DEALERSHIP
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#142342] p-1.5 rounded-xl border border-[#233760]">
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
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Right Action & User Profile */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-[#233760]">
                <div className="text-right">
                  <div className="text-sm font-bold text-white">{user.name}</div>
                  <div className="text-xs text-blue-400">{user.role}</div>
                </div>
                <button
                  onClick={() => setShowLoginModal(true)}
                  title="Switch User / Settings"
                  className="w-10 h-10 rounded-xl bg-[#1C2C4E] hover:bg-blue-600/20 border border-[#2B406B] flex items-center justify-center text-blue-400 transition-colors"
                >
                  <User size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="btn-primary"
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
          <div className="md:hidden bg-[#0F1A30] border-b border-[#233760] px-4 py-4 space-y-2">
            {[
              { id: 'home', label: 'Home' },
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'cars', label: 'View All Cars' },
              { id: 'add', label: 'Add New Car' },
              { id: 'contact', label: 'Contact Showroom' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => navigateTo(tab.id)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold ${
                  currentRoute === tab.id ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-[#182647]'
                }`}
              >
                {tab.label}
              </button>
            ))}
            <div className="pt-2 border-t border-[#233760] flex items-center justify-between">
              <span className="text-xs text-slate-400">Signed in as {user?.name || 'Guest'}</span>
              <button 
                onClick={() => { setShowLoginModal(true); setMobileMenuOpen(false); }}
                className="text-xs text-blue-400 font-bold"
              >
                Switch User
              </button>
            </div>
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
            onEditCar={(car) => { setEditingCar(car); }}
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

        {/* 404 Page Route Handler */}
        {!['home', 'dashboard', 'cars', 'add', 'contact', 'login'].includes(currentRoute) && (
          <NotFoundPage onHome={() => navigateTo('home')} currentRoute={currentRoute} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#0A1121] border-t border-[#1C2C4E] py-10 text-slate-400 text-sm">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Car size={18} />
            </div>
            <span className="font-bold text-white">CAR COLLECTION SYSTEM</span>
          </div>

          <div className="flex gap-6 text-xs text-slate-400">
            <button onClick={() => navigateTo('home')} className="hover:text-white">Home</button>
            <button onClick={() => navigateTo('dashboard')} className="hover:text-white">Dashboard</button>
            <button onClick={() => navigateTo('cars')} className="hover:text-white">Inventory</button>
            <button onClick={() => navigateTo('contact')} className="hover:text-white">Showroom Desk</button>
            <button onClick={handleResetData} className="hover:text-blue-400">Reset Demo Fleet</button>
          </div>

          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Car Collection System. Designed for Vercel deployment.
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
          <div className="bg-[#121E36] border border-[#2B406B] rounded-2xl max-w-2xl w-full p-6 my-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Edit Vehicle Details</h3>
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
          <div className="bg-[#121E36] border border-red-500/40 rounded-2xl max-w-md w-full p-6 text-center">
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
// PAGE: Home / Landing
// -------------------------------------------------------------
function HomePage({ stats, cars, onNavigate, onSelectCar }) {
  const featuredCars = cars.slice(0, 3);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-24 border-b border-[#1C2C4E]">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-400 text-xs font-bold tracking-wide uppercase mb-6">
              <Sparkles size={14} /> Prestige Automotive Dealership & Collection
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6">
              Curate, Manage & Showcase Exceptional Automobiles.
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed mb-8">
              A comprehensive system for tracking vehicle acquisition, status readiness, specifications, valuation telemetry, and client inquiries.
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => onNavigate('cars')} className="btn-primary text-base px-6 py-3">
                Browse Entire Fleet ({stats.total}) <ArrowRight size={18} />
              </button>
              <button onClick={() => onNavigate('dashboard')} className="btn-secondary text-base px-6 py-3">
                View Showroom Dashboard
              </button>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
            <div className="bg-[#121E36] border border-[#233760] rounded-2xl p-5">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Total Fleet</div>
              <div className="text-3xl font-extrabold text-white">{stats.total}</div>
              <div className="text-xs text-blue-400 mt-1">Active inventory</div>
            </div>
            <div className="bg-[#121E36] border border-[#233760] rounded-2xl p-5">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Available Units</div>
              <div className="text-3xl font-extrabold text-emerald-400">{stats.available}</div>
              <div className="text-xs text-emerald-500 mt-1">Ready for delivery</div>
            </div>
            <div className="bg-[#121E36] border border-[#233760] rounded-2xl p-5">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Sold Units</div>
              <div className="text-3xl font-extrabold text-red-400">{stats.sold}</div>
              <div className="text-xs text-red-400 mt-1">Delivered to collectors</div>
            </div>
            <div className="bg-[#121E36] border border-[#233760] rounded-2xl p-5">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Fleet Valuation</div>
              <div className="text-3xl font-extrabold text-sky-400">
                ${(stats.totalVal / 1000000).toFixed(2)}M
              </div>
              <div className="text-xs text-sky-400 mt-1">Calculated asset value</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Fleet Section */}
      <section className="py-20 bg-[#0B1325]">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <span className="text-xs text-blue-400 font-bold uppercase tracking-wider">Spotlight</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Featured Supercars</h2>
            </div>
            <button 
              onClick={() => onNavigate('cars')} 
              className="text-sm font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1.5"
            >
              View all ({cars.length}) <ChevronRight size={16} />
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
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Live Operations</span>
          <h1 className="text-3xl font-extrabold text-white">Dealership Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Real-time inventory statistics and telemetry</p>
        </div>

        <div className="flex gap-3">
          <button onClick={() => onNavigate('add')} className="btn-primary">
            <Plus size={18} /> Add New Car
          </button>
          <button onClick={onResetData} className="btn-secondary" title="Restore factory fleet">
            <RefreshCw size={16} /> Reset Demo Fleet
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <div className="card p-6">
          <div className="flex justify-between items-start mb-4">
            <span className="text-slate-400 text-sm font-medium">Total Vehicles</span>
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Car size={20} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">{stats.total}</div>
          <p className="text-xs text-blue-400 mt-2 font-medium">100% accounted for in database</p>
        </div>

        <div className="card p-6">
          <div className="flex justify-between items-start mb-4">
            <span className="text-slate-400 text-sm font-medium">Available Units</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">{stats.available}</div>
          <p className="text-xs text-emerald-400 mt-2 font-medium">Ready for immediate contract</p>
        </div>

        <div className="card p-6">
          <div className="flex justify-between items-start mb-4">
            <span className="text-slate-400 text-sm font-medium">Sold Units</span>
            <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">{stats.sold}</div>
          <p className="text-xs text-red-400 mt-2 font-medium">Completed acquisitions</p>
        </div>

        <div className="card p-6">
          <div className="flex justify-between items-start mb-4">
            <span className="text-slate-400 text-sm font-medium">Total Valuation</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Gauge size={20} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-sky-400">
            ${stats.totalVal.toLocaleString()}
          </div>
          <p className="text-xs text-slate-400 mt-2 font-medium">Average ${(stats.totalVal / (stats.total || 1)).toFixed(0).toLocaleString()} per unit</p>
        </div>
      </div>

      {/* Analytics Charts & Fuel Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Status Distribution */}
        <div className="bg-[#121E36] border border-[#233760] rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-1">Inventory Status Readiness</h3>
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
                  <div className="w-full h-2.5 bg-[#0C1527] rounded-full overflow-hidden">
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

        {/* Powertrain Distribution */}
        <div className="bg-[#121E36] border border-[#233760] rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-1">Powertrain & Fuel Types</h3>
          <p className="text-slate-400 text-xs mb-6">Vehicle propulsion classification</p>

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
                  <div className="w-full h-2.5 bg-[#0C1527] rounded-full overflow-hidden">
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

      {/* Recently Added Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Recently Added to Fleet</h3>
          <button 
            onClick={() => onNavigate('cars')} 
            className="text-sm font-semibold text-blue-400 hover:text-blue-300"
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
// PAGE: View All Cars (Inventory)
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
      {/* Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Inventory Management</span>
          <h1 className="text-3xl font-extrabold text-white">Vehicle Collection ({cars.length} of {totalCount})</h1>
          <p className="text-slate-400 text-sm mt-1">Search, filter, and manage dealership fleet</p>
        </div>

        <button onClick={() => onNavigate('add')} className="btn-primary">
          <Plus size={18} /> Add New Car
        </button>
      </div>

      {/* Controls Bar: Search, Filters & View Toggle */}
      <div className="bg-[#121E36] border border-[#233760] rounded-2xl p-5 mb-8 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by brand, model, registration, or color..."
            className="input-field pl-11"
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

        {/* Filter Pills & Sort Select */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#1C2C4E]">
          <div className="flex flex-wrap items-center gap-3">
            {/* Brand Filter */}
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="bg-[#0D162B] text-slate-200 text-xs font-medium border border-[#233760] rounded-lg px-3 py-2 outline-none"
            >
              <option value="All">All Brands</option>
              {brandsList.filter(b => b !== 'All').map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>

            {/* Fuel Filter */}
            <select
              value={selectedFuel}
              onChange={(e) => setSelectedFuel(e.target.value)}
              className="bg-[#0D162B] text-slate-200 text-xs font-medium border border-[#233760] rounded-lg px-3 py-2 outline-none"
            >
              <option value="All">All Fuel Types</option>
              <option value="Petrol">Petrol</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Diesel">Diesel</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-[#0D162B] text-slate-200 text-xs font-medium border border-[#233760] rounded-lg px-3 py-2 outline-none"
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
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
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
              className="bg-[#0D162B] text-slate-200 text-xs font-medium border border-[#233760] rounded-lg px-3 py-2 outline-none"
            >
              <option value="newest">Sort: Date Added</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="year-new">Year: Newest First</option>
              <option value="year-old">Year: Oldest First</option>
            </select>

            <div className="flex bg-[#0D162B] border border-[#233760] rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                title="Grid Cards"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                title="Table View"
              >
                <TableIcon size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Car Items List or Empty State */}
      {cars.length === 0 ? (
        <div className="bg-[#121E36] border border-[#233760] rounded-2xl p-16 text-center">
          <Car size={56} className="text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Vehicles Match Criteria</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
            Try adjusting your search query, brand filter, or reset your search to inspect the full fleet.
          </p>
          <button 
            onClick={() => {
              setSelectedBrand('All');
              setSelectedFuel('All');
              setSelectedStatus('All');
              setSearchQuery('');
            }}
            className="btn-primary"
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
        <div className="bg-[#121E36] border border-[#233760] rounded-2xl overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#0C1527] text-slate-400 text-xs uppercase font-semibold border-b border-[#233760]">
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
                <tr key={car.id} className="hover:bg-[#182647] transition-colors">
                  <td className="py-4 px-5 flex items-center gap-3">
                    <img 
                      src={car.imageUrl} 
                      alt={car.name} 
                      className="w-12 h-9 rounded object-cover border border-[#233760]" 
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
                  <td className="py-4 px-5 font-mono text-xs text-blue-400">{car.registrationNumber}</td>
                  <td className="py-4 px-5 font-bold text-sky-400">${car.price.toLocaleString()}</td>
                  <td className="py-4 px-5">
                    <StatusBadge status={car.status} />
                  </td>
                  <td className="py-4 px-5 text-right space-x-2">
                    <button 
                      onClick={() => onSelectCar(car)} 
                      className="p-1.5 text-slate-300 hover:text-blue-400 hover:bg-[#1C2C4E] rounded"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      onClick={() => onEditCar(car)} 
                      className="p-1.5 text-slate-300 hover:text-amber-400 hover:bg-[#1C2C4E] rounded"
                      title="Edit"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button 
                      onClick={() => onDeleteCar(car)} 
                      className="p-1.5 text-slate-300 hover:text-red-400 hover:bg-[#1C2C4E] rounded"
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
    <div className="card overflow-hidden flex flex-col group">
      {/* Image Header with Overlays */}
      <div className="relative h-48 bg-[#0C1527] overflow-hidden cursor-pointer" onClick={onSelect}>
        <img 
          src={car.imageUrl} 
          alt={`${car.brand} ${car.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80";
          }}
        />
        <div className="absolute top-3 left-3">
          <StatusBadge status={car.status} />
        </div>
        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs font-bold text-white">
          {car.year}
        </div>
        <div className="absolute bottom-3 right-3 bg-blue-900/90 backdrop-blur-sm border border-blue-500/40 px-3 py-1 rounded-lg text-sm font-extrabold text-sky-300">
          ${car.price.toLocaleString()}
        </div>
      </div>

      {/* Body Info */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
            {car.brand}
          </div>
          <h4 
            onClick={onSelect}
            className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors cursor-pointer truncate"
          >
            {car.model}
          </h4>

          {/* Specs Chips */}
          <div className="flex flex-wrap gap-2 mt-3 mb-4">
            <span className="px-2 py-0.5 rounded bg-[#0D162B] text-slate-400 text-xs border border-[#233760]">
              {car.fuelType}
            </span>
            <span className="px-2 py-0.5 rounded bg-[#0D162B] text-slate-400 text-xs border border-[#233760]">
              {car.transmission}
            </span>
            <span className="px-2 py-0.5 rounded bg-[#0D162B] text-slate-400 text-xs border border-[#233760]">
              {car.mileage.toLocaleString()} mi
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-[#1C2C4E] flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono">{car.registrationNumber}</span>

          <div className="flex items-center gap-2">
            {onEdit && (
              <button 
                onClick={onEdit}
                className="p-1.5 hover:text-amber-400 hover:bg-[#1C2C4E] rounded transition-colors"
                title="Edit Car"
              >
                <Edit3 size={15} />
              </button>
            )}
            {onDelete && (
              <button 
                onClick={onDelete}
                className="p-1.5 hover:text-red-400 hover:bg-[#1C2C4E] rounded transition-colors"
                title="Delete Car"
              >
                <Trash2 size={15} />
              </button>
            )}
            <button 
              onClick={onSelect}
              className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
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
// PAGE: Add Car
// -------------------------------------------------------------
function CarFormPage({ onSave, onCancel }) {
  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="mb-8">
        <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Inventory Management</span>
        <h1 className="text-3xl font-extrabold text-white">Add New Vehicle to Fleet</h1>
        <p className="text-slate-400 text-sm mt-1">Fill out the vehicle specifications to add it to the dealership</p>
      </div>

      <div className="bg-[#121E36] border border-[#233760] rounded-2xl p-8">
        <CarForm onSave={onSave} onCancel={onCancel} />
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// COMPONENT: Car Form (Reusable for Add & Edit)
// -------------------------------------------------------------
function CarForm({ initialData = null, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    brand: initialData?.brand || '',
    model: initialData?.model || '',
    year: initialData?.year || new Date().getFullYear(),
    registrationNumber: initialData?.registrationNumber || '',
    fuelType: initialData?.fuelType || 'Petrol',
    transmission: initialData?.transmission || 'Automatic',
    mileage: initialData?.mileage || '',
    price: initialData?.price || '',
    color: initialData?.color || 'Silver',
    status: initialData?.status || 'Available',
    imageUrl: initialData?.imageUrl || PRESET_IMAGE_OPTIONS[0].url,
    description: initialData?.description || '',
    horsepower: initialData?.horsepower || 500
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.brand.trim()) newErrors.brand = 'Brand is required (e.g. Porsche)';
    if (!formData.model.trim()) newErrors.model = 'Model is required (e.g. 911 GT3)';
    if (!formData.registrationNumber.trim()) newErrors.registrationNumber = 'Registration is required';
    if (!formData.price || Number(formData.price) <= 0) newErrors.price = 'Valid price is required';
    if (!formData.year || Number(formData.year) < 1900 || Number(formData.year) > 2030) newErrors.year = 'Enter a year between 1900-2030';
    if (!formData.mileage || Number(formData.mileage) < 0) newErrors.mileage = 'Valid mileage is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      ...formData,
      year: Number(formData.year),
      price: Number(formData.price),
      mileage: Number(formData.mileage),
      horsepower: Number(formData.horsepower) || 0
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Preview & Selector */}
      <div>
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
          Vehicle Photo Preview
        </label>
        <div className="h-44 w-full rounded-xl overflow-hidden bg-[#0C1527] border border-[#233760] mb-3">
          <img 
            src={formData.imageUrl} 
            alt="Preview" 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = PRESET_IMAGE_OPTIONS[0].url;
            }}
          />
        </div>

        <div className="mb-2">
          <span className="text-xs text-slate-400 block mb-1.5 font-medium">Choose from HD Presets:</span>
          <div className="flex flex-wrap gap-2">
            {PRESET_IMAGE_OPTIONS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, imageUrl: preset.url }))}
                className={`text-xs px-2.5 py-1 rounded-md border transition-all ${
                  formData.imageUrl === preset.url 
                    ? 'bg-blue-600 border-blue-400 text-white font-bold' 
                    : 'bg-[#0D162B] border-[#233760] text-slate-400 hover:text-white'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <input 
          type="url"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
          placeholder="Or paste custom image URL..."
          className="input-field text-xs"
        />
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
            placeholder="e.g. Ferrari, Porsche, BMW"
            className={`input-field ${errors.brand ? 'border-red-500' : ''}`}
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
            placeholder="e.g. 296 GTB, 911 GT3 RS"
            className={`input-field ${errors.model ? 'border-red-500' : ''}`}
          />
          {errors.model && <span className="text-xs text-red-400 mt-1 block">{errors.model}</span>}
        </div>
      </div>

      {/* Year & Reg Number */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            className={`input-field ${errors.year ? 'border-red-500' : ''}`}
          />
          {errors.year && <span className="text-xs text-red-400 mt-1 block">{errors.year}</span>}
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
            className={`input-field ${errors.registrationNumber ? 'border-red-500' : ''}`}
          />
          {errors.registrationNumber && <span className="text-xs text-red-400 mt-1 block">{errors.registrationNumber}</span>}
        </div>
      </div>

      {/* Price & Mileage */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
            Price (USD) *
          </label>
          <input 
            type="number" 
            name="price" 
            value={formData.price} 
            onChange={handleChange} 
            placeholder="e.g. 285000"
            className={`input-field ${errors.price ? 'border-red-500' : ''}`}
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
            className={`input-field ${errors.mileage ? 'border-red-500' : ''}`}
          />
          {errors.mileage && <span className="text-xs text-red-400 mt-1 block">{errors.mileage}</span>}
        </div>
      </div>

      {/* Fuel, Transmission & Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
            Fuel Type
          </label>
          <select 
            name="fuelType" 
            value={formData.fuelType} 
            onChange={handleChange} 
            className="input-field"
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
            className="input-field"
          >
            <option value="Automatic">Automatic</option>
            <option value="Manual">Manual</option>
            <option value="Dual-Clutch">Dual-Clutch</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
            Availability Status
          </label>
          <select 
            name="status" 
            value={formData.status} 
            onChange={handleChange} 
            className="input-field"
          >
            <option value="Available">Available</option>
            <option value="Sold">Sold</option>
            <option value="Reserved">Reserved</option>
            <option value="In Maintenance">In Maintenance</option>
          </select>
        </div>
      </div>

      {/* Color & Horsepower */}
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
            placeholder="e.g. Shark Blue"
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
            Horsepower (HP)
          </label>
          <input 
            type="number" 
            name="horsepower" 
            value={formData.horsepower} 
            onChange={handleChange} 
            placeholder="518"
            className="input-field"
          />
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
          className="input-field"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-4 pt-4 border-t border-[#1C2C4E]">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">
          Cancel
        </button>
        <button type="submit" className="btn-primary flex-1">
          {initialData ? 'Save Changes' : 'Add Vehicle to Fleet'}
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
      <div className="bg-[#121E36] border border-[#2B406B] rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl my-8">
        {/* Hero Image */}
        <div className="relative h-72 sm:h-80 bg-[#0C1527]">
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
          <div className="absolute bottom-4 right-4 bg-black/80 px-4 py-2 rounded-xl text-xl font-extrabold text-sky-400 border border-blue-500/30">
            ${car.price.toLocaleString()}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1C2C4E] pb-5">
            <div>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">{car.brand}</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{car.model}</h2>
              <span className="text-xs text-slate-400 font-mono">REG: {car.registrationNumber} • ID: {car.id}</span>
            </div>
          </div>

          {/* Quick Status Buttons */}
          <div className="bg-[#0C1527] p-3.5 rounded-xl border border-[#1C2C4E] flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Status Lifecycle:</span>
            <div className="flex gap-2">
              <button 
                onClick={() => onStatusChange('Available')}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  car.status === 'Available' ? 'bg-emerald-600 text-white' : 'bg-[#182647] text-slate-300 hover:text-white'
                }`}
              >
                Available
              </button>
              <button 
                onClick={() => onStatusChange('Sold')}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  car.status === 'Sold' ? 'bg-red-600 text-white' : 'bg-[#182647] text-slate-300 hover:text-white'
                }`}
              >
                Mark Sold
              </button>
              <button 
                onClick={() => onStatusChange('Reserved')}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  car.status === 'Reserved' ? 'bg-amber-600 text-white' : 'bg-[#182647] text-slate-300 hover:text-white'
                }`}
              >
                Reserved
              </button>
            </div>
          </div>

          {/* Specifications Grid */}
          <div>
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">Specifications</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#0D162B] p-3 rounded-xl border border-[#1C2C4E]">
                <div className="text-xs text-slate-400">Year</div>
                <div className="text-sm font-bold text-white mt-1">{car.year}</div>
              </div>
              <div className="bg-[#0D162B] p-3 rounded-xl border border-[#1C2C4E]">
                <div className="text-xs text-slate-400">Mileage</div>
                <div className="text-sm font-bold text-white mt-1">{car.mileage.toLocaleString()} mi</div>
              </div>
              <div className="bg-[#0D162B] p-3 rounded-xl border border-[#1C2C4E]">
                <div className="text-xs text-slate-400">Fuel Type</div>
                <div className="text-sm font-bold text-white mt-1">{car.fuelType}</div>
              </div>
              <div className="bg-[#0D162B] p-3 rounded-xl border border-[#1C2C4E]">
                <div className="text-xs text-slate-400">Transmission</div>
                <div className="text-sm font-bold text-white mt-1">{car.transmission}</div>
              </div>
              <div className="bg-[#0D162B] p-3 rounded-xl border border-[#1C2C4E]">
                <div className="text-xs text-slate-400">Color</div>
                <div className="text-sm font-bold text-white mt-1">{car.color}</div>
              </div>
              <div className="bg-[#0D162B] p-3 rounded-xl border border-[#1C2C4E]">
                <div className="text-xs text-slate-400">Horsepower</div>
                <div className="text-sm font-bold text-white mt-1">{car.horsepower || 'N/A'} HP</div>
              </div>
            </div>
          </div>

          {/* Curator Description */}
          {car.description && (
            <div>
              <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">Curator Overview</h4>
              <p className="text-slate-300 text-sm leading-relaxed bg-[#0D162B] p-4 rounded-xl border border-[#1C2C4E]">
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
              <button onClick={onClose} className="btn-primary">
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
    showToast('Inquiry received. Our concierge will contact you promptly.');
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Global Showroom Headquarters</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">Contact Dealership Desk</h1>
        <p className="text-slate-400 text-sm max-w-md mx-auto mt-2">
          Connect with our private acquisitions team for vehicle inquiries, viewings, and collection advisory.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Coordinates */}
        <div className="bg-[#121E36] border border-[#233760] rounded-2xl p-8 space-y-6">
          <h3 className="text-lg font-bold text-white mb-2">Showroom Coordinates</h3>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
              <MapPin size={20} />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase">Showroom Address</div>
              <div className="text-sm text-white font-medium mt-0.5">100 Grand Prix Boulevard, Beverly Hills, CA 90210</div>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
              <Phone size={20} />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase">Direct Concierge</div>
              <div className="text-sm text-white font-medium mt-0.5">+1 (800) 555-CARS • (800) 555-2277</div>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
              <Mail size={20} />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase">Acquisitions Email</div>
              <div className="text-sm text-white font-medium mt-0.5">concierge@carcollectionsystem.com</div>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase">Operating Hours</div>
              <div className="text-sm text-white font-medium mt-0.5">Mon - Sat: 9:00 AM - 7:00 PM • Sunday by Appointment</div>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="bg-[#121E36] border border-[#233760] rounded-2xl p-8">
          <h3 className="text-lg font-bold text-white mb-4">Send Vehicle Inquiry</h3>

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
                  className="input-field" 
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
                  className="input-field" 
                  placeholder="michael@luxuryauto.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Vehicle of Interest</label>
                <input 
                  type="text" 
                  value={formData.subject} 
                  onChange={e => setFormData({ ...formData, subject: e.target.value })} 
                  className="input-field" 
                  placeholder="e.g. Porsche 911 GT3 RS"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Inquiry Message</label>
                <textarea 
                  rows={3}
                  value={formData.message} 
                  onChange={e => setFormData({ ...formData, message: e.target.value })} 
                  className="input-field" 
                  placeholder="Tell us about your acquisition timeline or questions..."
                />
              </div>

              <button type="submit" className="btn-primary w-full">
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
  const [email, setEmail] = useState(user?.email || '');
  const [name, setName] = useState(user?.name || '');

  const handleDemoDirector = () => {
    const newUser = { name: 'Alexander Vance', email: 'admin@carcollection.com', role: 'Collection Director' };
    setUser(newUser);
    localStorage.setItem('car_collection_user', JSON.stringify(newUser));
    showToast('Signed in as Alexander Vance (Director)');
    onClose();
  };

  const handleDemoStaff = () => {
    const newUser = { name: 'Sarah Connor', email: 'staff@carcollection.com', role: 'Acquisitions Specialist' };
    setUser(newUser);
    localStorage.setItem('car_collection_user', JSON.stringify(newUser));
    showToast('Signed in as Sarah Connor (Specialist)');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121E36] border border-[#2B406B] rounded-2xl max-w-sm w-full p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center mx-auto mb-3">
          <User size={28} />
        </div>
        <h3 className="text-xl font-bold text-white mb-1">User Account</h3>
        <p className="text-xs text-slate-400 mb-6">Switch between demo profiles or staff roles</p>

        <div className="space-y-3 mb-6">
          <button 
            onClick={handleDemoDirector}
            className="w-full py-3 px-4 rounded-xl bg-[#182647] hover:bg-blue-600/20 border border-[#2B406B] text-left transition-colors"
          >
            <div className="text-sm font-bold text-white">Alexander Vance</div>
            <div className="text-xs text-blue-400">Collection Director (Admin)</div>
          </button>

          <button 
            onClick={handleDemoStaff}
            className="w-full py-3 px-4 rounded-xl bg-[#182647] hover:bg-blue-600/20 border border-[#2B406B] text-left transition-colors"
          >
            <div className="text-sm font-bold text-white">Sarah Connor</div>
            <div className="text-xs text-blue-400">Acquisitions Specialist (Staff)</div>
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
      <h1 className="text-5xl font-extrabold text-white mb-3">404</h1>
      <h2 className="text-2xl font-bold text-white mb-3">Vehicle Route Not Found</h2>
      <p className="text-slate-400 text-sm max-w-md mx-auto mb-8">
        The path <code className="text-blue-400 font-mono bg-[#142342] px-2 py-0.5 rounded">/{currentRoute}</code> does not correspond to an active showroom endpoint.
      </p>
      <button onClick={onHome} className="btn-primary px-6 py-3">
        Return to Showroom Home
      </button>
    </div>
  );
}
