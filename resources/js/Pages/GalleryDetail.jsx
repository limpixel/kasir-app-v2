import { Link, Head, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";

export default function GalleryDetail() {
    const { props } = usePage();
    const product = props.product ?? {};
    const auth = props.auth ?? { user: null };

    const [cart, setCart] = useState([]);
    const [shippingOption, setShippingOption] = useState("delivery");
    const [deliveryLocation, setDeliveryLocation] = useState("");
    const [shippingCost, setShippingCost] = useState(0);

    /* LOAD CART */
    useEffect(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("cart");
            if (saved) setCart(JSON.parse(saved));
        }
    }, []);

    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("cart", JSON.stringify(cart));
        }
    }, [cart]);

    /* LOAD TEMPLATE ASSETS (ONLY ONCE) */
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
    }, []);

    const addToCart = (item) => {
        if (!item?.id) return;

        setCart((prev) => {
            const exist = prev.find((p) => p.id === item.id);

            if (exist) {
                return prev.map((p) =>
                    p.id === item.id ? { ...p, qty: p.qty + 1 } : p
                );
            }

            return [...prev, { ...item, qty: 1 }];
        });
    };

    useEffect(() => {
        if (shippingOption === "delivery") {
            const location = deliveryLocation.toLowerCase();

            const isSejabodetabek =
                location.includes("jakarta") ||
                location.includes("bekasi") ||
                location.includes("depok") ||
                location.includes("tangerang") ||
                location.includes("bogor");

            setShippingCost(isSejabodetabek ? 25000 : 0);
        } else {
            setShippingCost(0);
        }
    }, [deliveryLocation, shippingOption]);

    return (
        <>
            <Head>
                <title>{product.title ?? "Detail Produk"}</title>
            </Head>

            {/* ================= HEADER ================= */}
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
                            <li>
                                <Link href="/">Home</Link>
                            </li>
                            <li>
                                <Link href="/gallery">Gallery</Link>
                            </li>

                            {auth.user && auth.user.id === 3 && (
                                <li>
                                    <Link href="/cart">Cart</Link>
                                </li>
                            )}
                        </ul>

                        <div className="header-contact">
                            <ul className="header-nav__links">
                                {auth.user ? (
                                    <li>
                                        <Link href="/dashboard">Dashboard</Link>
                                    </li>
                                ) : (
                                    <>
                                        <li>
                                            <Link href="/login">Login</Link>
                                        </li>
                                        <li>
                                            <Link href="/register">
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

            {/* ================= PRODUCT DETAIL ================= */}
            <section className="s-content" style={{ paddingTop: "14rem" }}>
                {/* BACK LINK */}
                <div className="column large-12 text-start">
                    <div
                        className=" row"
                        style={{
                            marginTop: "40px",
                            marginLeft: "100px",
                            marginBottom: "40px",
                        }}
                    >
                        <Link href="/gallery" style={{ color: "#aaa" }}>
                            ← Kembali ke Gallery
                        </Link>
                    </div>
                </div>
                <div className="container">
                    <div className="row">
                        {/* IMAGE */}
                        <div className="column large-6 tab-12">
                            <div className="product-image-wrapper">
                                <img
                                    src={
                                        product.image ?? "/images/no-image.png"
                                    }
                                    alt={product.title}
                                    style={{
                                        width: "100%",
                                        borderRadius: "12px",
                                        background: "#111",
                                        padding: "20px",
                                    }}
                                />
                            </div>
                        </div>

                        {/* INFO */}
                        <div className="column large-6 tab-12">
                            <h1 style={{ color: "#fff", marginBottom: "20px" }}>
                                {product.title}
                            </h1>

                            <p style={{ color: "#aaa", marginBottom: "20px" }}>
                                {product.description ?? "-"}
                            </p>

                            <h3 style={{ marginBottom: "30px", color: "#fff" }}>
                                Rp{" "}
                                {Number(product.sell_price ?? 0).toLocaleString(
                                    "id-ID",
                                )}
                            </h3>

                            {auth.user && user.id === 3 ? (
                                <button
                                    onClick={() => addToCart(product)}
                                    className="btn btn--primary"
                                    style={{ width: "100%" }}
                                >
                                    + Tambah ke Keranjang
                                </button>
                            ) : (
                                <Link href="/login"
                                    className="btn btn--primary"
                                    style={{ width: "100%" }}
                                >
                                    Siilahkan untuk login
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* SHIPPING SECTION */}
                    {/* <div className="row" style={{ marginTop: "60px" }}>
                        <div className="column large-12">

                            <h3 style={{ marginBottom: "20px", color: "#fff" }}>
                                Opsi Pengiriman
                            </h3>

                            <div style={{ marginBottom: "20px", color: "#ccc" }}>
                                <label style={{ marginRight: "20px" }}>
                                    <input
                                        type="radio"
                                        value="pickup"
                                        checked={shippingOption === "pickup"}
                                        onChange={(e) =>
                                            setShippingOption(e.target.value)
                                        }
                                    />{" "}
                                    Ambil di Toko
                                </label>

                                <label>
                                    <input
                                        type="radio"
                                        value="delivery"
                                        checked={shippingOption === "delivery"}
                                        onChange={(e) =>
                                            setShippingOption(e.target.value)
                                        }
                                    />{" "}
                                    Diantar
                                </label>
                            </div>

                            {shippingOption === "delivery" && (
                                <input
                                    type="text"
                                    placeholder="Contoh: Jakarta Selatan"
                                    value={deliveryLocation}
                                    onChange={(e) =>
                                        setDeliveryLocation(e.target.value)
                                    }
                                    style={{
                                        width: "100%",
                                        padding: "12px",
                                        borderRadius: "6px",
                                        background: "#111",
                                        border: "1px solid #333",
                                        color: "#fff",
                                        marginBottom: "20px"
                                    }}
                                />
                            )}

                            <div
                                style={{
                                    padding: "20px",
                                    background: "#111",
                                    borderRadius: "10px",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    color: "#fff"
                                }}
                            >
                                <span>Ongkos Kirim:</span>
                                <strong>
                                    Rp {shippingCost.toLocaleString("id-ID")}
                                </strong>
                            </div>

                        </div>
                    </div> */}
                </div>
            </section>
        </>
    );
}
