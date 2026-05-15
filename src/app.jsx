/* ═══════════════════════════════════════════════════════════════
   GROOMER — Luxury Mobile Grooming Booking App
   Single-file React 18 Application (CDN + Babel Standalone)
   ═══════════════════════════════════════════════════════════════ */

const { useState, useEffect, useRef, useCallback, useMemo } = React;

// Defensive data initialization to prevent crashes if mockData.js is delayed
const data = window.mockData || { 
    groomingShops: [], 
    services: { men: [], women: [] }, 
    groomers: [], 
    timeSlots: { morning: [], afternoon: [], evening: [] },
    bookings: [],
    exploreCategories: [],
    aiOptions: { men: [], women: [] }
};

console.log('GROOMER: App script loaded. Data source:', window.mockData ? 'External' : 'Fallback');

/* ═══════════════════════════════════════════════════════════════
   BETTER AUTH CLIENT
   ═══════════════════════════════════════════════════════════════ */
const authClient = window.BetterAuthClient;

/* ── Helpers ────────────────────────────────────────────────── */
const unsplash = (q, sig = 1, w = 600, h = 400) =>
    `https://source.unsplash.com/${w}x${h}/?${q}&sig=${sig}`;

const dicebear = (name) =>
    `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(name)}`;

const formatDate = (d) => {
    if (!d) return '';
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getDayLabel = (offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    if (offset === 0) return 'Today';
    if (offset === 1) return 'Tomorrow';
    return d.toLocaleDateString('en-US', { weekday: 'short' });
};

const getDayDate = (offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.getDate();
};

/* ═══════════════════════════════════════════════════════════════
   TOAST SYSTEM
   ═══════════════════════════════════════════════════════════════ */
const ToastContext = React.createContext();

function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const addToast = useCallback((msg, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, msg, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
    }, []);
    return (
        <ToastContext.Provider value={addToast}>
            {children}
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[90%] max-w-[400px]">
                {toasts.map(t => (
                    <div key={t.id}
                        className={`anim-toast px-4 py-3 rounded-xl text-sm font-semibold shadow-lg flex items-center gap-2
              ${t.type === 'success' ? 'bg-green-900/80 border border-green-500/30 text-green-200' :
                                'bg-red-900/80 border border-red-500/30 text-red-200'}`}>
                        <span>{t.type === 'success' ? '✓' : '✕'}</span>
                        <span>{t.msg}</span>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

const useToast = () => React.useContext(ToastContext);

/* ═══════════════════════════════════════════════════════════════
   BOTTOM NAV
   ═══════════════════════════════════════════════════════════════ */
function BottomNav({ page, setPage }) {
    const tabs = [
        { id: 'home', label: 'Home', icon: '🏠' },
        { id: 'bookings', label: 'Bookings', icon: '📅' },
        { id: 'scan', label: 'Try Style', icon: '✨' },
        { id: 'profile', label: 'Profile', icon: '👤' },
    ];
    return (
        <nav className="bottom-nav">
            <div className="flex justify-around items-center py-1">
                {tabs.map(t => (
                    <button key={t.id}
                        onClick={() => setPage(t.id)}
                        className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-all duration-300
              ${page === t.id ? 'text-gold scale-110' : 'text-cream/40 hover:text-cream/60'}`}>
                        <span className="text-xl">{t.icon}</span>
                        <span className="text-[10px] font-semibold tracking-wide">{t.label}</span>
                    </button>
                ))}
            </div>
        </nav>
    );
}

/* ═══════════════════════════════════════════════════════════════
   SKELETON CARD
   ═══════════════════════════════════════════════════════════════ */
function SkeletonCard() {
    return (
        <div className="glass-card p-3 flex gap-3">
            <div className="skeleton w-24 h-24 rounded-xl flex-shrink-0" />
            <div className="flex-1 flex flex-col gap-2 py-1">
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
                <div className="skeleton h-3 w-2/3 rounded" />
                <div className="skeleton h-8 w-24 rounded-lg mt-auto" />
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE 1 — SPLASH / LOGIN
   ═══════════════════════════════════════════════════════════════ */
function SplashLogin({ onLogin }) {
    const [mode, setMode] = useState('signin');
    const [gender, setGender] = useState('men');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const toast = useToast();

    useEffect(() => {
        const t = setTimeout(() => setShowForm(true), 1400);
        return () => clearTimeout(t);
    }, []);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!email || !password) return;
        setLoading(true);
        try {
            if (mode === 'signup') {
                await authClient.signUp(email, password, name);
                toast('Account created successfully!', 'success');
            } else {
                await authClient.signIn(email, password);
            }
            const session = await authClient.getSession();
            if (session && session.user) {
                onLogin({
                    email: session.user.email,
                    name: session.user.name || session.user.email.split('@')[0],
                    picture: session.user.image || null,
                    gender,
                    id: session.user.id,
                });
            } else {
                onLogin({ email, name: name || email.split('@')[0], gender });
            }
        } catch (err) {
            toast(err.message || 'Authentication failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        setGoogleLoading(true);
        authClient.signInGoogle();
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden bg-bg">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full opacity-20"
                style={{ background: 'radial-gradient(circle, #C9A84C 0%, transparent 70%)' }} />

            <div className="anim-logo mb-2 select-none">
                <span className="text-7xl">✂️</span>
            </div>
            <h1 className="font-display text-4xl font-bold gold-text anim-fadeUp mb-1">GROOMER</h1>
            <p className="text-cream/50 text-sm anim-fadeUp tracking-[0.3em] uppercase">Luxury Grooming</p>

            {showForm && (
                <form onSubmit={handleSubmit} className="w-full mt-10 space-y-4 anim-fadeUp">
                    <div className="glass-card-sm flex p-1 gap-1">
                        {['men', 'women'].map(g => (
                            <button key={g} type="button" onClick={() => setGender(g)}
                                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${gender === g ? 'gold-btn' : 'text-cream/50'}`}>
                                {g === 'men' ? '🧔 Men' : '💇‍♀️ Women'}
                            </button>
                        ))}
                    </div>

                    <div className="glass-card-sm flex p-1 gap-1">
                        {['signin', 'signup'].map(m => (
                            <button key={m} type="button" onClick={() => setMode(m)}
                                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === m ? 'gold-btn' : 'text-cream/50'}`}>
                                {m === 'signin' ? '🔑 Sign In' : '✨ Sign Up'}
                            </button>
                        ))}
                    </div>

                    {mode === 'signup' && (
                        <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} className="input-gold" required />
                    )}
                    <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className="input-gold" required />
                    <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="input-gold" required minLength={6} />

                    <button type="submit" disabled={loading} className="gold-btn w-full py-3.5 text-base mt-2">
                        {loading ? 'Processing...' : (mode === 'signup' ? 'Create Account' : 'Sign In')}
                    </button>

                    <div className="flex items-center gap-3 my-2">
                        <div className="flex-1 h-px bg-cream/10" />
                        <span className="text-cream/30 text-xs">or</span>
                        <div className="flex-1 h-px bg-cream/10" />
                    </div>

                    <button type="button" onClick={handleGoogleLogin} disabled={googleLoading}
                        className="w-full py-3.5 rounded-xl border border-cream/15 bg-white/5 text-cream font-semibold text-sm flex items-center justify-center gap-3">
                        <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6.01c4.51-4.18 7.09-10.36 7.09-17.66z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6.01c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                        Continue with Google
                    </button>
                </form>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE 2 — HOME
   ═══════════════════════════════════════════════════════════════ */
function HomePage({ user, onSelectShop }) {
    const shops = data.groomingShops || [];
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    const filtered = useMemo(() => {
        let s = shops;
        if (search) s = s.filter(sh => sh.name.toLowerCase().includes(search.toLowerCase()));
        if (filter !== 'all' && filter !== 'top rated') s = s.filter(sh => sh.type === filter);
        if (filter === 'top rated') s = s.filter(sh => parseFloat(sh.rating) >= 4.7);
        return s;
    }, [shops, search, filter]);

    return (
        <div className="pb-24 px-4 pt-6 bg-bg min-h-screen">
            <div className="mb-6 anim-fadeUp">
                <p className="text-cream/50 text-sm">Welcome back,</p>
                <div className="flex items-center gap-3">
                    {user?.picture && <img src={user.picture} className="w-10 h-10 rounded-full border border-gold/30" />}
                    <h1 className="font-display text-2xl font-bold gold-text">
                        {user?.name || 'Guest'} ✨
                    </h1>
                </div>
            </div>

            <div className="relative mb-4 anim-fadeUp">
                <input type="text" placeholder="Search shops..." value={search} onChange={e => setSearch(e.target.value)} className="input-gold pl-4" />
            </div>

            <div className="flex gap-2 overflow-x-auto hide-scroll mb-6 anim-fadeUp">
                {['All', 'Men', 'Women', 'Unisex', 'Top Rated'].map(f => (
                    <button key={f} onClick={() => setFilter(f.toLowerCase())}
                        className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all ${filter === f.toLowerCase() ? 'gold-btn' : 'glass-card-sm text-cream/50'}`}>
                        {f}
                    </button>
                ))}
            </div>

            <div className="mb-6">
                <h2 className="text-cream/90 font-semibold mb-3">Explore</h2>
                <div className="flex gap-3 overflow-x-auto hide-scroll pb-2">
                    {(data.exploreCategories || []).map((cat, i) => (
                        <div key={cat.id} className="flex-shrink-0 glass-card-sm p-3 flex flex-col items-center min-w-[80px] anim-fadeUp stagger-1">
                            <span className="text-2xl">{cat.icon}</span>
                            <span className="text-[10px] text-cream/70 font-semibold mt-1">{cat.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            <h2 className="text-cream/90 font-semibold mb-3">Nearby Shops</h2>
            <div className="space-y-3">
                {filtered.length === 0 ? (
                    <div className="text-center py-10 text-cream/40">No shops found</div>
                ) : (
                    filtered.map((shop, i) => (
                        <div key={shop.id} className="glass-card p-3 flex gap-3 anim-fadeUp" onClick={() => onSelectShop(shop)}>
                            <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                                <img src={unsplash('barber,salon', shop.id)} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 flex flex-col justify-between py-0.5">
                                <div>
                                    <h3 className="font-semibold text-cream text-sm">{shop.name}</h3>
                                    <p className="text-cream/40 text-xs mt-0.5">{shop.address}</p>
                                    <div className="flex items-center gap-1 mt-1 text-xs">
                                        <span className="text-gold">★ {shop.rating}</span>
                                        <span className="text-cream/30">({shop.reviewCount})</span>
                                        <span className="text-cream/20 mx-1">•</span>
                                        <span className="text-cream/40">{shop.distance}</span>
                                    </div>
                                </div>
                                <button className="gold-btn px-3 py-1.5 text-[10px] font-bold self-end">Book Now</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE 3 — SHOP DETAIL
   ═══════════════════════════════════════════════════════════════ */
function ShopDetail({ shop, user, onBack, onBook, preferredStyle }) {
    const [selectedService, setSelectedService] = useState(null);
    const [selectedDay, setSelectedDay] = useState(0);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [selectedGroomer, setSelectedGroomer] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const toast = useToast();

    const services = data.services[user?.gender || 'men'] || data.services.men || [];
    const groomers = (data.groomers || []).filter(g => g.shopIds?.includes(shop.id));

    const handleConfirm = () => {
        if (!selectedService || !selectedSlot || !selectedGroomer) return;
        const booking = {
            id: Date.now(),
            shopName: shop.name,
            service: selectedService.name,
            groomer: selectedGroomer.name,
            date: (() => { const d = new Date(); d.setDate(d.getDate() + selectedDay); return d.toISOString().split('T')[0]; })(),
            time: selectedSlot,
            price: selectedService.price,
            status: 'upcoming',
            preferredStyle
        };
        onBook(booking);
        toast(`Booked ${selectedService.name}!`, 'success');
        onBack();
    };

    return (
        <div className="pb-24 bg-bg min-h-screen relative">
            <div className="h-56 relative overflow-hidden">
                <img src={unsplash('barbershop-interior', shop.id)} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
                <button onClick={onBack} className="absolute top-4 left-4 w-10 h-10 rounded-full bg-bg/60 text-cream backdrop-blur-md">←</button>
            </div>
            
            <div className="px-4 -mt-8 relative z-10">
                <h1 className="font-display text-2xl font-bold text-cream">{shop.name}</h1>
                <div className="flex items-center gap-2 mt-1 text-sm">
                    <span className="text-gold">★ {shop.rating}</span>
                    <span className="text-cream/30">({shop.reviewCount} reviews)</span>
                </div>

                <div className="mt-6">
                    <h2 className="text-cream/90 font-semibold mb-3">Services</h2>
                    <div className="space-y-2">
                        {services.map(s => (
                            <button key={s.id} onClick={() => setSelectedService(s)}
                                className={`w-full glass-card-sm p-4 flex justify-between items-center transition-all ${selectedService?.id === s.id ? 'border-gold bg-gold/5' : ''}`}>
                                <div>
                                    <p className="text-cream text-sm font-semibold">{s.name}</p>
                                    <p className="text-cream/40 text-xs">{s.duration}</p>
                                </div>
                                <span className="gold-text font-bold">${s.price}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-6">
                    <h2 className="text-cream/90 font-semibold mb-3">Select Date</h2>
                    <div className="flex gap-2 overflow-x-auto hide-scroll pb-2">
                        {Array.from({ length: 7 }).map((_, i) => (
                            <button key={i} onClick={() => setSelectedDay(i)}
                                className={`flex-shrink-0 w-16 py-3 rounded-xl flex flex-col items-center ${selectedDay === i ? 'gold-btn' : 'glass-card-sm text-cream/50'}`}>
                                <span className="text-[10px] font-bold uppercase">{getDayLabel(i)}</span>
                                <span className="text-lg font-bold">{getDayDate(i)}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-6">
                    <h2 className="text-cream/90 font-semibold mb-3">Time Slots</h2>
                    <div className="flex flex-wrap gap-2">
                        {(data.timeSlots?.afternoon || []).map(slot => (
                            <button key={slot.time} onClick={() => setSelectedSlot(slot.time)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${selectedSlot === slot.time ? 'gold-btn' : 'glass-card-sm text-cream/60'}`}>
                                {slot.time}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-6">
                    <h2 className="text-cream/90 font-semibold mb-3">Groomer</h2>
                    <div className="flex gap-3 overflow-x-auto hide-scroll pb-2">
                        {(groomers.length > 0 ? groomers : (data.groomers || []).slice(0, 3)).map(g => (
                            <button key={g.id} onClick={() => setSelectedGroomer(g)}
                                className={`flex-shrink-0 glass-card-sm p-3 flex flex-col items-center min-w-[100px] transition-all ${selectedGroomer?.id === g.id ? 'border-gold bg-gold/5' : ''}`}>
                                <img src={dicebear(g.name)} className="w-12 h-12 rounded-full border border-gold/30" />
                                <p className="text-cream text-xs font-bold mt-2">{g.name}</p>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-10 pb-10">
                    <button onClick={handleConfirm} disabled={!selectedService || !selectedSlot || !selectedGroomer}
                        className="gold-btn w-full py-4 rounded-2xl shadow-xl font-bold">
                        Confirm Appointment
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   AI HAIR STYLE VIRTUAL TRY-ON
   ═══════════════════════════════════════════════════════════════ */
function AIHairTryOn({ onClose, onBookStyle }) {
    const options = data.aiOptions || { men: [], women: [] };
    const [uploadedImage, setUploadedImage] = useState(null);
    const [categoryFilter, setCategoryFilter] = useState('men');
    const [selectedBaseStyle, setSelectedBaseStyle] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [resultImage, setResultImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const toast = useToast();

    useEffect(() => {
        setSelectedBaseStyle(options[categoryFilter]?.[0] || null);
        setResultImage(null);
    }, [categoryFilter]);

    useEffect(() => {
        if (categoryFilter === 'women' && selectedBaseStyle?.colors) {
            setSelectedColor(selectedBaseStyle.colors[0]);
        } else {
            setSelectedColor(null);
        }
    }, [selectedBaseStyle, categoryFilter]);

    const handleFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            setUploadedImage(ev.target.result);
            setResultImage(null);
            setError(null);
        };
        reader.readAsDataURL(file);
    };

    const generatePreview = async () => {
        if (!uploadedImage || !selectedBaseStyle) return;
        if (categoryFilter === 'women' && !selectedColor) return;
        
        setLoading(true);
        setError(null);
        setResultImage(null);

        try {
            const styleId = categoryFilter === 'men' ? selectedBaseStyle.styleId : selectedColor?.styleId;
            const res = await fetch('/api/hairstyle-preview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageBase64: uploadedImage, styleId }),
            });
            const d = await res.json();
            if (res.ok && d.resultImageUrl) {
                setResultImage(d.resultImageUrl);
                toast('AI Magic complete!', 'success');
            } else {
                throw new Error(d.error || 'Failed to generate');
            }
        } catch (err) {
            setError(err.message);
            toast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content p-0 overflow-hidden bg-bg" onClick={e => e.stopPropagation()} style={{height: '92vh'}}>
                <div className="p-4 flex justify-between border-b border-cream/10">
                    <h2 className="font-display text-lg font-bold gold-text flex items-center gap-2">✨ AI Hair Lab</h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-cream/10 text-cream/60 flex items-center justify-center">✕</button>
                </div>
                
                <div className="p-5 overflow-y-auto custom-scrollbar" style={{height: 'calc(100% - 60px)'}}>
                    {!uploadedImage ? (
                        <div className="border-2 border-dashed border-cream/20 rounded-3xl p-10 text-center cursor-pointer hover:border-gold/40 transition-all"
                            onClick={() => document.getElementById('ai-upload-main').click()}>
                            <span className="text-6xl block mb-4">📸</span>
                            <p className="text-cream font-bold text-lg">Upload Your Photo</p>
                            <p className="text-cream/40 text-xs mt-2">Front-facing clear photo works best</p>
                            <input id="ai-upload-main" type="file" accept="image/*" className="hidden" onChange={handleFile} />
                        </div>
                    ) : (
                        <div className="space-y-6 pb-10">
                            <div className="flex gap-3 relative">
                                <div className="flex-1">
                                    <p className="text-[10px] text-cream/40 uppercase mb-2 text-center">Original</p>
                                    <img src={uploadedImage} className="rounded-2xl aspect-[3/4] object-cover border border-cream/10" />
                                </div>
                                {resultImage && (
                                    <div className="flex-1 anim-fadeUp">
                                        <p className="text-[10px] text-gold uppercase mb-2 text-center">AI Result</p>
                                        <img src={resultImage} className="rounded-2xl aspect-[3/4] object-cover border border-gold/40 shadow-lg shadow-gold/20" />
                                    </div>
                                )}
                                {loading && (
                                    <div className="absolute inset-0 bg-bg/60 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-20">
                                        <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full anim-spin mb-4" />
                                        <p className="gold-text font-bold anim-pulse">Generating your look...</p>
                                    </div>
                                )}
                            </div>

                            {!loading && (
                                <div className="space-y-6">
                                    <div className="glass-card-sm flex p-1 gap-1">
                                        {['men', 'women'].map(cat => (
                                            <button key={cat} onClick={() => setCategoryFilter(cat)}
                                                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${categoryFilter === cat ? 'gold-btn' : 'text-cream/50'}`}>
                                                {cat === 'men' ? '🧔 Men' : '💇‍♀️ Women'}
                                            </button>
                                        ))}
                                    </div>

                                    <div>
                                        <p className="text-[10px] text-cream/40 uppercase mb-3 px-1">Choose Style</p>
                                        <div className="grid grid-cols-3 gap-2">
                                            {(options[categoryFilter] || []).map(style => (
                                                <button key={style.id} onClick={() => { setSelectedBaseStyle(style); setResultImage(null); }}
                                                    className={`glass-card-sm p-3 flex flex-col items-center gap-2 transition-all ${selectedBaseStyle?.id === style.id ? 'border-gold bg-gold/10 scale-105' : 'hover:border-gold/30'}`}>
                                                    <span className="text-2xl">{style.preview}</span>
                                                    <p className="text-[10px] text-cream font-bold text-center leading-tight">{style.label}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {categoryFilter === 'women' && selectedBaseStyle?.colors && (
                                        <div>
                                            <p className="text-[10px] text-cream/40 uppercase mb-3 px-1">Pick Color</p>
                                            <div className="flex gap-3 overflow-x-auto hide-scroll pb-2">
                                                {selectedBaseStyle.colors.map(c => (
                                                    <button key={c.id} onClick={() => { setSelectedColor(c); setResultImage(null); }}
                                                        className={`flex-shrink-0 flex flex-col items-center gap-2 group`}>
                                                        <div className={`w-10 h-10 rounded-full border-2 transition-all ${selectedColor?.id === c.id ? 'border-gold scale-110 shadow-lg shadow-gold/20' : 'border-white/10 opacity-60'}`}
                                                            style={{background: c.hex}} />
                                                        <span className={`text-[9px] font-bold ${selectedColor?.id === c.id ? 'text-gold' : 'text-cream/40'}`}>{c.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-4">
                                        {!resultImage ? (
                                            <button onClick={generatePreview} disabled={!selectedBaseStyle || (categoryFilter === 'women' && !selectedColor)}
                                                className="gold-btn w-full py-4 rounded-2xl shadow-xl font-bold flex items-center justify-center gap-2">
                                                ✨ Generate Style Preview
                                            </button>
                                        ) : (
                                            <div className="space-y-3">
                                                <button onClick={() => { onBookStyle(`${selectedBaseStyle.label} ${selectedColor ? '('+selectedColor.label+')' : ''}`); onClose(); }}
                                                    className="gold-btn w-full py-4 rounded-2xl shadow-xl font-bold">
                                                    📅 Book This Style
                                                </button>
                                                <button onClick={() => { setResultImage(null); setUploadedImage(null); }}
                                                    className="w-full py-3 text-cream/40 text-xs font-semibold hover:text-cream/60">
                                                    Try Another Photo
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   APP ROOT
   ═══════════════════════════════════════════════════════════════ */
function App() {
    const [page, setPage] = useState('splash');
    const [user, setUser] = useState(null);
    const [selectedShop, setSelectedShop] = useState(null);
    const [bookings, setBookings] = useState(data.bookings || []);
    const [showHairTryOn, setShowHairTryOn] = useState(false);
    const [preferredStyle, setPreferredStyle] = useState(null);
    const [sessionLoading, setSessionLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const session = await authClient.getSession();
                if (session && session.user) {
                    setUser({
                        email: session.user.email,
                        name: session.user.name || session.user.email.split('@')[0],
                        picture: session.user.image,
                        gender: 'men',
                    });
                    setPage('home');
                }
            } catch (e) {} finally {
                setSessionLoading(false);
            }
        };
        checkSession();
    }, []);

    const handleLogin = (u) => {
        setUser(u);
        setPage('home');
    };

    const handleBook = (b) => {
        setBookings(prev => [b, ...prev]);
    };

    if (sessionLoading) {
        return (
            <div className="min-h-screen bg-bg flex flex-col items-center justify-center">
                <span className="text-7xl mb-4 anim-logo">✂️</span>
                <div className="w-10 h-10 border-4 border-gold/10 border-t-gold rounded-full anim-spin" />
            </div>
        );
    }

    return (
        <ToastProvider>
            <div className="bg-bg min-h-screen">
                {page === 'splash' && <SplashLogin onLogin={handleLogin} />}
                
                {page === 'home' && (
                    <>
                        {preferredStyle && (
                            <div className="px-4 pt-4 anim-fadeUp">
                                <div className="glass-card p-3 flex justify-between items-center border-gold/40 bg-gold/5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">✨</span>
                                        <div>
                                            <p className="text-[10px] text-gold uppercase font-bold">Selected AI Look</p>
                                            <p className="text-cream text-sm font-bold">{preferredStyle}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setPreferredStyle(null)} className="text-cream/30 text-xs hover:text-cream/60">✕</button>
                                </div>
                            </div>
                        )}
                        <HomePage user={user} onSelectShop={(s) => { setSelectedShop(s); setPage('detail'); }} />
                    </>
                )}

                {page === 'detail' && selectedShop && (
                    <ShopDetail shop={selectedShop} user={user} onBack={() => setPage('home')} onBook={handleBook} preferredStyle={preferredStyle} />
                )}

                {page === 'bookings' && (
                    <div className="p-4 pb-24 bg-bg min-h-screen">
                        <h1 className="font-display text-2xl font-bold gold-text mb-6">My Appointments</h1>
                        <div className="space-y-4">
                            {bookings.length === 0 ? (
                                <div className="text-center py-20 text-cream/20">No appointments yet</div>
                            ) : (
                                bookings.map(b => (
                                    <div key={b.id} className="glass-card p-4 flex gap-4 anim-fadeUp">
                                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-cream/5 flex items-center justify-center text-2xl">💈</div>
                                        <div className="flex-1">
                                            <h3 className="text-cream font-bold">{b.shopName}</h3>
                                            <p className="text-cream/50 text-xs">{b.service} with {b.groomer}</p>
                                            <div className="mt-2 flex justify-between items-center">
                                                <span className="text-[10px] text-gold font-bold uppercase tracking-wider">{formatDate(b.date)} @ {b.time}</span>
                                                <span className="gold-text font-bold text-sm">${b.price}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {page === 'profile' && (
                    <div className="p-4 pb-24 bg-bg min-h-screen flex flex-col items-center">
                        <div className="mt-10 relative">
                            <img src={user?.picture || dicebear(user?.name || 'Guest')} className="w-24 h-24 rounded-full border-2 border-gold/40 shadow-xl" />
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full gold-btn flex items-center justify-center text-sm">✏️</div>
                        </div>
                        <h2 className="text-cream font-bold text-xl mt-4">{user?.name}</h2>
                        <p className="text-cream/40 text-sm">{user?.email}</p>
                        
                        <div className="w-full mt-10 space-y-3">
                            <button className="w-full glass-card p-4 text-left flex justify-between items-center">
                                <span className="text-cream/80 font-semibold">🔔 Notifications</span>
                                <span className="text-cream/20">›</span>
                            </button>
                            <button className="w-full glass-card p-4 text-left flex justify-between items-center">
                                <span className="text-cream/80 font-semibold">💳 Payment Methods</span>
                                <span className="text-cream/20">›</span>
                            </button>
                            <button onClick={() => { authClient.signOut(); setUser(null); setPage('splash'); }} 
                                className="w-full py-4 rounded-xl border border-red-500/20 text-red-400 font-bold text-sm mt-10 hover:bg-red-500/5 transition-all">
                                Sign Out
                            </button>
                        </div>
                    </div>
                )}

                {showHairTryOn && <AIHairTryOn onClose={() => setShowHairTryOn(false)} onBookStyle={setPreferredStyle} />}
                
                {page !== 'splash' && <BottomNav page={page} setPage={(p) => p === 'scan' ? setShowHairTryOn(true) : setPage(p)} />}
            </div>
        </ToastProvider>
    );
}

// Global Error Handler for React
window.onerror = function(msg, url, line, col, error) {
    console.error('GROOMER_FATAL:', msg, 'at', line, ':', col);
    return false;
};

// Mount
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
