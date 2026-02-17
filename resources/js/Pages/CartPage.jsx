// V BACKUP - BARU
import { Link, Head, usePage } from "@inertiajs/react";
import { useEffect, useState, useRef } from "react";
import { IconUpload, IconPhoto, IconX } from '@tabler/icons-react';

export default function CartPage({ auth }) {
    const {
        products,
        categories,
        csrf_token,
        transactions: serverTransactions,
    } = usePage().props;

    /* ===============================
        STATE
    =============================== */

    const [activeProductId, setActiveProductId] = useState(
        products?.[0]?.id ?? null,
    );

    const [activeTab, setActiveTab] = useState("checkout");

    const [imageLoading, setImageLoading] = useState({});

    // ✅ CART FROM LOCAL STORAGE
    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem("cart");
        return saved ? JSON.parse(saved) : [];
    });

    // ✅ CHECKOUT FORM FROM STORAGE
    const [checkoutData, setCheckoutData] = useState(() => {
        const saved = localStorage.getItem("checkoutData");
        const parsedData = saved
            ? JSON.parse(saved)
            : {
                  name: "",
                  phone: "",
                  address: "",
                  city: "",
                  province: "",
                  shippingOption: "",
                  payment: "COD",
              };

        // Ensure district is not used anymore
        delete parsedData.district;

        return parsedData;
    });

    // ✅ TRANSACTION HISTORY (seeded from server)
    const [transactions, setTransactions] = useState(
        () => serverTransactions || [],
    );
    const [loadingTransactions, setLoadingTransactions] = useState(false);
    // Transfer modal
    const [showTransferModal, setShowTransferModal] = useState(false);
    // QRIS modal
    const [showQRISModal, setShowQRISModal] = useState(false);
    
    // State untuk mengelola penggunaan alamat dari profil
    const [useProfileAddress, setUseProfileAddress] = useState(false);
    
    // State untuk upload bukti pembayaran
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);
    
    const bankDetails = {
        bank: "BCA",
        account: "1234567890",
        holder: "Sniffy Store",
    };

    /* ===============================
        CART HANDLER
    =============================== */

    const addToChart = (product) => {
        setCart((prev) => {
            const exist = prev.find((p) => p.id === product.id);

            if (exist) {
                return prev.map((p) =>
                    p.id === product.id ? { ...p, qty: p.qty + 1 } : p,
                );
            }

            return [...prev, { ...product, qty: 1 }];
        });
    };

    const removeFromCart = (productId) => {
        setCart((prev) =>
            prev
                .map((p) => (p.id === productId ? { ...p, qty: p.qty - 1 } : p))
                .filter((p) => p.qty > 0),
        );
    };

    /* ===============================
        FILE UPLOAD HANDLER
    =============================== */

    const handleFileChange = (file) => {
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            alert('Mohon upload file gambar (JPG, PNG, atau GIF)');
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    /* ===============================
        LOCAL STORAGE SYNC
    =============================== */

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        localStorage.setItem("checkoutData", JSON.stringify(checkoutData));
    }, [checkoutData]);

    // Set loading state when active product changes
    useEffect(() => {
        setImageLoading((prev) => ({
            ...prev,
            [activeProductId]: true,
        }));
    }, [activeProductId]);

    // Reset useProfileAddress when auth changes and prefill name and phone from authenticated user if available
    useEffect(() => {
        setUseProfileAddress(false); // Reset when auth changes

        if (auth?.user) {
            setCheckoutData((prev) => ({
                ...prev,
                name: prev.name || auth.user.name,
                phone: prev.phone || auth.user.phone || "",
                city: prev.city || auth.user.city || '',
                province: prev.province || auth.user.province || '',
                // Jika user punya address di profil, gunakan sebagai default
                address: prev.address || auth.user.address || prev.address,
            }));
            
            // Auto select profile address jika user memiliki address
            if (auth.user.address) {
                setUseProfileAddress(true);
            }
        }
    }, [auth]);

    // transactions are provided from server via Inertia props; no client-side fetch required

    /* ===============================
        WHATSAPP HANDLER
    =============================== */

    const normalizePhone = (phone) => {
        if (phone.startsWith("08")) return "62" + phone.slice(1);
        if (phone.startsWith("+62")) return phone.replace("+", "");
        return phone;
    };

    const handleConfirmCheckout = async () => {
        if (!checkoutData.phone.match(/^08[0-9]{8,11}$/)) {
            alert("Nomor WhatsApp tidak valid (gunakan 08xxxx)");
            return;
        }

        // Validate required fields
        if (!checkoutData.name || !checkoutData.phone || !checkoutData.address) {
            alert("Mohon lengkapi semua data pengiriman (Nama, No WhatsApp, Alamat).");
            return;
        }

        // Determine which city/province to use based on useProfileAddress
        const city = useProfileAddress ? auth.user?.city : checkoutData.city;
        const province = useProfileAddress ? auth.user?.province : checkoutData.province;

        // Validate city and province are filled
        if (!city || !province) {
            if (useProfileAddress) {
                alert("Alamat profil Anda belum lengkap. Mohon isi Kota dan Provinsi di halaman Profil sebelum melakukan pembayaran.");
            } else {
                alert("Mohon pilih lokasi pengiriman (Kota & Provinsi).");
            }
            return;
        }

        // Validate payment proof upload for non-COD payments
        if (checkoutData.payment !== 'COD' && !selectedFile) {
            alert("Mohon upload bukti pembayaran terlebih dahulu sebelum menyelesaikan transaksi.");
            // Scroll to upload area
            document.getElementById('payment-proof-upload')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        // Validate Jabodetabek location
        const jabodetabekCities = [
            "jakarta",
            "bogor",
            "depok",
            "tangerang",
            "bekasi",
        ];
        const isValidLocation = jabodetabekCities.some(
            (cityName) =>
                city.toLowerCase().includes(cityName) ||
                province.toLowerCase().includes(cityName),
        );

        if (!isValidLocation) {
            alert(
                "Maaf, kami hanya melayani pembelian untuk wilayah Jabodetabek (Jakarta, Bogor, Depok, Tangerang, Bekasi).",
            );
            return;
        }

        try {
            // Calculate shipping cost based on location and shipping option
            let shippingCost = 0;
            let baseShippingCost = 0;

            // Base shipping cost based on location
            if (city.toLowerCase().includes("jakarta")) {
                baseShippingCost = 15000; // Within Jakarta
            } else if (
                city.toLowerCase().includes("bekasi") ||
                city.toLowerCase().includes("depok") ||
                city.toLowerCase().includes("tangerang")
            ) {
                baseShippingCost = 20000; // Nearby areas
            } else if (city.toLowerCase().includes("bogor")) {
                baseShippingCost = 25000; // Further away
            } else {
                baseShippingCost = 30000; // Default for Jabodetabek
            }

            // Adjust shipping cost based on shipping option
            switch (checkoutData.shippingOption) {
                case "reguler":
                    shippingCost = baseShippingCost; // Standard rate
                    break;
                case "express":
                    shippingCost = baseShippingCost + 10000; // Additional fee for express
                    break;
                case "same_day":
                    shippingCost = baseShippingCost + 20000; // Additional fee for same day
                    break;
                default:
                    shippingCost = baseShippingCost; // Default to reguler if not selected
            }

            // Calculate grand total with shipping cost
            const baseGrandTotal = cart.reduce(
                (sum, item) => sum + item.sell_price * item.qty,
                0,
            );
            const grandTotalWithShipping = baseGrandTotal + shippingCost;

            // ✅ SAVE TRANSACTION TO DATABASE
            const response = await fetch("/cart/save-transaction", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": csrf_token,
                },
                body: JSON.stringify({
                    items: cart,
                    customer_name: checkoutData.name,
                    customer_phone: checkoutData.phone,
                    customer_address: checkoutData.address,
                    customer_city: city,
                    customer_province: province,
                    shipping_cost: shippingCost,
                    shipping_option: checkoutData.shippingOption,
                    payment_method: checkoutData.payment,
                    grand_total: grandTotalWithShipping,
                }),
            });

            // Check if response is ok
            if (!response.ok) {
                const errorText = await response.text();
                console.error("Server Error:", response.status, errorText);
                alert(
                    "Gagal menyimpan transaksi: Server error " +
                        response.status,
                );
                return;
            }

            const result = await response.json();

            if (!result.success) {
                alert("Gagal menyimpan transaksi: " + result.message);
                return;
            }

            // ✅ CLEAR CART AFTER CONFIRM
            setCart([]);
            localStorage.removeItem("cart");
            localStorage.removeItem("checkoutData");
            setSelectedFile(null);
            setPreviewUrl(null);
            setCheckoutData({
                name: "",
                phone: "",
                address: "",
                city: "",
                province: "",
                shippingOption: "",
                payment: "COD",
            });

            // ✅ REDIRECT BASED ON PAYMENT METHOD
            if (checkoutData.payment === 'COD') {
                // For COD, redirect to WhatsApp admin (for issues only)
                const adminPhone = "628115133959";
                const productList = cart
                    .map((p) => `- ${p.title} x${p.qty}`)
                    .join("%0A");

                const message = `
Halo Admin, saya sudah order COD:

Nama: ${checkoutData.name}
No HP: ${checkoutData.phone}
Alamat: ${checkoutData.address}, ${city}, ${province}

Pesanan:
${productList}

Total: Rp ${grandTotalWithShipping.toLocaleString("id-ID")}
Invoice: ${result.invoice}

Mohon segera diproses!
                `.trim();

                const waUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;
                window.location.href = waUrl;
            } else {
                // For Transfer/QRIS/E-Wallet, redirect to upload proof page
                window.location.href = route('transactions.upload-proof', result.invoice);
            }
        } catch (error) {
            console.error("Fetch Error:", error);
            alert("Error: " + error.message);
        }
    };

    const handleStartCheckout = () => {
        // Langsung proses checkout, tidak perlu modal lagi
        // Upload bukti sudah ada di form checkout
        handleConfirmCheckout();
    };

    /* ===============================
        ASSET LOADER
    =============================== */

    useEffect(() => {
        // Only load assets once
        const loadAssets = () => {
            // Load CSS
            const vendorCss = document.createElement("link");
            vendorCss.rel = "stylesheet";
            vendorCss.href = "/css/vendor.css";
            if (!document.querySelector('link[href="/css/vendor.css"]')) {
                document.head.appendChild(vendorCss);
            }

            const stylesCss = document.createElement("link");
            stylesCss.rel = "stylesheet";
            stylesCss.href = "/css/styles.css";
            if (!document.querySelector('link[href="/css/styles.css"]')) {
                document.head.appendChild(stylesCss);
            }

            // Load JavaScript
            const pluginsScript = document.createElement("script");
            pluginsScript.src = "/js/plugins.js";
            if (!document.querySelector('script[src="/js/plugins.js"]')) {
                document.body.appendChild(pluginsScript);
            }

            const mainScript = document.createElement("script");
            mainScript.src = "/js/main.js";
            if (!document.querySelector('script[src="/js/main.js"]')) {
                document.body.appendChild(mainScript);
            }
        };

        loadAssets();
    }, []);

    /* ===============================
        RENDER
    =============================== */

    return (
        <>
            <Head>
                <title>Sniffy - Premium Perfume Store</title>
            </Head>

            <header className="s-header">
                <div className="container s-header__content">
                    <div className="s-header__block">
                        <div className="header-logo">
                            <Link className="logo" href="/">
                                <img
                                    src="/images/logo-perfume.png"
                                    alt="Homepage"
                                />
                            </Link>
                        </div>
                        <a className="header-menu-toggle" href="#0">
                            <span>Menu</span>
                        </a>
                    </div>

                    <nav className="header-nav">
                        <ul className="header-nav__links">
                            <Link
                                href="/"
                                className="text-gray-200 hover:text-white transition-colors font-medium"
                            >
                                Home
                            </Link>

                            <Link
                                href="/gallery"
                                className="text-gray-200 hover:text-white transition-colors font-medium"
                            >
                                Gallery
                            </Link>

                            <Link
                                href="/cart"
                                className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                            >
                                Chart
                            </Link>

                            {auth.user ? (
                                <Link
                                    href={route("profile.edit")}
                                    className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                                >
                                    Profile
                                </Link>
                            ) : (
                                <></>
                            )}
                        </ul>

                        <div className="header-contact flex">
                            <ul className="header-nav__links">
                                {auth.user ? (
                                    <li className="current flex ">
                                        <Link
                                            href="/dashboard"
                                            className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                                        >
                                            Dashboard
                                        </Link>
                                    </li>
                                ) : (
                                    <>
                                        <li>
                                            <Link
                                                href="/login"
                                                className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                                            >
                                                Log in
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                href="/register"
                                                className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                                            >
                                                Register
                                            </Link>
                                        </li>
                                    </>
                                )}
                            </ul>
                        </div>
                    </nav>
                </div>
            </header>

            {/* ================= TAB NAVIGATION ================= */}
            <div className="container s-menu target-section py-8">
                <div className="flex gap-4 mb-8 border-b border-white/30">
                    <button
                        onClick={() => setActiveTab("checkout")}
                        className={`px-6 py-3 font-semibold transition-all ${
                            activeTab === "checkout"
                                ? "text-white border-b-2 border-white"
                                : "text-white/50 hover:text-white"
                        }`}
                    >
                        Keranjang ({cart.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("history")}
                        className={`px-6 py-3 font-semibold transition-all ${
                            activeTab === "history"
                                ? "text-white border-b-2 border-white"
                                : "text-white/50 hover:text-white"
                        }`}
                    >
                        Riwayat ({transactions.length})
                    </button>
                </div>

                {/* ================= CHECKOUT TAB ================= */}
                {activeTab === "checkout" && (
                    <div className="max-w-2xl mx-auto">
                        {cart.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-white/60 text-xl mb-4">
                                    Keranjang Anda masih kosong
                                </p>
                                <button
                                    onClick={() => setActiveTab("gallery")}
                                    className="bg-white text-black px-6 py-2 rounded-lg font-semibold hover:bg-white/90 transition-colors"
                                >
                                    Lanjut Belanja
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Cart Items */}
                                <div className="bg-black/40 border border-white/30 rounded-xl p-6">
                                    <h3 className="text-2xl font-semibold text-white mb-4">
                                        Pesanan Anda
                                    </h3>
                                    <ul className="space-y-3">
                                        {cart.map((item) => (
                                            <li
                                                key={item.id}
                                                className="flex justify-between items-center border-b border-white/20 pb-3"
                                            >
                                                <span className="text-white">
                                                    {item.title} x {item.qty}
                                                </span>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-white/70">
                                                        Rp{" "}
                                                        {Number(
                                                            item.sell_price *
                                                                item.qty,
                                                        ).toLocaleString(
                                                            "id-ID",
                                                        )}
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            removeFromCart(
                                                                item.id,
                                                            )
                                                        }
                                                        className="text-red-400 hover:text-red-300 font-bold"
                                                    >
                                                        −
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="mt-6 pt-6 border-t border-white/30 flex justify-between items-center">
                                        <span className="text-xl text-white font-semibold">
                                            Total:
                                        </span>
                                        <span className="text-2xl text-white font-bold">
                                            Rp{" "}
                                            {Number(
                                                cart.reduce(
                                                    (sum, item) =>
                                                        sum +
                                                        item.sell_price *
                                                            item.qty,
                                                    0,
                                                ),
                                            ).toLocaleString("id-ID")}
                                        </span>
                                    </div>
                                </div>

                                {/* Checkout Form */}
                                <div className="bg-black/40 border border-white/30 rounded-xl p-6 space-y-4">
                                    <h1 className="text-4xl font-bold text-white mb-4">
                                        Data Pengiriman
                                    </h1>

                                    <div className="py-4">
                                        <label className="block text-white/70 mb-2">
                                            Nama
                                        </label>
                                        <input
                                            placeholder="Masukkan nama Anda"
                                            className="w-full p-3 text-2xl bg-black border border-white/30 text-white rounded-lg focus:border-white transition-colors"
                                            value={checkoutData.name}
                                            disabled={auth.user ? true : false}
                                            onChange={(e) =>
                                                setCheckoutData({
                                                    ...checkoutData,
                                                    name: e.target.value,
                                                })
                                            }
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-white/70 mb-2">
                                            No WhatsApp
                                        </label>
                                        <input
                                            placeholder="08xxxx"
                                            className="w-full p-3 text-2xl bg-black border border-white/30 text-white rounded-lg focus:border-white transition-colors"
                                            value={
                                                checkoutData.phone ||
                                                auth.user?.phone ||
                                                ""
                                            }
                                            disabled={
                                                auth.user?.phone ? true : false
                                            }
                                            onChange={(e) =>
                                                setCheckoutData({
                                                    ...checkoutData,
                                                    phone: e.target.value,
                                                })
                                            }
                                        />
                                        {auth.user?.phone && (
                                            <p className="text-2xl text-white/50 mt-1">
                                                Nomor diambil dari profil Anda:{" "}
                                                {auth.user.phone}
                                            </p>
                                        )}
                                    </div>

                                    {/* Lokasi Pengiriman hanya muncul jika menggunakan alamat baru */}
                                    {!useProfileAddress && (
                                        <div>
                                            <label className="block text-white/70 mb-2">
                                                Lokasi Pengiriman
                                            </label>
                                            <select
                                                className="w-full p-3 bg-black border border-white/30 text-white rounded-lg focus:border-white transition-colors"
                                                value={`${checkoutData.city},${checkoutData.province}`}
                                                onChange={(e) => {
                                                    const [city, province] =
                                                        e.target.value.split(",");
                                                    setCheckoutData({
                                                        ...checkoutData,
                                                        city: city,
                                                        province: province,
                                                    });
                                                }}
                                            >
                                                <option value="">
                                                    Pilih Lokasi Pengiriman
                                                </option>
                                                <option value="jakarta,Jakarta">
                                                    Jakarta
                                                </option>
                                                <option value="bogor,Jawa Barat">
                                                    Bogor
                                                </option>
                                                <option value="depok,Jawa Barat">
                                                    Depok
                                                </option>
                                                <option value="tangerang,Banten">
                                                    Tangerang
                                                </option>
                                                <option value="bekasi,Jawa Barat">
                                                    Bekasi
                                                </option>
                                            </select>
                                        </div>
                                    )}

                                    {/* Pilihan alamat */}
                                    <div className="mb-4">
                                        <label className="block text-white/70 mb-2">
                                            Pilihan Alamat
                                        </label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {/* Pilihan menggunakan alamat dari profil */}
                                            {auth.user?.address && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setUseProfileAddress(true);
                                                        setCheckoutData({
                                                            ...checkoutData,
                                                            address: auth.user.address,
                                                            city: auth.user.city || '',
                                                            province: auth.user.province || '',
                                                        });
                                                    }}
                                                    className={`p-4 text-left rounded-lg border transition-all relative ${
                                                        useProfileAddress
                                                            ? 'bg-blue-500/20 border-blue-400 text-white'
                                                            : 'bg-black/30 border-white/30 text-white/70 hover:border-white/50'
                                                    }`}
                                                >
                                                    {/* Warning badge jika city/province kosong */}
                                                    {(!auth.user?.city || !auth.user?.province) && (
                                                        <span className="absolute top-2 right-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-semibold">
                                                            ⚠️ Belum Lengkap
                                                        </span>
                                                    )}
                                                    <div className="flex items-start">
                                                        <div className={`mr-3 mt-1 flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center ${
                                                            useProfileAddress
                                                                ? 'border-blue-400 bg-blue-500'
                                                                : 'border-white/50'
                                                        }`}>
                                                            {useProfileAddress && (
                                                                <div className="w-2 h-2 rounded-full bg-white"></div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold">Alamat dari Profil</div>
                                                            <div className="text-sm mt-1">{auth.user.address}</div>
                                                            {(auth.user?.city || auth.user?.province) ? (
                                                                <div className="text-sm text-white/50 mt-1">
                                                                    {auth.user.city}{auth.user.city && auth.user.province && ', '}{auth.user.province}
                                                                </div>
                                                            ) : (
                                                                <div className="text-sm text-yellow-400 mt-1">
                                                                    ⚠️ Kota dan Provinsi belum diisi
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </button>
                                            )}
                                            
                                            {/* Pilihan menggunakan alamat baru */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setUseProfileAddress(false);
                                                    setCheckoutData({
                                                        ...checkoutData,
                                                        address: '',
                                                        city: '',
                                                        province: '',
                                                    });
                                                }}
                                                className={`p-4 text-left rounded-lg border transition-all ${
                                                    !useProfileAddress
                                                        ? 'bg-blue-500/20 border-blue-400 text-white'
                                                        : 'bg-black/30 border-white/30 text-white/70 hover:border-white/50'
                                                }`}
                                            >
                                                <div className="flex items-start">
                                                    <div className={`mr-3 mt-1 flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center ${
                                                        !useProfileAddress
                                                            ? 'border-blue-400 bg-blue-500'
                                                            : 'border-white/50'
                                                    }`}>
                                                        {!useProfileAddress && (
                                                            <div className="w-2 h-2 rounded-full bg-white"></div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold">Alamat Baru</div>
                                                        <div className="text-sm mt-1">Masukkan alamat pengiriman baru</div>
                                                    </div>
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Form alamat baru hanya muncul jika dipilih */}
                                    {!useProfileAddress && (
                                        <div className="mb-4">
                                            <label className="block text-white/70 mb-2">
                                                Masukkan Alamat Baru
                                            </label>
                                            <textarea
                                                placeholder="Contoh: Jl. Raya Bogor No. 123, RT 001/RW 002, Kelurahan Sukamaju, Kecamatan Ciomas, Kota Bogor"
                                                className="w-full p-3 bg-black border border-white/30 text-white rounded-lg focus:border-white transition-colors h-20"
                                                value={checkoutData.address}
                                                onChange={(e) =>
                                                    setCheckoutData({
                                                        ...checkoutData,
                                                        address: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                    )}

                                    {/* Upload Bukti Pembayaran - Hanya muncul untuk Transfer/QRIS/E-Wallet */}
                                    {checkoutData.payment !== 'COD' && (
                                        <div id="payment-proof-upload" className="mb-4">
                                            <label className="block text-white/70 mb-2">
                                                Bukti Pembayaran <span className="text-red-400">*</span>
                                            </label>
                                            
                                            {/* Payment Info */}
                                            <div className="bg-blue-500/20 border border-blue-400 rounded-lg p-4 mb-4">
                                                <h4 className="text-white font-semibold mb-3">Informasi Pembayaran</h4>
                                                
                                                {checkoutData.payment === 'Transfer' && (
                                                    <div className="space-y-2 text-white">
                                                        <p className="text-white/70">Silakan transfer ke rekening berikut:</p>
                                                        <div className="bg-black/40 p-4 rounded-lg">
                                                            <p className="text-white font-semibold text-lg">{bankDetails.bank}</p>
                                                            <p className="text-white">No. Rek: <span className="font-mono text-xl">{bankDetails.account}</span></p>
                                                            <p className="text-white">Atas Nama: {bankDetails.holder}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {checkoutData.payment === 'QRIS' && (
                                                    <div className="space-y-2 text-white">
                                                        <p className="text-white/70">Scan QRIS di bawah ini untuk pembayaran:</p>
                                                        <div className="flex justify-center">
                                                            <div className="bg-white p-4 rounded-lg">
                                                                <img
                                                                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzG4iI7zGqTlLN07XToN_hS_IOr6lvuJok2A&s"
                                                                    alt="QRIS Code"
                                                                    className="w-48 h-48 object-contain"
                                                                />
                                                            </div>
                                                        </div>
                                                        <p className="text-center text-sm">Scan dengan aplikasi e-wallet Anda</p>
                                                    </div>
                                                )}
                                                
                                                {checkoutData.payment === 'E-Wallet' && (
                                                    <div className="space-y-2 text-white">
                                                        <p className="text-white/70">Pembayaran E-Wallet:</p>
                                                        <div className="bg-black/40 p-4 rounded-lg text-center">
                                                            <p className="text-white">DANA / OVO / GOPAY / LINKAJA</p>
                                                            <p className="text-white font-mono text-xl">0811-5133-959</p>
                                                            <p className="text-white text-sm">a.n Sniffy Store</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Upload Area */}
                                            <div
                                                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                                                    dragActive
                                                        ? 'border-blue-500 bg-blue-500/20'
                                                        : 'border-white/30 hover:border-white/50'
                                                }`}
                                                onDragEnter={handleDrag}
                                                onDragLeave={handleDrag}
                                                onDragOver={handleDrag}
                                                onDrop={handleDrop}
                                            >
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileChange(e.target.files[0])}
                                                />

                                                {previewUrl ? (
                                                    <div className="space-y-4">
                                                        <div className="relative inline-block">
                                                            <img
                                                                src={previewUrl}
                                                                alt="Preview"
                                                                className="max-h-64 rounded-lg shadow-md mx-auto"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedFile(null);
                                                                    setPreviewUrl(null);
                                                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                                                }}
                                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                            >
                                                                <IconX size={16} />
                                                            </button>
                                                        </div>
                                                        <p className="text-sm text-white/70">
                                                            {selectedFile?.name}
                                                        </p>
                                                        <p className="text-xs text-green-400">✓ File siap untuk diupload</p>
                                                    </div>
                                                ) : (
                                                    <div
                                                        className="cursor-pointer"
                                                        onClick={() => fileInputRef.current?.click()}
                                                    >
                                                        <div className="flex flex-col items-center gap-3">
                                                            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                                                                <IconUpload size={24} className="text-white" />
                                                            </div>
                                                            <div>
                                                                <p className="text-white font-medium">
                                                                    Klik untuk upload atau drag & drop
                                                                </p>
                                                                <p className="text-sm text-white/50 mt-1">
                                                                    Format: JPG, PNG, GIF (Max 5MB)
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Upload Instructions */}
                                            <div className="mt-3 bg-yellow-500/20 border border-yellow-400 rounded-lg p-3">
                                                <div className="flex items-start gap-2">
                                                    <IconPhoto size={18} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                                                    <div className="text-xs text-yellow-200">
                                                        <p className="font-semibold mb-1">Instruksi:</p>
                                                        <ul className="list-disc list-inside space-y-1 text-yellow-100/80">
                                                            <li>Screenshot/foto bukti pembayaran dengan jelas</li>
                                                            <li>Pastikan semua informasi terbaca</li>
                                                            <li>Ukuran file maksimal 5MB</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-white/70 mb-2">
                                                Metode Pembayaran
                                            </label>
                                            <select
                                                className="w-full p-3 bg-black border border-white/30 text-white rounded-lg focus:border-white transition-colors"
                                                value={checkoutData.payment}
                                                onChange={(e) =>
                                                    setCheckoutData({
                                                        ...checkoutData,
                                                        payment: e.target.value,
                                                    })
                                                }
                                            >
                                                <option value="COD">COD</option>
                                                <option value="Transfer">
                                                    Transfer
                                                </option>
                                                <option value="E-Wallet">
                                                    E-Wallet
                                                </option>
                                                <option value="QRIS">
                                                    QRIS
                                                </option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-white/70 mb-2">
                                                Jenis Pengantaran
                                            </label>
                                            <select
                                                className="w-full p-3 bg-black border border-white/30 text-white rounded-lg focus:border-white transition-colors"
                                                value={
                                                    checkoutData.shippingOption ||
                                                    ""
                                                }
                                                onChange={(e) =>
                                                    setCheckoutData({
                                                        ...checkoutData,
                                                        shippingOption:
                                                            e.target.value,
                                                    })
                                                }
                                            >
                                                <option value="">
                                                    Pilih Jenis Pengantaran
                                                </option>
                                                <option value="reguler">
                                                    Reguler (2-3 hari kerja)
                                                </option>
                                                <option value="express">
                                                    Express (1 hari kerja)
                                                </option>
                                                <option value="same_day">
                                                    Same Day (hari yang sama)
                                                </option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            onClick={() =>
                                                setActiveTab("gallery")
                                            }
                                            className="flex-1 border border-white px-4 py-3 text-white hover:bg-white/10 rounded-lg font-semibold transition-colors"
                                        >
                                            Lanjut Belanja
                                        </button>

                                        <button
                                            onClick={handleStartCheckout}
                                            className="flex-1 bg-white text-black px-4 py-3 rounded-lg font-semibold hover:bg-white/90 transition-colors"
                                        >
                                            Konfirmasi Order
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Transfer Modal */}
                {showTransferModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div
                            className="absolute inset-0 bg-black/60"
                            onClick={() => setShowTransferModal(false)}
                        />

                        <div className="relative bg-black/90 border border-white/30 rounded-xl p-6 w-full max-w-md z-10">
                            <h3 className="text-2xl font-semibold text-white mb-4">
                                Informasi Transfer
                            </h3>

                            <div className="space-y-2 mb-4">
                                <p className="text-white/70">
                                    Silakan transfer ke rekening berikut:
                                </p>
                                <div className="bg-black/40 p-4 rounded-lg">
                                    <p className="text-white font-semibold">
                                        {bankDetails.bank}
                                    </p>
                                    <p className="text-white">
                                        No. Rek: {bankDetails.account}
                                    </p>
                                    <p className="text-white">
                                        Atas Nama: {bankDetails.holder}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowTransferModal(false)}
                                    className="flex-1 border border-white px-4 py-3 text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
                                >
                                    Tutup
                                </button>

                                <button
                                    onClick={handleConfirmTransfer}
                                    className="flex-1 bg-white text-black px-4 py-3 rounded-lg font-semibold hover:bg-white/90 transition-colors"
                                >
                                    Konfirmasi Pembayaran
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* QRIS Modal */}
                {showQRISModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div
                            className="absolute inset-0 bg-black/60"
                            onClick={() => setShowQRISModal(false)}
                        />

                        <div className="relative bg-black/90 border border-white/30 rounded-xl p-6 w-full max-w-md z-10">
                            <h3 className="text-2xl font-semibold text-white mb-4">
                                Pembayaran QRIS
                            </h3>

                            <div className="space-y-4 mb-6">
                                <p className="text-white/70 text-center">
                                    Scan QRIS di bawah ini untuk melakukan pembayaran
                                </p>
                                
                                {/* QRIS image */}
                                <div className="flex justify-center">
                                    <div className="bg-white p-4 rounded-lg">
                                        <img 
                                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzG4iI7zGqTlLN07XToN_hS_IOr6lvuJok2A&s" 
                                            alt="QRIS Code" 
                                            className="w-48 h-48 object-contain"
                                        />
                                    </div>
                                </div>
                                
                                <p className="text-white/70 text-center text-xl">
                                    Setelah melakukan pembayaran, klik tombol "Sudah Bayar"
                                </p>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowQRISModal(false)}
                                    className="flex-1 border border-white px-4 py-3 text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
                                >
                                    Batalkan
                                </button>

                                <button
                                    onClick={handleConfirmQRIS}
                                    className="flex-1 bg-white text-black px-4 py-3 rounded-lg font-semibold hover:bg-white/90 transition-colors"
                                >
                                    Sudah Bayar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ================= HISTORY TAB ================= */}
                {activeTab === "history" && (
                    <div className="max-w-4xl mx-auto">
                        {loadingTransactions ? (
                            <div className="text-center py-12">
                                <p className="text-white/60 text-xl">
                                    Loading...
                                </p>
                            </div>
                        ) : transactions.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-white/60 text-xl mb-4">
                                    Belum ada riwayat transaksi
                                </p>
                                <button
                                    onClick={() => setActiveTab("gallery")}
                                    className="bg-white text-black px-6 py-2 rounded-lg font-semibold hover:bg-white/90 transition-colors"
                                >
                                    Mulai Belanja
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {transactions.map((transaction) => (
                                    <article
                                        key={transaction.id}
                                        className="bg-black/40 border border-white/10 rounded-2xl p-5 sm:p-6 backdrop-blur"
                                    >
                                        {/* HEADER */}
                                        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                                            <div>
                                                <p className="text-xl mt-4 sm:text-2xl font-semibold text-white">
                                                    Invoice :{" "}
                                                    {transaction.invoice}
                                                </p>
                                                <p className="text-xl text-white/50 mt-1">
                                                    {transaction.created_at}
                                                </p>
                                            </div>

                                            <div className="flex justify-center border-white items-center gap-3">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-2xl font-semibold uppercase tracking-wide
                            ${
                                transaction.status === "completed"
                                    ? "bg-green-500/20 text-green-300"
                                    : transaction.status === "pending"
                                      ? "bg-yellow-500/20 text-yellow-300"
                                      : "bg-red-500/20 text-red-300"
                            }`}
                                                >
                                                    {transaction.status}
                                                </span>

                                                <button
                                                    onClick={() =>
                                                        window.open(
                                                            `/transactions/${transaction.invoice}/print`,
                                                            "_blank",
                                                        )
                                                    }
                                                    className="px-4 py-1.5 text-xl border border-white/10 rounded-lg text-white/80 hover:bg-white/5 hover:text-white transition"
                                                >
                                                    Print
                                                </button>
                                            </div>
                                        </header>

                                        {/* INFO */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                            <div className="sm:col-span-2 bg-white/5 rounded-xl p-4 space-y-1">
                                                <p className="text-white">
                                                    <span className="text-white/50">
                                                        Nama:
                                                    </span>{" "}
                                                    {transaction.customer_name}
                                                </p>
                                                <p className="text-white">
                                                    <span className="text-white/50">
                                                        WhatsApp:
                                                    </span>{" "}
                                                    {transaction.customer_phone}
                                                </p>
                                                <p className="text-white">
                                                    <span className="text-white/50">
                                                        Alamat:
                                                    </span>{" "}
                                                    {
                                                        transaction.customer_address
                                                    }
                                                </p>
                                            </div>

                                            <div className="bg-white/5 rounded-xl p-4">
                                                <p className="text-white/60 text-sm">
                                                    Metode Pembayaran
                                                </p>
                                                <p className="text-white font-medium mb-4">
                                                    {transaction.payment_method}
                                                </p>

                                                <p className="text-white/60 text-sm">
                                                    Total
                                                </p>
                                                <p className="text-2xl font-bold text-white">
                                                    Rp{" "}
                                                    {Number(
                                                        transaction.grand_total,
                                                    ).toLocaleString("id-ID")}
                                                </p>
                                            </div>
                                        </div>

                                        {/* ITEMS */}
                                        <div className="overflow-hidden rounded-xl border border-white/10">
                                            <table className="w-full text-left border-collapse">
                                                <thead className="bg-white/5">
                                                    <tr className="text-xs uppercase tracking-wide text-white/50">
                                                        <th className="py-3 px-4">
                                                            Produk
                                                        </th>
                                                        <th className="py-3 px-4 w-20 text-center">
                                                            Qty
                                                        </th>
                                                        <th className="py-3 px-4 text-right">
                                                            Subtotal
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {transaction.items.map(
                                                        (item, idx) => (
                                                            <tr
                                                                key={idx}
                                                                className="border-t border-white/5 text-white/80"
                                                            >
                                                                <td className="py-3 px-4">
                                                                    {
                                                                        item.product_name
                                                                    }
                                                                </td>
                                                                <td className="py-3 px-4 text-center">
                                                                    {item.qty}
                                                                </td>
                                                                <td className="py-3 px-4 text-right">
                                                                    Rp{" "}
                                                                    {Number(
                                                                        item.subtotal,
                                                                    ).toLocaleString(
                                                                        "id-ID",
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ),
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* footer section */}
            <footer id="footer" className="container s-footer mt-20">
                <div className="row s-footer__top row-x-center">
                    <div className="column xl-6 lg-8 md-10 footer-block footer-newsletter">
                        <h5>
                            Subscribe to our mailing list for <br />
                            updates, news, and exclusive offers.
                        </h5>

                        <div className="subscribe-form">
                            <form id="mc-form" className="mc-form">
                                <div className="mc-input-wrap">
                                    <input
                                        type="email"
                                        name="EMAIL"
                                        id="mce-EMAIL"
                                        placeholder="Your Email Address"
                                        title="The domain portion of the email address is invalid (the portion after the @)."
                                        pattern="^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*(\.\w{2,})+$"
                                        required
                                    />
                                    <input
                                        type="submit"
                                        name="subscribe"
                                        value="Subscribe"
                                        className="btn btn--primary"
                                    />
                                </div>
                                <div className="mc-status"></div>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="row s-footer__main">
                    <div className="column xl-3 lg-12 footer-block s-footer__main-start">
                        <div className="s-footer__logo">
                            <Link className="logo" href="/">
                                <img src="/images/logo.svg" alt="Homepage" />
                            </Link>
                        </div>

                        <ul className="s-footer__social social-list">
                            <li>
                                <a href="#0">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        style={{
                                            fill: "rgba(0, 0, 0, 1)",
                                            transform: "",
                                            msFilter: "",
                                        }}
                                    >
                                        <path d="M20,3H4C3.447,3,3,3.448,3,4v16c0,0.552,0.447,1,1,1h8.615v-6.96h-2.338v-2.725h2.338v-2c0-2.325,1.42-3.592,3.5-3.592 c0.699-0.002,1.399,0.034,2.095,0.107v2.42h-1.435c-1.128,0-1.348,0.538-1.348,1.325v1.735h2.697l-0.35,2.725h-2.348V21H20 c0.553,0,1-0.448,1-1V4C21,3.448,20.553,3,20,3z"></path>
                                    </svg>
                                    <span className="u-screen-reader-text">
                                        Facebook
                                    </span>
                                </a>
                            </li>
                            <li>
                                <a href="#0">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        style={{
                                            fill: "rgba(0, 0, 0, 1)",
                                            transform: "",
                                            msFilter: "",
                                        }}
                                    >
                                        <path d="m20.665 3.717-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0,.663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"></path>
                                    </svg>
                                    <span className="u-screen-reader-text">
                                        Telegram
                                    </span>
                                </a>
                            </li>
                            <li>
                                <a href="#0">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        style={{
                                            fill: "rgba(0, 0, 0, 1)",
                                            transform: "",
                                            msFilter: "",
                                        }}
                                    >
                                        <path d="M11.999,7.377c-2.554,0-4.623,2.07-4.623,4.623c0,2.554,2.069,4.624,4.623,4.624c2.552,0,4.623-2.07,4.623-4.624 C16.622,9.447,14.551,7.377,11.999,7.377L11.999,7.377z M11.999,15.004c-1.659,0-3.004-1.345-3.004-3.003 c0-1.659,1.345-3.003,3.004-3.003s3.002,1.344,3.002,3.003C15.001,13.659,13.658,15.004,11.999,15.004L11.999,15.004z"></path>
                                        <circle
                                            cx="16.806"
                                            cy="7.207"
                                            r="1.078"
                                        ></circle>
                                        <path d="M20.533,6.111c-0.469-1.209-1.424-2.165-2.633-2.632c-0.699-0.263-1.438-0.404-2.186-0.42 c-0.963-0.042-1.268-0.054-3.71-0.054s-2.755,0-3.71,0.054C7.548,3.074,6.809,3.215,6.11,3.479C4.9,3.946,3.945,4.902,3.477,6.111 c-0.263,0.7-0.404,1.438-0.419,2.186c-0.043,0.962-0.056,1.267-0.056,3.71c0,2.442,0,2.753,0.056,3.71 c0.015,0.748,0.156,1.486,0.419,2.187c0.469,1.208,1.424,2.164,2.634,2.632c0.696,0.272,1.435,0.426,2.185,0.45 c0.963,0.042,1.268,0.055,3.71,0.055s2.755,0,3.71-0.055c0.747-0.015,1.486-0.157,2.186-0.419c1.209-0.469,2.164-1.424,2.633-2.633 c0.263-0.7,0.404-1.438,0.419-2.186c0.043-0.962,0.056-1.267,0.056-3.71s0-2.753-0.056-3.71C20.941,7.57,20.801,6.819,20.533,6.111z M19.315,15.643c-0.007,0.576-0.111,1.147-0.311,1.688c-0.305,0.787-0.926,1.409-1.712,1.711c-0.535,0.199-1.099,0.303-1.67,0.311 c-0.95,0.044-1.218,0.055-3.654,0.055c-2.438,0-2.687,0-3.655-0.055c-0.569-0.007-1.135-0.112-1.669-0.311 c-0.789-0.301-1.414-0.923-1.719-1.711c-0.196-0.534-0.302-1.099-0.311-1.669c-0.043-0.95-0.053-1.218-0.053-3.654 c0-2.437,0-2.686,0.053-3.655c0.007-0.576,0.111-1.146,0.311-1.687c0.305-0.789,0.93-1.41,1.719-1.712 c0.534-0.198,1.1-0.303,1.669-0.311c0.951-0.043,1.218-0.055,3.655-0.055c2.437,0,2.687,0,3.654,0.055 c0.571,0.007,1.135,0.112,1.67,0.311c0.786,0.303,1.407,0.925,1.712,1.712c0.196,0.534,0.302,1.099,0.311,1.669 c0.043,0.951,0.054,1.218,0.054,3.655c0,2.436,0,2.698-0.043,3.654H19.315z"></path>
                                    </svg>
                                    <span className="u-screen-reader-text">
                                        Instagram
                                    </span>
                                </a>
                            </li>
                            <li>
                                <a href="#0">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        style={{
                                            fill: "rgba(0, 0, 0, 1)",
                                            transform: "",
                                            msFilter: "",
                                        }}
                                    >
                                        <path d="M8.31 10.28a2.5 2.5 0 1 0 2.5 2.49 2.5 2.5 0 0 0-2.5-2.49zm0 3.8a1.31 1.31 0 1 1 0-2.61 1.31 1.31 0 1 1 0 2.61zm7.38-3.8a2.5 2.5 0 1 0 2.5 2.49 2.5 2.5 0 0 0-2.5-2.49zM17 12.77a1.31 1.31 0 1 1-1.31-1.3 1.31 1.31 0 0 1 1.31 1.3z"></path>
                                        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm7.38 10.77a3.69 3.69 0 0 1-6.2 2.71L12 16.77l-1.18-1.29a3.69 3.69 0 1 1-5-5.44l-1.2-1.3H7.3a8.33 8.33 0 0 1 9.41 0h2.67l-1.2 1.31a3.71 3.71 0 0 1 1.2 2.72z"></path>
                                        <path d="M14.77 9.05a7.19 7.19 0 0 0-5.54 0A4.06 4.06 0 0 1 12 12.7a4.08 4.08 0 0 1 2.77-3.65z"></path>
                                    </svg>
                                    <span className="u-screen-reader-text">
                                        Tripadvisor
                                    </span>
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div className="column xl-9 lg-12 s-footer__main-end grid-cols grid-cols--wrap">
                        <div className="grid-cols__column footer-block">
                            <h6>Contacts</h6>
                            <ul className="link-list">
                                <li>
                                    <a href="mailto:#0">contact@lounge.com</a>
                                </li>
                                <li>
                                    <a href="tel:+2135551212">
                                        (213) 555-123-3456
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="row s-footer__bottom">
                    <div className="column xl-6 lg-12">
                        <p className="ss-copyright">
                            <span>© Lounge 2025</span>
                            <span>
                                Design by{" "}
                                <a href="https://styleshout.com/">StyleShout</a>
                            </span>
                            Distributed by{" "}
                            <a
                                href="https://themewagon.com"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                ThemeWagon
                            </a>
                        </p>
                    </div>
                </div>

                {/* <div className="ss-go-top">
                    <a className="smoothscroll" title="Back to Top" href="#top">
                        <svg
                            clipRule="evenodd"
                            fillRule="evenodd"
                            strokeLinejoin="round"
                            strokeMiterlimit="2"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="m14.523 18.787s4.501-4.505 6.255-6.26c.146-.146.219-.338.219-.53s-.073-.383-.219-.53c-1.753-1.754-6.255-6.258-6.255-6.258-.144-.145-.334-.217-.524-.217-.193 0-.385.074-.532.221-.293.292-.295.766-.004 1.056l4.978 4.978h-14.692c-.414 0-.75.336-.75.75s.336.75.75.75h14.692l-4.979 4.979c-.289.289-.286.762.006 1.054.148.148.341.222.533.222.19 0 .378-.072.522-.215z"
                                fillRule="nonzero"
                            />
                        </svg>
                    </a>
                    <span>Back To Top</span>
                </div> */}
            </footer>
        </>
    );
}
