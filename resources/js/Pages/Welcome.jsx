import { Link, Head } from "@inertiajs/react";
import { useEffect } from "react";

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    useEffect(() => {
        // Load CSS
        const vendorCss = document.createElement("link");
        vendorCss.rel = "stylesheet";
        vendorCss.href = "/css/vendor.css";
        document.head.appendChild(vendorCss);

        const stylesCss = document.createElement("link");
        stylesCss.rel = "stylesheet";
        stylesCss.href = "/css/styles.css";
        document.head.appendChild(stylesCss);

        // Load JavaScript
        const pluginsScript = document.createElement("script");
        pluginsScript.src = "/js/plugins.js";
        document.body.appendChild(pluginsScript);

        const mainScript = document.createElement("script");
        mainScript.src = "/js/main.js";
        document.body.appendChild(mainScript);

        // Windows-specific fallback (Quick Fix)
        const windowsTimer = setTimeout(() => {
            // Force content visibility if resources failed
            if (!document.documentElement.classList.contains("ss-loaded")) {
                document.documentElement.classList.add("ss-loaded");
                document.body.classList.add("ss-show");
            }

            // Safe re-initialization
            if (window.ssInit && typeof window.ssInit === "function") {
                window.ssInit();
            }
        }, 2000); // 2 second fallback for Windows timing

        // Cleanup
        return () => {
            if (document.head.contains(vendorCss))
                document.head.removeChild(vendorCss);
            if (document.head.contains(stylesCss))
                document.head.removeChild(stylesCss);
            if (document.body.contains(pluginsScript))
                document.body.removeChild(pluginsScript);
            if (document.body.contains(mainScript))
                document.body.removeChild(mainScript);
            clearTimeout(windowsTimer);
        };
    }, []);

    return (
        <>
            <Head>
                <title>Sniffy - Premium Perfume Store</title>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <link
                    rel="apple-touch-icon"
                    sizes="180x180"
                    href="/images/apple-touch-icon.png"
                />
                <link
                    rel="icon"
                    type="image/png"
                    sizes="32x32"
                    href="/images/favicon-32x32.png"
                />
                <link
                    rel="icon"
                    type="image/png"
                    sizes="16x16"
                    href="/images/favicon-16x16.png"
                />
                <link rel="manifest" href="/site.webmanifest" />
            </Head>

            <div className="no-js">
                {/* preloader */}
                <div id="preloader">
                    <div id="loader" className="dots-fade">
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                </div>

                {/* page wrap */}
                <div id="page" className="s-pagewrap ss-home">
                    {/* site header */}
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

                                    {auth.user && auth.user.id === 3 ? (
                                        <Link
                                            href="/cart"
                                            className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                                        >
                                            Chart
                                        </Link>
                                    ) : (
                                        <></>
                                    )}

                                    {auth.user && auth.user.id === 3 ? (
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
                                                {(auth.user &&
                                                    auth.user.id === 1) ||
                                                (auth.user &&
                                                    auth.user.id === 2) ? (
                                                    <Link
                                                        href="/dashboard"
                                                        className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                                                    >
                                                        Dashboard
                                                    </Link>
                                                ) : (
                                                    <></>
                                                )}

                                                {auth.user &&
                                                auth.user.id === 3 ? (
                                                    <Link
                                                        href={route(
                                                            "profile.edit",
                                                        )}
                                                        className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                                                    >
                                                        Profile
                                                    </Link>
                                                ) : (
                                                    <></>
                                                )}
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

                    {/* intro section */}
                    <section
                        id="intro"
                        className="container s-intro target-section"
                    >
                        <div className="grid-block s-intro__content">
                            <div className="intro-header">
                                <div className="intro-header__overline">
                                    Welcome to
                                </div>
                                <h1 className="intro-header__big-type">
                                    Sniffy <br />
                                </h1>
                            </div>

                            <figure className="intro-pic-primary">
                                <img
                                    src="https://i.pinimg.com/736x/94/37/86/943786159d2ea934ffe778fa1e970bd2.jpg"
                                    srcSet="https://i.pinimg.com/736x/94/37/86/943786159d2ea934ffe778fa1e970bd2.jpg 1x, https://i.pinimg.com/736x/94/37/86/943786159d2ea934ffe778fa1e970bd2.jpg 2x"
                                    alt=""
                                />
                            </figure>

                            <div className="intro-block-content">
                                <figure className="intro-block-content__pic">
                                    <img
                                        src="https://i.pinimg.com/736x/0c/b1/79/0cb179dcee9e78affa5fd244d9ee5513.jpg"
                                        srcSet="https://i.pinimg.com/736x/0c/b1/79/0cb179dcee9e78affa5fd244d9ee5513.jpg 1x, https://i.pinimg.com/736x/0c/b1/79/0cb179dcee9e78affa5fd244d9ee5513.jpg 2x"
                                        alt=""
                                    />
                                </figure>

                                <div className="intro-block-content__text-wrap">
                                    <p className="intro-block-content__text">
                                        Savor moments of bliss with every sip,
                                        as our expertly crafted coffees and
                                        delectable pastries embrace your senses.
                                    </p>

                                    <ul className="intro-block-content__social">
                                        <li>
                                            <a href="#0">FB</a>
                                        </li>
                                        <li>
                                            <a href="#0">IG</a>
                                        </li>
                                        <li>
                                            <a href="#0">PI</a>
                                        </li>
                                        <li>
                                            <a href="#0">X</a>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className="intro-scroll">
                                <a className="smoothscroll" href="#about">
                                    <span className="intro-scroll__circle-text"></span>
                                    <span className="intro-scroll__text u-screen-reader-text">
                                        Scroll Down
                                    </span>
                                    <div className="intro-scroll__icon">
                                        <svg
                                            clipRule="evenodd"
                                            fillRule="evenodd"
                                            strokeLinejoin="round"
                                            strokeMiterlimit="2"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="m5.214 14.522s4.505 4.502 6.259 6.255c.146.147.338.22.53.22s.384-.073.53-.22c1.754-1.752 6.249-6.244 6.249-6.244.144-.144.216-.334.217-.523 0-.193-.074-.386-.221-.534-.293-.293-.766-.294-1.057-.004l-4.968 4.968v-14.692c0-.414-.336-.75-.75-.75s-.75.336-.75.75v14.692l-4.979-4.978c-.289-.289-.761-.287-1.054.006-.148.148-.222.341-.221.534 0 .189.071.377.215.52z"
                                                fillRule="nonzero"
                                            />
                                        </svg>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </section>

                    {/* about section */}
                    <section
                        id="about"
                        className="container s-about target-section"
                    >
                        <div className="row s-about__content">
                            <div className="column xl-4 lg-5 md-12 s-about__content-start">
                                <div className="section-header" data-num="01">
                                    <h2 className="text-display-title">
                                        Our Story
                                    </h2>
                                </div>

                                <figure className="about-pic-primary">
                                    <img
                                        src="https://i.pinimg.com/736x/ab/3a/ad/ab3aad65ca540a7424d35216974b71f7.jpg"
                                        srcSet="https://i.pinimg.com/736x/ab/3a/ad/ab3aad65ca540a7424d35216974b71f7.jpg 1x, https://i.pinimg.com/736x/ab/3a/ad/ab3aad65ca540a7424d35216974b71f7.jpg 2x"
                                        alt=""
                                    />
                                </figure>
                            </div>

                            <div className="column xl-6 lg-6 md-12 s-about__content-end">
                                <p>
                                    At Sniffy Perfume, we believe that a
                                    fragrance is more than just a scent—it's a
                                    story, an identity, and a lasting
                                    impression. Our carefully curated collection
                                    brings together world-renowned designer
                                    houses, sophisticated niche creations, and
                                    timeless Middle Eastern blends.
                                </p>

                                <p>
                                    Whether you're searching for an elegant
                                    signature fragrance, a bold evening scent,
                                    or a subtle everyday aroma, Sniffy Perfume
                                    ensures every bottle you choose reflects
                                    your personality and style.
                                </p>

                                <p>
                                    With a commitment to authenticity and
                                    quality, Sniffy Perfume offers only 100%
                                    original products sourced from trusted
                                    partners worldwide. We strive to make luxury
                                    accessible, delivering exceptional perfumes
                                    at fair prices with a seamless shopping
                                    experience.
                                </p>

                                <p>
                                    Sniffy Perfume is more than a store—it's a
                                    destination for fragrance lovers who want to
                                    explore, express, and elevate themselves
                                    through the art of scent.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* menu section */}
                    <section
                        id="menu"
                        className="container s-menu target-section"
                    >
                        <div className="row s-menu__content">
                            <div className="column xl-4 lg-5 md-12 s-menu__content-start">
                                <div className="section-header" data-num="02">
                                    <h2 className="text-display-title">
                                        Our Perfume
                                    </h2>
                                </div>

                                <nav className="tab-nav">
                                    <ul className="tab-nav__list">
                                        <li>
                                            <a href="#designer-perfume">
                                                <span>Designer</span>
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
                                        </li>
                                        <li>
                                            <a href="#middle-eastern-nichie-inspired">
                                                <span>
                                                    Middle Eastern / Nichie
                                                    Inspired
                                                </span>
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
                                        </li>
                                        <li>
                                            <a href="#affordable-clone-houses">
                                                <span>
                                                    Affordable / Clone Houses
                                                </span>
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
                                        </li>
                                    </ul>
                                </nav>
                            </div>

                            <div className="column xl-6 lg-6 md-12 s-menu__content-end">
                                <div className="tab-content menu-block">
                                    <div
                                        id="designer-perfume"
                                        className="menu-block__group tab-content__item"
                                    >
                                        <h6 className="menu-block__cat-name">
                                            Designer Perfume
                                        </h6>
                                        <ul className="menu-list">
                                            <li className="menu-list__item">
                                                <div className="menu-list__item-desc">
                                                    <h4>Versace Eros Flame</h4>
                                                    <p>
                                                        Citrus–spicy–woody,
                                                        sensual & intens.
                                                    </p>
                                                </div>
                                                <div className="menu-list__item-price">
                                                    <span>$</span> 110
                                                </div>
                                            </li>
                                            <li className="menu-list__item">
                                                <div className="menu-list__item-desc">
                                                    <h4>Ferragamo Salvatore</h4>
                                                    <p>
                                                        spicy–gourmand, elegan
                                                        untuk pria modern.
                                                    </p>
                                                </div>
                                                <div className="menu-list__item-price">
                                                    <span>$</span> 75
                                                </div>
                                            </li>
                                            <li className="menu-list__item">
                                                <div className="menu-list__item-desc">
                                                    <h4>Montblanc Explorer</h4>
                                                    <p>
                                                        Woody aromatic,
                                                        fresh-masculine,
                                                        Advanture Vibes
                                                    </p>
                                                </div>
                                                <div className="menu-list__item-price">
                                                    <span>$</span>95.00
                                                </div>
                                            </li>
                                            <li className="menu-list__item">
                                                <div className="menu-list__item-desc">
                                                    <h4>YSL MYSLF EDP</h4>
                                                    <p>
                                                        Floral woody musk,
                                                        modern & clean.
                                                    </p>
                                                </div>
                                                <div className="menu-list__item-price">
                                                    <span>$</span>150
                                                </div>
                                            </li>
                                        </ul>
                                    </div>

                                    <div
                                        id="middle-eastern-nichie-inspired"
                                        className="menu-block__group tab-content__item"
                                    >
                                        <h6 className="menu-block__cat-name">
                                            Middle Eastern / Nichie Inspired
                                            Perfume
                                        </h6>
                                        <ul className="menu-list">
                                            <li className="menu-list__item">
                                                <div className="menu-list__item-desc">
                                                    <h4>
                                                        Zimaya Sharaf The Club
                                                    </h4>
                                                    <p>
                                                        Oudy–woody khas parfum
                                                        Arab, Luxury Vibes.
                                                    </p>
                                                </div>
                                                <div className="menu-list__item-price">
                                                    <span>$</span>65.00
                                                </div>
                                            </li>
                                            <li className="menu-list__item">
                                                <div className="menu-list__item-desc">
                                                    <h4>Turathi Electric</h4>
                                                    <p>
                                                        Fresh–spicy–sweet,
                                                        Inspiration of Designer
                                                        Perfume
                                                    </p>
                                                </div>
                                                <div className="menu-list__item-price">
                                                    <span>$</span>50
                                                </div>
                                            </li>
                                            <li className="menu-list__item">
                                                <div className="menu-list__item-desc">
                                                    <h4>Lattafa Asad</h4>
                                                    <p>Spicy Ambery Woody.</p>
                                                </div>
                                                <div className="menu-list__item-price">
                                                    <span>$</span>40
                                                </div>
                                            </li>
                                        </ul>
                                    </div>

                                    <div
                                        id="affordable-clone-houses"
                                        className="menu-block__group tab-content__item"
                                    >
                                        <h6 className="menu-block__cat-name">
                                            Affordable / Clone Houses Perfume
                                        </h6>
                                        <ul className="menu-list">
                                            <li className="menu-list__item">
                                                <div className="menu-list__item-desc">
                                                    <h4>
                                                        Armaf Club de Nuit
                                                        Intense Man
                                                    </h4>
                                                    <p>Fruity Wood Smoky</p>
                                                </div>
                                                <div className="menu-list__item-price">
                                                    <span>$</span> 45
                                                </div>
                                            </li>
                                            <li className="menu-list__item">
                                                <div className="menu-list__item-desc">
                                                    <h4>
                                                        Armaf Urban Man Elixir
                                                    </h4>
                                                    <p>
                                                        Fruity Spicy, Modern &
                                                        Masculine.
                                                    </p>
                                                </div>
                                                <div className="menu-list__item-price">
                                                    <span>$</span>50
                                                </div>
                                            </li>
                                            <li className="menu-list__item">
                                                <div className="menu-list__item-desc">
                                                    <h4>
                                                        Proud Of You Intense
                                                        (Lattafa Pride line)
                                                    </h4>
                                                    <p>
                                                        Woody–ambery,
                                                        Alternative Niche
                                                        Perfume.
                                                    </p>
                                                </div>
                                                <div className="menu-list__item-price">
                                                    <span>$</span>55.00
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* gallery section */}
                    <section
                        id="gallery"
                        className="container s-gallery target-section"
                    >
                        <div className="row s-gallery__header">
                            <div className="column xl-12 section-header-wrap">
                                <div className="section-header" data-num="03">
                                    <h2 className="text-display-title">
                                        Gallery
                                    </h2>
                                </div>
                            </div>
                        </div>

                        <div className="gallery-items grid-cols grid-cols--wrap">
                            <div className="gallery-items__item grid-cols__column">
                                <a
                                    href="/images/perfume-image/gallery-ratio-only/versace-eros-flame.png"
                                    className="gallery-items__item-thumb glightbox"
                                >
                                    <img
                                        src="/images/perfume-image/gallery-ratio-only/versace-eros-flame.png"
                                        alt=""
                                    />
                                </a>
                            </div>
                            <div className="gallery-items__item grid-cols__column">
                                <a
                                    href="/images/perfume-image/gallery-ratio-only/armaf-club-de-nuit-intense-man.png"
                                    className="gallery-items__item-thumb glightbox"
                                >
                                    <img
                                        src="/images/perfume-image/gallery-ratio-only/armaf-club-de-nuit-intense-man.png"
                                        alt=""
                                    />
                                </a>
                            </div>
                            <div className="gallery-items__item grid-cols__column">
                                <a
                                    href="/images/perfume-image/gallery-ratio-only/armaf-urban-man-elixir.png"
                                    className="gallery-items__item-thumb glightbox"
                                >
                                    <img
                                        src="/images/perfume-image/gallery-ratio-only/armaf-urban-man-elixir.png"
                                        alt=""
                                    />
                                </a>
                            </div>
                            <div className="gallery-items__item grid-cols__column">
                                <a
                                    href="/images/perfume-image/gallery-ratio-only/ferragamo-salvatore.png"
                                    className="gallery-items__item-thumb glightbox"
                                >
                                    <img
                                        src="/images/perfume-image/gallery-ratio-only/ferragamo-salvatore.png"
                                        alt=""
                                    />
                                </a>
                            </div>
                            <div className="gallery-items__item grid-cols__column">
                                <a
                                    href="/images/perfume-image/gallery-ratio-only/montblanc-explorer.png"
                                    className="gallery-items__item-thumb glightbox"
                                >
                                    <img
                                        src="/images/perfume-image/gallery-ratio-only/montblanc-explorer.png"
                                        alt=""
                                    />
                                </a>
                            </div>
                            <div className="gallery-items__item grid-cols__column">
                                <a
                                    href="/images/perfume-image/gallery-ratio-only/ysl-myslf-edp.png"
                                    className="gallery-items__item-thumb glightbox"
                                >
                                    <img
                                        src="/images/perfume-image/gallery-ratio-only/ysl-myslf-edp.png"
                                        alt=""
                                    />
                                </a>
                            </div>
                            <div className="gallery-items__item grid-cols__column">
                                <a
                                    href="/images/perfume-image/gallery-ratio-only/zimaya-sharaf-the-club.png"
                                    className="gallery-items__item-thumb glightbox"
                                >
                                    <img
                                        src="/images/perfume-image/gallery-ratio-only/zimaya-sharaf-the-club.png"
                                        alt=""
                                    />
                                </a>
                            </div>
                            <div className="gallery-items__item grid-cols__column">
                                <a
                                    href="/images/perfume-image/gallery-ratio-only/turathi-electric.png"
                                    className="gallery-items__item-thumb glightbox"
                                >
                                    <img
                                        src="/images/perfume-image/gallery-ratio-only/turathi-electric.png"
                                        alt=""
                                    />
                                </a>
                            </div>
                            <div className="gallery-items__item grid-cols__column">
                                <a
                                    href="/images/perfume-image/gallery-ratio-only/lattafa-asad.png"
                                    className="gallery-items__item-thumb glightbox"
                                >
                                    <img
                                        src="/images/perfume-image/gallery-ratio-only/lattafa-asad.png"
                                        alt=""
                                    />
                                </a>
                            </div>
                        </div>

                        <div className="flex justify-center items-center border-2 border-white w-full mt-20">
                            <Link
                                href="/cart"
                                className="btn btn-primary btn-large"
                            >
                                Checkout your Parfume
                            </Link>
                        </div>
                    </section>

                    {/* testimonials section */}
                    <section
                        id="testimonials"
                        className="container s-testimonials"
                    >
                        <div className="row s-testimonials__content">
                            <div className="column xl-12">
                                <h3 className="testimonials-title u-text-center">
                                    What Our Clients Say
                                </h3>

                                <div className="swiper-container testimonials-slider">
                                    <div className="swiper-wrapper">
                                        <div className="testimonials-slider__slide swiper-slide">
                                            <div className="testimonials-slider__author">
                                                <img
                                                    src="/images/avatars/user-02.jpg"
                                                    alt="Author image"
                                                    className="testimonials-slider__avatar"
                                                />
                                                <cite className="testimonials-slider__cite">
                                                    John Rockefeller
                                                    <span>Cleveland, Ohio</span>
                                                </cite>
                                            </div>
                                            <p>
                                                Molestiae incidunt consequatur
                                                quis ipsa autem nam sit enim
                                                magni. Voluptas tempore rem.
                                                Explicabo a quaerat sint autem
                                                dolore ducimus ut consequatur
                                                neque. Nisi dolores quaerat fuga
                                                rem nihil nostrum. Laudantium
                                                quia consequatur molestias.
                                            </p>
                                        </div>

                                        <div className="testimonials-slider__slide swiper-slide">
                                            <div className="testimonials-slider__author">
                                                <img
                                                    src="/images/avatars/user-03.jpg"
                                                    alt="Author image"
                                                    className="testimonials-slider__avatar"
                                                />
                                                <cite className="testimonials-slider__cite">
                                                    Andrew Carnegie
                                                    <span>
                                                        Pittsburgh, Pennsylvania
                                                    </span>
                                                </cite>
                                            </div>
                                            <p>
                                                Excepturi nam cupiditate culpa
                                                doloremque deleniti repellat.
                                                Veniam quos repellat voluptas
                                                animi adipisci. Nisi eaque
                                                consequatur. Voluptatem
                                                dignissimos ut ducimus
                                                accusantium perspiciatis. Quasi
                                                voluptas eius distinctio. Atque
                                                eos maxime.
                                            </p>
                                        </div>

                                        <div className="testimonials-slider__slide swiper-slide">
                                            <div className="testimonials-slider__author">
                                                <img
                                                    src="/images/avatars/user-01.jpg"
                                                    alt="Author image"
                                                    className="testimonials-slider__avatar"
                                                />
                                                <cite className="testimonials-slider__cite">
                                                    John Morgan
                                                    <span>New York City</span>
                                                </cite>
                                            </div>
                                            <p>
                                                Repellat dignissimos libero. Qui
                                                sed at corrupti expedita
                                                voluptas odit. Nihil ea quia
                                                nesciunt. Ducimus aut sed ipsam.
                                                Autem eaque officia cum
                                                exercitationem sunt voluptatum
                                                accusamus. Quasi voluptas eius
                                                distinctio. Voluptatem
                                                dignissimos ut.
                                            </p>
                                        </div>

                                        <div className="testimonials-slider__slide swiper-slide">
                                            <div className="testimonials-slider__author">
                                                <img
                                                    src="/images/avatars/user-06.jpg"
                                                    alt="Author image"
                                                    className="testimonials-slider__avatar"
                                                />
                                                <cite className="testimonials-slider__cite">
                                                    Henry Ford
                                                    <span>
                                                        Dearborn, Michigan
                                                    </span>
                                                </cite>
                                            </div>
                                            <p>
                                                Nunc interdum lacus sit amet
                                                orci. Vestibulum dapibus nunc ac
                                                augue. Fusce vel dui. In ac
                                                felis quis tortor malesuada
                                                pretium. Curabitur vestibulum
                                                aliquam leo. Qui sed at corrupti
                                                expedita voluptas odit. Nihil ea
                                                quia nesciunt. Ducimus aut sed
                                                ipsam.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="swiper-pagination"></div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* footer section */}
                    <footer id="footer" className="container s-footer">
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
                                        <img
                                            src="/images/logo.svg"
                                            alt="Homepage"
                                        />
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
                                    <h6>Navigation</h6>
                                    <ul className="link-list">
                                        <li>
                                            <Link
                                                href="/gallery"
                                                className="text-white hover:text-gray-300 transition-colors"
                                            >
                                                Gallery
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                                <div className="grid-cols__column footer-block">
                                    <h6>Contacts</h6>
                                    <ul className="link-list">
                                        <li>
                                            <a href="mailto:#0">
                                                contact@lounge.com
                                            </a>
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
                                        <a href="https://styleshout.com/">
                                            StyleShout
                                        </a>
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

                        <div className="ss-go-top">
                            <a
                                className="smoothscroll"
                                title="Back to Top"
                                href="#top"
                            >
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
                        </div>
                    </footer>
                </div>
            </div>
        </>
    );
}
