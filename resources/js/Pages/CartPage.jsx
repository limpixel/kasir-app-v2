// V BACKUP - BARU
import { Link, Head, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";

export default function CartPage({ auth }) {
    const { products, categories, csrf_token, transactions: serverTransactions } = usePage().props;

    /* ===============================
        STATE
    =============================== */

    const [activeProductId, setActiveProductId] = useState(
        products?.[0]?.id ?? null,
    );

    const [activeTab, setActiveTab] = useState("gallery");

    const [imageLoading, setImageLoading] = useState({});

    // ✅ CART FROM LOCAL STORAGE
    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem("cart");
        return saved ? JSON.parse(saved) : [];
    });

    // ✅ CHECKOUT FORM FROM STORAGE
    const [checkoutData, setCheckoutData] = useState(() => {
        const saved = localStorage.getItem("checkoutData");
        return saved
            ? JSON.parse(saved)
            : {
                  name: "",
                  phone: "",
                  address: "",
                  payment: "COD",
              };
    });

    // ✅ TRANSACTION HISTORY (seeded from server)
    const [transactions, setTransactions] = useState(() => serverTransactions || []);
    const [loadingTransactions, setLoadingTransactions] = useState(false);
    // Transfer modal
    const [showTransferModal, setShowTransferModal] = useState(false);
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

    // Prefill name from authenticated user if available
    useEffect(() => {
        if (auth?.user && !checkoutData.name) {
            setCheckoutData((prev) => ({ ...prev, name: auth.user.name }));
        }
    }, [auth, checkoutData.name]);

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

        try {
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
                    payment_method: checkoutData.payment,
                    grand_total: cart.reduce(
                        (sum, item) => sum + item.sell_price * item.qty,
                        0,
                    ),
                }),
            });

            // Check if response is ok
            if (!response.ok) {
                const errorText = await response.text();
                console.error("Server Error:", response.status, errorText);
                alert(
                    "Gagal menyimpan transaksi: Server error " + response.status
                );
                return;
            }

            const result = await response.json();

            if (!result.success) {
                alert("Gagal menyimpan transaksi: " + result.message);
                return;
            }

            const adminPhone = "628115133959";
            const userPhone = checkoutData.phone.startsWith("08")
                ? "62" + checkoutData.phone.slice(1)
                : checkoutData.phone.startsWith("+62")
                  ? checkoutData.phone.replace("+", "")
                  : checkoutData.phone;

            const productList = cart
                .map((p) => `- ${p.title} x${p.qty}`)
                .join("%0A");

            const message = `
            Halo Admin, saya ingin order:

            Nama: ${checkoutData.name}
            No HP: ${userPhone}
            Alamat: ${checkoutData.address}
            Pembayaran: ${checkoutData.payment}

            Pesanan:
            ${productList}

            Invoice: ${result.invoice}
        `;

            const waUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(
                message,
            )}`;

            // ✅ CLEAR CART AFTER CONFIRM
            setCart([]);
            localStorage.removeItem("cart");
            localStorage.removeItem("checkoutData");
            setCheckoutData({
                name: "",
                phone: "",
                address: "",
                payment: "COD",
            });

            // ✅ REFRESH TRANSACTIONS (reload page to get latest from server)
            window.location.reload();

            window.location.href = waUrl;
        } catch (error) {
            console.error("Fetch Error:", error);
            alert("Error: " + error.message);
        }
    };

    const handleStartCheckout = () => {
        if (checkoutData.payment === "Transfer") {
            setShowTransferModal(true);
            return;
        }

        handleConfirmCheckout();
    };

    const handleConfirmTransfer = async () => {
        // When user confirms transfer, save transaction and redirect to WA
        try {
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
                    payment_method: checkoutData.payment,
                    grand_total: cart.reduce(
                        (sum, item) => sum + item.sell_price * item.qty,
                        0,
                    ),
                }),
            });

            // Check if response is ok
            if (!response.ok) {
                const errorText = await response.text();
                console.error("Server Error:", response.status, errorText);
                alert(
                    "Gagal menyimpan transaksi: Server error " + response.status
                );
                return;
            }

            const result = await response.json();
            if (!result.success) {
                alert("Gagal menyimpan transaksi: " + result.message);
                return;
            }

            const adminPhone = "628115133959";
            const userPhone = checkoutData.phone.startsWith("08")
                ? "62" + checkoutData.phone.slice(1)
                : checkoutData.phone.startsWith("+62")
                  ? checkoutData.phone.replace("+", "")
                  : checkoutData.phone;

            const productList = cart
                .map((p) => `- ${p.title} x${p.qty}`)
                .join("%0A");

            const message = `\nHalo Admin, saya ingin konfirmasi pembayaran transfer:\n\nNama: ${checkoutData.name}\nNo HP: ${userPhone}\nAlamat: ${checkoutData.address}\nPembayaran: ${checkoutData.payment}\nBank: ${bankDetails.bank}\nRek: ${bankDetails.account}\nAtas Nama: ${bankDetails.holder}\n\nPesanan:\n${productList}\n\nInvoice: ${result.invoice}\n`;

            const waUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(
                message,
            )}`;

            // clear
            setCart([]);
            localStorage.removeItem("cart");
            localStorage.removeItem("checkoutData");
            setCheckoutData({ name: "", phone: "", address: "", payment: "COD" });
            setShowTransferModal(false);
            window.location.reload();

            window.location.href = waUrl;
        } catch (error) {
            console.error("Fetch Error:", error);
            alert("Error: " + error.message);
        }
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
                                href="/cart"
                                className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                            >
                                Chart
                            </Link>
                        </ul>

                        <div className="header-contact flex">
                            <ul className="header-nav__links">
                                {auth.user ? (
                                    <li className="current flex ">
                                        <Link
                                            href="/chart"
                                            className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                                        >
                                            Chart
                                        </Link>

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
                        onClick={() => setActiveTab("gallery")}
                        className={`px-6 py-3 font-semibold transition-all ${
                            activeTab === "gallery"
                                ? "text-white border-b-2 border-white"
                                : "text-white/50 hover:text-white"
                        }`}
                    >
                        Gallery
                    </button>
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

                {activeTab === "gallery" && (
                    <div className="flex border-white border-2 justify-center items-center">
                        <section
                            id="gallery"
                            className="container s-gallery target-section "
                        >
                            <div className="gallery-items grid-cols grid-cols--wrap gap-10 flex">
                                {/* NAV */}
                                <ul className="space-y-2 max-h-[420px] overflow-y-auto custom-scrollbar">
                                    {products.map((p) => {
                                        const active = p.id === activeProductId;

                                        return (
                                            <li
                                                key={p.id}
                                                onClick={() =>
                                                    setActiveProductId(p.id)
                                                }
                                                className={`border rounded-lg p-3 cursor-pointer transition ${
                                                    active
                                                        ? "border-white bg-white/10"
                                                        : "border-white/20 hover:bg-white/5"
                                                }`}
                                            >
                                                <div className="text-2xl font-semibold text-white">
                                                    {p.title}
                                                </div>
                                                <div className="text-white/60">
                                                    Rp{" "}
                                                    {Number(
                                                        p.sell_price,
                                                    ).toLocaleString("id-ID")}
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>

                                {/* CARD */}
                                {products
                                    .filter((p) => p.id === activeProductId)
                                    .map((item) => (
                                        <div
                                            key={item.id}
                                            className="gallery-items__item max-w-[340px]"
                                        >
                                            {imageLoading[item.id] && (
                                                <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center z-10">
                                                    <div className="animate-pulse text-white">
                                                        Loading...
                                                    </div>
                                                </div>
                                            )}
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="w-full h-[260px] object-cover rounded-xl"
                                                loading="eager"
                                                onLoad={() =>
                                                    setImageLoading(
                                                        (prev) => ({
                                                            ...prev,
                                                            [item.id]: false,
                                                        }),
                                                    )
                                                }
                                                onError={() =>
                                                    setImageLoading(
                                                        (prev) => ({
                                                            ...prev,
                                                            [item.id]: false,
                                                        }),
                                                    )
                                                }
                                            />

                                            <div className="mt-4 p-4 bg-black/40 rounded-xl">
                                                <h2 className="text-3xl text-white font-semibold">
                                                    {item.title}
                                                </h2>

                                                <p className="text-white/60 mt-2">
                                                    {item.description}
                                                </p>

                                                <div className="mt-4 flex justify-between items-center">
                                                    <span className="text-xl text-white font-bold">
                                                        Rp{" "}
                                                        {Number(
                                                            item.sell_price,
                                                        ).toLocaleString(
                                                            "id-ID",
                                                        )}
                                                    </span>

                                                    <button
                                                        onClick={() =>
                                                            addToChart(item)
                                                        }
                                                        className="border border-white px-4 py-2 text-white hover:bg-white hover:text-black transition-colors"
                                                    >
                                                        + Add to Cart
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </section>
                    </div>
                )}

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
                                            value={checkoutData.phone}
                                            onChange={(e) =>
                                                setCheckoutData({
                                                    ...checkoutData,
                                                    phone: e.target.value,
                                                })
                                            }
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-white/70 mb-2">
                                            Alamat
                                        </label>
                                        <textarea
                                            placeholder="Masukkan alamat lengkap"
                                            className="w-full p-3 bg-black border border-white/30 text-blue-50 rounded-lg focus:border-white transition-colors h-20"
                                            value={checkoutData.address}
                                            onChange={(e) =>
                                                setCheckoutData({
                                                    ...checkoutData,
                                                    address: e.target.value,
                                                })
                                            }
                                        />
                                    </div>

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
                                        </select>
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
                        <div className="absolute inset-0 bg-black/60" onClick={() => setShowTransferModal(false)} />

                        <div className="relative bg-black/90 border border-white/30 rounded-xl p-6 w-full max-w-md z-10">
                            <h3 className="text-2xl font-semibold text-white mb-4">Informasi Transfer</h3>

                            <div className="space-y-2 mb-4">
                                <p className="text-white/70">Silakan transfer ke rekening berikut:</p>
                                <div className="bg-black/40 p-4 rounded-lg">
                                    <p className="text-white font-semibold">{bankDetails.bank}</p>
                                    <p className="text-white">No. Rek: {bankDetails.account}</p>
                                    <p className="text-white">Atas Nama: {bankDetails.holder}</p>
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

                {/* ================= HISTORY TAB ================= */}
                {activeTab === "history" && (
                    <div className="max-w-4xl mx-auto">
                                {loadingTransactions ? (
                                    <div className="text-center py-12">
                                        <p className="text-white/60 text-xl">Loading...</p>
                                    </div>
                                ) : transactions.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-white/60 text-xl mb-4">Belum ada riwayat transaksi</p>
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
                       Invoice : {transaction.invoice}
                    </p>
                    <p className="text-xl text-white/50 mt-1">
                        {transaction.created_at}
                    </p>
                </div>

                <div className="flex justify-center border-white items-center gap-3">
                    <span
                        className={`px-3 py-1 rounded-full text-2xl font-semibold uppercase tracking-wide
                            ${
                                transaction.status === 'completed'
                                    ? 'bg-green-500/20 text-green-300'
                                    : transaction.status === 'pending'
                                    ? 'bg-yellow-500/20 text-yellow-300'
                                    : 'bg-red-500/20 text-red-300'
                            }`}
                    >
                        {transaction.status}
                    </span>

                    <button
                        onClick={() =>
                            window.open(
                                `/transactions/${transaction.invoice}/print`,
                                '_blank'
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
                        <span className="text-white/50">Nama:</span> {transaction.customer_name}
                    </p>
                    <p className="text-white">
                        <span className="text-white/50">WhatsApp:</span> {transaction.customer_phone}
                    </p>
                    <p className="text-white">
                        <span className="text-white/50">Alamat:</span> {transaction.customer_address}
                    </p>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-white/60 text-sm">Metode Pembayaran</p>
                    <p className="text-white font-medium mb-4">
                        {transaction.payment_method}
                    </p>

                    <p className="text-white/60 text-sm">Total</p>
                    <p className="text-2xl font-bold text-white">
                        Rp {Number(transaction.grand_total).toLocaleString('id-ID')}
                    </p>
                </div>
            </div>

            {/* ITEMS */}
            <div className="overflow-hidden rounded-xl border border-white/10">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-white/5">
                        <tr className="text-xs uppercase tracking-wide text-white/50">
                            <th className="py-3 px-4">Produk</th>
                            <th className="py-3 px-4 w-20 text-center">Qty</th>
                            <th className="py-3 px-4 text-right">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transaction.items.map((item, idx) => (
                            <tr
                                key={idx}
                                className="border-t border-white/5 text-white/80"
                            >
                                <td className="py-3 px-4">{item.product_name}</td>
                                <td className="py-3 px-4 text-center">{item.qty}</td>
                                <td className="py-3 px-4 text-right">
                                    Rp {Number(item.subtotal).toLocaleString('id-ID')}
                                </td>
                            </tr>
                        ))}
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
