// V BACKUP - BARU
import { Link, Head, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";

export default function CartPage({ auth }) {
    const { products, categories } = usePage().props;

    /* ===============================
        STATE
    =============================== */

    const [activeProductId, setActiveProductId] = useState(
        products?.[0]?.id ?? null,
    );

    // ✅ CART FROM LOCAL STORAGE
    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem("cart");
        return saved ? JSON.parse(saved) : [];
    });

    const [showCheckout, setShowCheckout] = useState(false);

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

    /* ===============================
        WHATSAPP HANDLER
    =============================== */

    const normalizePhone = (phone) => {
        if (phone.startsWith("08")) return "62" + phone.slice(1);
        if (phone.startsWith("+62")) return phone.replace("+", "");
        return phone;
    };

    const handleConfirmCheckout = () => {
        if (!checkoutData.phone.match(/^08[0-9]{8,11}$/)) {
            alert("Nomor WhatsApp tidak valid (gunakan 08xxxx)");
            return;
        }

        const adminPhone = "628115133959";
        const userPhone = normalizePhone(checkoutData.phone);

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
            ${productList} - ${checkoutData.sell_prce}
        `;

        const waUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(
            message,
        )}`;

        // ✅ CLEAR CART AFTER CONFIRM
        setCart([]);
        localStorage.removeItem("cart");

        window.location.href = waUrl;
    };

    /* ===============================
        ASSET LOADER
    =============================== */

    useEffect(() => {
        const vendorCss = document.createElement("link");
        vendorCss.rel = "stylesheet";
        vendorCss.href = "/css/vendor.css";
        document.head.appendChild(vendorCss);

        const stylesCss = document.createElement("link");
        stylesCss.rel = "stylesheet";
        stylesCss.href = "/css/styles.css";
        document.head.appendChild(stylesCss);

        const pluginsScript = document.createElement("script");
        pluginsScript.src = "/js/plugins.js";
        document.body.appendChild(pluginsScript);

        const mainScript = document.createElement("script");
        mainScript.src = "/js/main.js";
        document.body.appendChild(mainScript);

        return () => {
            vendorCss.remove();
            stylesCss.remove();
            pluginsScript.remove();
            mainScript.remove();
        };
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
                            <li className="current">
                                <a className="smoothscroll" href="#intro">
                                    Intro
                                </a>
                            </li>
                            <li>
                                <a className="smoothscroll" href="#about">
                                    About
                                </a>
                            </li>
                            <li>
                                <a className="smoothscroll" href="#menu">
                                    Menu
                                </a>
                            </li>
                            <li>
                                <a className="smoothscroll" href="#gallery">
                                    Gallery
                                </a>
                            </li>
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

            {/* ================= GALLERY ================= */}
            <div className="flex border-white border-2 justify-center items-center">
                <section
                    id="gallery"
                    className="container s-gallery target-section "
                >
                    <div className="gallery-items grid-cols grid-cols--wrap gap-10">
                        {/* NAV */}
                        <ul className="space-y-2 max-h-[420px] overflow-y-auto custom-scrollbar">
                            {products.map((p) => {
                                const active = p.id === activeProductId;

                                return (
                                    <li
                                        key={p.id}
                                        onClick={() => setActiveProductId(p.id)}
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
                                    <img
                                        src={item.image}
                                        className="w-full h-[260px] object-cover rounded-xl"
                                    />

                                    <div className="mt-4 p-4 bg-black/40 rounded-xl">
                                        <h2 className="text-3xl text-white font-semibold">
                                            {item.title}
                                        </h2>

                                        <p className="text-white/60 mt-2">
                                            {item.description}
                                        </p>

                                        <div className="mt-4 flex justify-between">
                                            <span className="text-xl text-white">
                                                Rp{" "}
                                                {Number(
                                                    item.sell_price,
                                                ).toLocaleString("id-ID")}
                                            </span>

                                            <button
                                                onClick={() => addToChart(item)}
                                                className="border px-4 py-2 text-white hover:bg-white hover:text-black"
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

            {/* ================= CART FLOAT ================= */}
            {cart.length > 0 && (
                <div className="fixed bottom-6 right-6 bg-black/80 border border-white/30 rounded-xl p-4 w-[320px]">
                    <h4 className="text-white font-semibold mb-2">Keranjang</h4>

                    <ul className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                        {cart.map((item) => (
                            <li
                                key={item.id}
                                className="flex justify-between text-white"
                            >
                                <span>
                                    {item.title} x {item.qty}
                                </span>
                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="text-red-400"
                                >
                                    −
                                </button>
                            </li>
                        ))}
                    </ul>

                    <button
                        onClick={() => setShowCheckout(true)}
                        className="mt-4 w-full bg-white text-black py-2 rounded-md font-semibold"
                    >
                        Checkout
                    </button>
                </div>
            )}

            {/* ================= CHECKOUT MODAL ================= */}
            {showCheckout && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-black border border-white/30 rounded-xl p-6 w-[400px]">
                        <h3 className="text-white text-4xl font-semibold mb-4">
                            Checkout
                        </h3>

                        <input
                            placeholder="Nama"
                            className="w-full mb-2 p-2 bg-black text-3xl border border-white/30 text-white"
                            value={checkoutData.name}
                            onChange={(e) =>
                                setCheckoutData({
                                    ...checkoutData,
                                    name: e.target.value,
                                })
                            }
                        />

                        <input
                            placeholder="No WhatsApp (08xxxx)"
                            className="w-full mb-2 p-2 bg-black border text-3xl border-white/30 text-white"
                            value={checkoutData.phone}
                            onChange={(e) =>
                                setCheckoutData({
                                    ...checkoutData,
                                    phone: e.target.value,
                                })
                            }
                        />

                        <textarea
                            placeholder="Alamat"
                            className="w-full mb-2 p-2 bg-black border text-2xl border-white/30 text-white"
                            value={checkoutData.address}
                            onChange={(e) =>
                                setCheckoutData({
                                    ...checkoutData,
                                    address: e.target.value,
                                })
                            }
                        />

                        <select
                            className="w-full mb-4 p-2 bg-black border text-3xl border-white/30 text-white"
                            value={checkoutData.payment}
                            onChange={(e) =>
                                setCheckoutData({
                                    ...checkoutData,
                                    payment: e.target.value,
                                })
                            }
                        >
                            <option value="COD">COD</option>
                            <option value="Transfer">Transfer</option>
                            <option value="E-Wallet">E-Wallet</option>
                        </select>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowCheckout(false)}
                                className="flex-1 border py-2 text-white"
                            >
                                Batal
                            </button>

                            <button
                                onClick={handleConfirmCheckout}
                                className="flex-1 bg-white text-black py-2 font-semibold"
                            >
                                Konfirmasi
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
