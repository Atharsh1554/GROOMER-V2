// ─── GROOMER_APP Mock Data ──────────────────────────────────────
window.mockData = {

    /* ── Grooming Shops ─────────────────────────────────────────── */
    groomingShops: [
        { id: 1, name: "The Noir Barbershop", type: "men", rating: 4.9, reviewCount: 312, distance: "0.8 km", address: "12 King Street, Downtown", isOpen: true, phone: "+1 555-0101", imageSig: "barbershop-luxury" },
        { id: 2, name: "Velvet Touch Salon", type: "women", rating: 4.7, reviewCount: 248, distance: "1.2 km", address: "45 Queens Ave, Midtown", isOpen: true, phone: "+1 555-0102", imageSig: "salon-women" },
        { id: 3, name: "Blade & Bristle", type: "men", rating: 4.8, reviewCount: 185, distance: "1.5 km", address: "78 Barber Lane, Uptown", isOpen: false, phone: "+1 555-0103", imageSig: "barber-classic" },
        { id: 4, name: "Glow & Grace Studio", type: "unisex", rating: 4.6, reviewCount: 420, distance: "2.1 km", address: "9 Elm Street, West End", isOpen: true, phone: "+1 555-0104", imageSig: "unisex-salon" },
        { id: 5, name: "Crown & Comb", type: "men", rating: 4.5, reviewCount: 156, distance: "2.8 km", address: "33 Duke Road, Old Town", isOpen: true, phone: "+1 555-0105", imageSig: "barber-modern" },
        { id: 6, name: "The Gilded Mirror", type: "women", rating: 4.9, reviewCount: 530, distance: "3.0 km", address: "100 Rose Boulevard, Central", isOpen: true, phone: "+1 555-0106", imageSig: "salon-luxury" },
        { id: 7, name: "Timber & Steel Barbers", type: "men", rating: 4.4, reviewCount: 98, distance: "3.5 km", address: "22 Oak Avenue, North Side", isOpen: false, phone: "+1 555-0107", imageSig: "barber-rustic" },
        { id: 8, name: "Aura Beauty Lounge", type: "women", rating: 4.8, reviewCount: 375, distance: "3.9 km", address: "55 Lily Lane, Eastside", isOpen: true, phone: "+1 555-0108", imageSig: "beauty-lounge" },
        { id: 9, name: "The Dapper Den", type: "unisex", rating: 4.7, reviewCount: 210, distance: "4.2 km", address: "7 Market Square, Harbour", isOpen: true, phone: "+1 555-0109", imageSig: "dapper-salon" },
        { id: 10, name: "Obsidian Grooming Club", type: "men", rating: 4.6, reviewCount: 167, distance: "4.8 km", address: "88 Granite Row, South Quarter", isOpen: false, phone: "+1 555-0110", imageSig: "grooming-club" }
    ],

    /* ── Services ───────────────────────────────────────────────── */
    services: {
        men: [
            { id: "m1", name: "Classic Haircut", duration: "30 min", price: 35 },
            { id: "m2", name: "Beard Sculpt & Trim", duration: "25 min", price: 28 },
            { id: "m3", name: "Hot Towel Shave", duration: "35 min", price: 40 },
            { id: "m4", name: "Fade & Line-Up", duration: "40 min", price: 45 },
            { id: "m5", name: "Scalp Treatment", duration: "45 min", price: 55 },
            { id: "m6", name: "Hair Color", duration: "60 min", price: 70 },
            { id: "m7", name: "Royal Grooming Package", duration: "90 min", price: 120 }
        ],
        women: [
            { id: "w1", name: "Precision Cut & Style", duration: "45 min", price: 55 },
            { id: "w2", name: "Blowout & Waves", duration: "40 min", price: 50 },
            { id: "w3", name: "Balayage Highlights", duration: "120 min", price: 180 },
            { id: "w4", name: "Deep Conditioning", duration: "30 min", price: 40 },
            { id: "w5", name: "Bridal Updo", duration: "75 min", price: 150 },
            { id: "w6", name: "Keratin Treatment", duration: "90 min", price: 200 },
            { id: "w7", name: "Luxury Spa Facial", duration: "60 min", price: 95 }
        ]
    },

    /* ── Groomers / Stylists ────────────────────────────────────── */
    groomers: [
        { id: 1, name: "Marcus Cole", rating: 4.9, specialty: "Fades & Line-Ups", avatar: "Marcus", shopIds: [1, 5, 10] },
        { id: 2, name: "Sophia Laurent", rating: 4.8, specialty: "Balayage & Color", avatar: "Sophia", shopIds: [2, 6, 8] },
        { id: 3, name: "Jayden Brooks", rating: 4.7, specialty: "Beard Sculpting", avatar: "Jayden", shopIds: [1, 3, 7] },
        { id: 4, name: "Amara Osei", rating: 4.9, specialty: "Bridal Styling", avatar: "Amara", shopIds: [2, 4, 8] },
        { id: 5, name: "Leon Harper", rating: 4.6, specialty: "Classic Cuts", avatar: "Leon", shopIds: [3, 5, 9] },
        { id: 6, name: "Isla Chen", rating: 4.8, specialty: "Keratin & Treatment", avatar: "Isla", shopIds: [4, 6, 9] },
        { id: 7, name: "Dante Rivera", rating: 4.5, specialty: "Hot Towel Shaves", avatar: "Dante", shopIds: [7, 10, 1] },
        { id: 8, name: "Priya Nair", rating: 4.7, specialty: "Precision Cuts", avatar: "Priya", shopIds: [4, 8, 6] }
    ],

    /* ── Time Slots ─────────────────────────────────────────────── */
    timeSlots: {
        morning: [
            { time: "09:00", booked: false },
            { time: "09:30", booked: true },
            { time: "10:00", booked: false },
            { time: "10:30", booked: false },
            { time: "11:00", booked: true },
            { time: "11:30", booked: false }
        ],
        afternoon: [
            { time: "12:00", booked: false },
            { time: "12:30", booked: true },
            { time: "13:00", booked: false },
            { time: "13:30", booked: false },
            { time: "14:00", booked: true },
            { time: "14:30", booked: false },
            { time: "15:00", booked: false },
            { time: "15:30", booked: true }
        ],
        evening: [
            { time: "16:00", booked: false },
            { time: "16:30", booked: false },
            { time: "17:00", booked: true },
            { time: "17:30", booked: false },
            { time: "18:00", booked: false },
            { time: "18:30", booked: true },
            { time: "19:00", booked: false }
        ]
    },

    /* ── Bookings ───────────────────────────────────────────────── */
    bookings: [
        {
            id: 1,
            shopName: "The Noir Barbershop",
            service: "Fade & Line-Up",
            groomer: "Marcus Cole",
            date: "2026-03-10",
            time: "10:00",
            price: 45,
            status: "upcoming",
            imageSig: "barbershop-luxury"
        },
        {
            id: 2,
            shopName: "Glow & Grace Studio",
            service: "Precision Cut & Style",
            groomer: "Isla Chen",
            date: "2026-03-12",
            time: "14:30",
            price: 55,
            status: "upcoming",
            imageSig: "unisex-salon"
        },
        {
            id: 3,
            shopName: "Velvet Touch Salon",
            service: "Blowout & Waves",
            groomer: "Sophia Laurent",
            date: "2026-02-20",
            time: "11:00",
            price: 50,
            status: "completed",
            imageSig: "salon-women"
        },
        {
            id: 4,
            shopName: "Blade & Bristle",
            service: "Classic Haircut",
            groomer: "Jayden Brooks",
            date: "2026-02-15",
            time: "09:30",
            price: 35,
            status: "completed",
            imageSig: "barber-classic"
        }
    ],

    /* ── Explore Categories ─────────────────────────────────────── */
    exploreCategories: [
        { id: 1, name: "Beard Bars", icon: "🧔", color: "#C9A84C" },
        { id: 2, name: "Scalp Spas", icon: "💆", color: "#6B8E7B" },
        { id: 3, name: "Hot Towel Shaves", icon: "🪒", color: "#8B6F47" },
        { id: 4, name: "Hair Color Lab", icon: "🎨", color: "#7B5EA7" },
        { id: 5, name: "Luxury Facials", icon: "✨", color: "#4A7B8C" },
        { id: 6, name: "Bridal Packages", icon: "💐", color: "#A8577E" }
    ],

    /* ── AI Hairstyle Options (Optimized for User Preference) ───── */
    aiOptions: {
        men: [
            { id: "long_straight", label: "Classic Straight", preview: "💇‍♂️", styleId: "male_long_straight_black" },
            { id: "cornrows", label: "Cornrows", preview: "💇‍♂️", styleId: "male_dark_cornrows" },
            { id: "wooly_curls", label: "Natural Curls", preview: "💇‍♂️", styleId: "male_dark_wooly_curls" },
            { id: "parted_bangs", label: "Parted Bangs", preview: "💇‍♂️", styleId: "male_dark_parted_bangs" },
            { id: "flow", label: "Modern Flow", preview: "💇‍♂️", styleId: "male_dark_brown_flow" }
        ],
        women: [
            { 
                id: "long_wavy", label: "Long Wavy", preview: "💇‍♀️",
                colors: [
                    { id: "blonde", label: "Blonde", hex: "#FAF0BE", styleId: "female_long_wavy_blonde" }
                ]
            },
            { 
                id: "two_braid", label: "Two Braids", preview: "👧",
                colors: [
                    { id: "blonde", label: "Blonde", hex: "#FAF0BE", styleId: "female_two_braid_blonde" }
                ]
            },
            { 
                id: "pixie", label: "Pixie Cut", preview: "💇‍♀️",
                colors: [
                    { id: "pink", label: "Pink", hex: "#FF69B4", styleId: "female_pixie_pink" }
                ]
            }
        ]
    }
};
