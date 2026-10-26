import { useState } from "react";
import {
  ArrowDown, ArrowRight, ArrowUpRight, Check, Heart, LockKeyhole,
  Menu, Minus, Plus, ShoppingBag, Sparkles, ShieldCheck, Users,
  Zap, Crown, X,
} from "lucide-react";
import "./index.css";
import AdminDashboard from "./AdminDashboard.jsx";
import { createPendingOrder } from "./orderService";

const DISCORD = "https://discord.gg/neRGMdcRwq";

const products = [
  {
    id: 1, name: "Private Vault", category: "Membership", price: 10,
    billing: "One-time payment",
    description: "Unlock the members-only DeathSwagClub Vault.",
    label: "VAULT ACCESS", symbol: "✳", icon: ShieldCheck,
    benefits: ["Private Vault access", "Exclusive member drops and archives", "Members-only announcements"],
  },
  {
    id: 2, name: "Inner Circle", category: "Membership", price: 5,
    billing: "One-time payment",
    description: "Get closer to the people and updates behind the club.",
    label: "THE INNER CIRCLE", symbol: "✿", icon: Users,
    benefits: ["Private member chat", "Community polls and events", "Early announcements"],
  },
  {
    id: 3, name: "Priority Pass", category: "Membership", price: 15,
    billing: "One-time payment",
    description: "Priority consideration for eligible queues and events.",
    label: "PRIORITY ACCESS", symbol: "☾", icon: Zap,
    benefits: ["Priority in eligible queues", "Priority consideration for events", "Early notice of eligible releases"],
  },
  {
    id: 4, name: "Custom Access", category: "Membership", price: 25,
    billing: "One-time payment",
    description: "A higher-access package for personalized requests.",
    label: "THE FULL EXPERIENCE", symbol: "✧", icon: Crown,
    benefits: ["Private Vault access", "Personalized requests", "Priority queue consideration", "Automatic entry into eligible queues"],
  },
];

function RoseMark({ className = "" }) {
  return (
    <span className={`rose-mark ${className}`} aria-hidden="true">
      <svg viewBox="0 0 64 64" fill="none">
        <path
          d="M32 8C22 1 12 10 18 20C5 19 3 33 14 37C5 47 17 57 26 48C31 61 45 55 44 44C58 46 62 32 50 26C57 13 43 5 36 16C35 13 34 10 32 8Z"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path
          d="M32 18C23 22 21 29 29 32C19 39 28 46 35 39C43 34 40 25 32 25C27 25 27 31 32 32C37 33 37 38 32 40"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M31 46C30 53 27 57 23 60M33 48C38 53 42 55 47 55"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

function Storefront() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [discordUsername, setDiscordUsername] = useState("");
  const [requestDetails, setRequestDetails] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState([]);
  const [orderConfirmation, setOrderConfirmation] = useState(null);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  function addToCart(product) {
    setCart(current => {
      const existing = current.find(item => item.id === product.id);

      return existing
        ? current.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...current, { ...product, quantity: 1 }];
    });

    setNotice("");
  }

  function changeQuantity(id, amount) {
    setCart(current =>
      current
        .map(item =>
          item.id === id
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  }

  function toggleLike(id) {
    setLiked(current =>
      current.includes(id)
        ? current.filter(item => item !== id)
        : [...current, id]
    );
  }

  function openCheckout() {
    setCartOpen(false);
    setNotice("");
    setOrderConfirmation(null);
    setCheckoutOpen(true);
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  async function handleCheckout(event) {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setNotice("");

    try {
      const order = await createPendingOrder({
        email,
        discordUsername,
        cart,
        requestDetails,
        paymentReference,
      });

      setOrderConfirmation(order);
      setNotice("");
      setCart([]);
      setPaymentReference("");
      setRequestDetails("");
    } catch (error) {
      setNotice(
        error?.message || "We couldn't submit your order. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function copyCashAppTag() {
    try {
      await navigator.clipboard.writeText("$2115ca");
      setNotice("Cash App tag copied.");
    } catch {
      setNotice("Copy unavailable. Please copy $2115ca manually.");
    }
  }

  function handleDemoLogin(event) {
    event.preventDefault();
    setNotice(
      "Member sign-in is not connected yet. This form does not sign you in."
    );
  }

  return (
    <main>
      <div className="page-glow page-glow-one" />
      <div className="page-glow page-glow-two" />
      <div className="grain" />

      <div className="announcement-bar">
        <span className="announcement-dot" />
        <span>WELCOME TO THE CLUB</span>
        <span className="announcement-divider">/</span>
        <a href={DISCORD} target="_blank" rel="noreferrer">
          JOIN OUR COMMUNITY <ArrowUpRight size={12} />
        </a>
      </div>

      <header className="navbar">
        <a className="brand" href="#home" onClick={closeMenu}>
          <RoseMark />
          <span className="brand-name">
            DEATH<span>SWAG</span>CLUB
          </span>
        </a>

        <button
          className="mobile-menu"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X /> : <Menu />}
        </button>

        <nav className={menuOpen ? "nav-links nav-open" : "nav-links"}>
          <a href="#home" onClick={closeMenu}>Home</a>
          <a href="#shop" onClick={closeMenu}>Memberships</a>
          <a href="#about" onClick={closeMenu}>Our world</a>
          <a href="#community" onClick={closeMenu}>Community</a>
        </nav>

        <div className="nav-actions">
          <button
            className="login-button"
            onClick={() => {
              setNotice("");
              setLoginOpen(true);
            }}
          >
            <LockKeyhole size={14} />
            <span>Account</span>
          </button>

          <button
            className="cart-button"
            onClick={() => setCartOpen(true)}
            aria-label={`Open bag, ${cartCount} items`}
          >
            <ShoppingBag size={17} />
            <span>Bag</span>
            <span className="cart-count">{cartCount}</span>
          </button>
        </div>
      </header>

      <section className="hero" id="home">
        <div className="hero-copy">
          <div className="hero-kicker">
            <RoseMark />
            <span>NOT EVERYONE GETS IT.</span>
          </div>

          <h1>
            YOUR CLUB.<br />
            YOUR <span className="pink-text">RULES.</span>
          </h1>

          <p className="hero-description">
            More than a name. Get closer to the community with members-only
            access, exclusive drops, and priority perks built around your lane.
          </p>

          <div className="hero-buttons">
            <a className="button-primary" href="#shop">
              EXPLORE MEMBERSHIPS <ArrowRight size={16} />
            </a>
            <a
              className="button-outline"
              href={DISCORD}
              target="_blank"
              rel="noreferrer"
            >
              JOIN THE CLUB <ArrowUpRight size={16} />
            </a>
          </div>

          <div className="hero-meta">
            <span><span className="live-dot" /> THE CLUB IS OPEN</span>
            <span>FOUR WAYS TO GET CLOSER</span>
          </div>
        </div>

        <div className="hero-art" aria-label="Rose-inspired DeathSwagClub artwork">
          <div className="art-ring art-ring-one" />
          <div className="art-ring art-ring-two" />
          <div className="art-cross cross-one">+</div>
          <div className="art-cross cross-two">+</div>
          <div className="art-side-label">DSC / MEMBERS</div>

          <div className="art-center">
            <div className="art-halo" />
            <RoseMark className="hero-rose" />
            <span className="art-small-text">DEATHSWAGCLUB</span>
            <span className="art-main-text">
              INNER<br />WORLD
            </span>
            <span className="art-bottom-text">ACCESS YOUR OWN LANE</span>
          </div>

          <div className="art-index">001 <span>—</span> 004</div>
        </div>

        <a href="#shop" className="scroll-cue">
          <span>FIND YOUR MEMBERSHIP</span>
          <ArrowDown size={14} />
        </a>
      </section>

      <div className="ticker" aria-label="DeathSwagClub">
        <div className="ticker-track">
          {Array.from({ length: 8 }, (_, index) => (
            <span key={index}>
              DEATHSWAGCLUB <RoseMark /> YOUR WORLD, YOUR RULES <b>✳</b>
            </span>
          ))}
        </div>
      </div>

      <section className="shop-section section-wrap" id="shop">
        <div className="section-heading">
          <div>
            <span className="eyebrow">01 / MEMBERSHIP ACCESS</span>
            <h2>
              CHOOSE YOUR <span className="pink-text">LEVEL.</span>
            </h2>
          </div>

          <p>
            Four ways to get involved. Choose the package that fits you and add
            it to your bag to review your selection.
          </p>
        </div>

        <div className="shop-toolbar membership-toolbar">
          <span className="membership-toolbar-label">
            <ShieldCheck size={15} /> THE MEMBERSHIP COLLECTION
          </span>
          <span className="product-count">04 PACKAGES</span>
        </div>

        <div className="product-grid">
          {products.map((product, index) => {
            const PackageIcon = product.icon;

            return (
              <article className="product-card" key={product.id}>
                <div className={`product-art product-art-${product.id}`}>
                  <span className="product-label">{product.label}</span>

                  <button
                    className={
                      liked.includes(product.id)
                        ? "like-button liked"
                        : "like-button"
                    }
                    onClick={() => toggleLike(product.id)}
                    aria-label={
                      liked.includes(product.id)
                        ? "Unlike package"
                        : "Like package"
                    }
                  >
                    <Heart
                      size={16}
                      fill={liked.includes(product.id) ? "currentColor" : "none"}
                    />
                  </button>

                  <div className="product-art-lines" />
                  <span className="product-symbol">{product.symbol}</span>
                  <span className="product-art-title">DSC<span>®</span></span>
                  <span className="product-art-subtitle">MEMBERS ONLY</span>
                  <span className="product-art-index">
                    NO. {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="product-info">
                  <div className="product-info-top">
                    <div>
                      <span className="product-category">{product.category}</span>
                      <h3>{product.name}</h3>
                    </div>
                    <span className="product-price">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>

                  <p>{product.description}</p>

                  <div className="package-benefits">
                    {product.benefits.map(benefit => (
                      <div className="package-benefit" key={benefit}>
                        <Check size={13} />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <div className="package-billing">{product.billing}</div>

                  <button
                    className="add-button"
                    onClick={() => addToCart(product)}
                  >
                    ADD TO BAG <Plus size={15} />
                  </button>

                  <div className="package-backend-note">
                    <LockKeyhole size={11} /> Access activates after payment verification.
                  </div>

                  <span className="package-icon" aria-hidden="true">
                    <PackageIcon size={15} />
                  </span>
                </div>
              </article>
            );
          })}
        </div>

        <p className="catalog-note">
          ORDERS ARE PENDING UNTIL PAYMENT IS MANUALLY VERIFIED
        </p>
      </section>

      <section className="manifesto section-wrap" id="about">
        <div className="manifesto-visual">
          <div className="manifesto-frame">
            <span className="manifesto-top">DEATHSWAGCLUB / MEMBERS</span>
            <RoseMark className="manifesto-rose" />
            <span className="manifesto-word">
              STAY<br /><span>UNCOMMON.</span>
            </span>
            <span className="manifesto-bottom">NO RULES FOR THE ORDINARY.</span>
          </div>
        </div>

        <div className="manifesto-copy">
          <span className="eyebrow">02 / THE MINDSET</span>
          <h2>
            MORE THAN<br />
            A <span className="pink-text">MEMBERSHIP.</span>
          </h2>

          <p>
            DeathSwagClub is a place for personal style, creative expression,
            and people who prefer their own lane. Memberships are designed to
            give the community more ways to connect and participate.
          </p>

          <div className="manifesto-points">
            <div><span>01</span><p>Members-only access options</p><Check size={16} /></div>
            <div><span>02</span><p>Community perks and events</p><Check size={16} /></div>
            <div><span>03</span><p>More drops coming soon</p><Check size={16} /></div>
          </div>

          <a
            className="text-link"
            href={DISCORD}
            target="_blank"
            rel="noreferrer"
          >
            GET TO KNOW THE CLUB <ArrowUpRight size={16} />
          </a>
        </div>
      </section>

      <section className="community-section section-wrap" id="community">
        <div className="community-panel">
          <div className="community-decoration"><RoseMark /></div>
          <span className="eyebrow">03 / YOUR INVITATION</span>
          <h2>
            YOUR PEOPLE.<br />
            <span className="pink-text">YOUR CLUB.</span>
          </h2>

          <p>
            Join the Discord community for updates, announcements, and
            information about membership access.
          </p>

          <a
            className="button-primary"
            href={DISCORD}
            target="_blank"
            rel="noreferrer"
          >
            <Sparkles size={16} /> JOIN DEATHSWAGCLUB <ArrowUpRight size={16} />
          </a>

          <span className="community-discord">discord.gg/neRGMdcRwq</span>
        </div>
      </section>

      <footer className="footer">
        <a className="brand footer-brand" href="#home">
          <RoseMark />
          <span className="brand-name">
            DEATH<span>SWAG</span>CLUB
          </span>
        </a>

        <span className="footer-copy">DARK BY DESIGN. YOURS BY CHOICE.</span>

        <div className="footer-links">
          <a href="#shop">MEMBERSHIPS</a>
          <a href={DISCORD} target="_blank" rel="noreferrer">DISCORD ↗</a>
          <a href="#home">BACK TO TOP ↑</a>
        </div>

        <span className="copyright">
          © {new Date().getFullYear()} DEATHSWAGCLUB
        </span>
      </footer>

      {cartOpen && (
        <div className="overlay" onClick={() => setCartOpen(false)}>
          <section
            className="side-drawer"
            onClick={event => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
          >
            <div className="drawer-header">
              <div>
                <span className="eyebrow">YOUR MEMBERSHIP SELECTION</span>
                <h2 id="cart-title">THE BAG <span>({cartCount})</span></h2>
              </div>

              <button
                className="close-button"
                onClick={() => setCartOpen(false)}
                aria-label="Close bag"
              >
                <X />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="empty-cart">
                <ShoppingBag size={35} />
                <h3>YOUR BAG IS EMPTY.</h3>
                <p>Choose a membership and start building your selection.</p>

                <button
                  className="button-primary"
                  onClick={() => {
                    setCartOpen(false);
                    document.getElementById("shop")?.scrollIntoView({
                      behavior: "smooth",
                    });
                  }}
                >
                  EXPLORE MEMBERSHIPS <ArrowRight size={15} />
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map(item => (
                    <div className="cart-item" key={item.id}>
                      <div className={`cart-thumb product-art-${item.id}`}>
                        {item.symbol}
                      </div>

                      <div className="cart-item-details">
                        <h3>{item.name}</h3>
                        <span>${item.price.toFixed(2)} each</span>
                        <small className="cart-billing">{item.billing}</small>

                        <div className="quantity-control">
                          <button
                            onClick={() => changeQuantity(item.id, -1)}
                            aria-label={`Decrease ${item.name} quantity`}
                          >
                            <Minus size={12} />
                          </button>

                          <span>{item.quantity}</span>

                          <button
                            onClick={() => changeQuantity(item.id, 1)}
                            aria-label={`Increase ${item.name} quantity`}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>

                      <strong>
                        ${(item.price * item.quantity).toFixed(2)}
                      </strong>
                    </div>
                  ))}
                </div>

                <div className="cart-summary">
                  <div>
                    <span>ORDER TOTAL</span>
                    <strong>${cartTotal.toFixed(2)}</strong>
                  </div>

                  <p>
                    Follow the payment instructions at checkout. Your order
                    remains pending until verified.
                  </p>

                  <button
                    className="button-primary full-width"
                    onClick={openCheckout}
                  >
                    CONTINUE TO CHECKOUT <ArrowRight size={16} />
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      )}

      {checkoutOpen && (
        <div
          className="overlay"
          onClick={() => {
            if (!submitting) setCheckoutOpen(false);
          }}
        >
          <section
            className="login-modal checkout-modal"
            onClick={event => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkout-title"
          >
            <button
              className="close-button modal-close"
              onClick={() => setCheckoutOpen(false)}
              aria-label="Close checkout"
              disabled={submitting}
            >
              <X />
            </button>

            <RoseMark className="login-rose" />

            {orderConfirmation ? (
              <>
                <span className="eyebrow">ORDER RECEIVED</span>
                <h2 id="checkout-title">
                  YOU'RE IN <span className="pink-text">THE QUEUE.</span>
                </h2>

                <p>
                  Your order was submitted successfully and is awaiting manual
                  payment verification.
                </p>

                <div className="checkout-preview-list">
                  <div>
                    <span>Order ID</span>
                    <strong>{orderConfirmation.id}</strong>
                  </div>
                  <div>
                    <span>Status</span>
                    <strong>{orderConfirmation.status || "pending"}</strong>
                  </div>
                </div>

                <p>
                  Save your order ID. Membership access is not activated until
                  payment has been checked.
                </p>

                <button
                  className="button-primary full-width"
                  onClick={() => {
                    setCheckoutOpen(false);
                    setOrderConfirmation(null);
                    setEmail("");
                    setDiscordUsername("");
                  }}
                >
                  DONE
                </button>
              </>
            ) : (
              <>
                <span className="eyebrow">MEMBERSHIP CHECKOUT</span>
                <h2 id="checkout-title">
                  ALMOST <span className="pink-text">IN.</span>
                </h2>

                <p>Enter your details and submit your order for review.</p>

                <div className="checkout-preview-list">
                  {cart.map(item => (
                    <div key={item.id}>
                      <span>{item.name} × {item.quantity}</span>
                      <strong>
                        ${(item.price * item.quantity).toFixed(2)}
                      </strong>
                    </div>
                  ))}

                  <div className="checkout-preview-total">
                    <span>ORDER TOTAL</span>
                    <strong>${cartTotal.toFixed(2)}</strong>
                  </div>
                </div>

                <div className="backend-warning">
                  <LockKeyhole size={15} />

                  <div>
                    <strong>HOW TO COMPLETE YOUR PAYMENT</strong>

                    <p>
                      <strong>STEP 1:</strong> Open Cash App on your device.
                    </p>

                    <p>
                      <strong>STEP 2:</strong> Send the exact order total shown
                      above to the Cash App tag below.
                    </p>

                    <div className="cashapp-details">
                      <strong className="cashapp-tag">$2115ca</strong>

                      <button
                        type="button"
                        className="button-outline"
                        onClick={copyCashAppTag}
                      >
                        COPY CASHTAG
                      </button>
                    </div>

                    <p>
                      <strong>STEP 3:</strong> Complete the payment in Cash App.
                    </p>

                    <p>
                      <strong>STEP 4:</strong> Return here and enter your email,
                      Discord username, and payment reference.
                    </p>

                    <p>
                      <strong>STEP 5:</strong> Submit your order for review.
                    </p>

                    <p>
                      Your order remains pending until payment is manually
                      verified. Submitting an order does not activate membership
                      access.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleCheckout}>
                  <label htmlFor="checkout-email">EMAIL ADDRESS</label>
                  <input
                    id="checkout-email"
                    type="email"
                    value={email}
                    onChange={event => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                  />

                  <label htmlFor="discord-username">DISCORD USERNAME</label>
                  <input
                    id="discord-username"
                    type="text"
                    value={discordUsername}
                    onChange={event => setDiscordUsername(event.target.value)}
                    placeholder="Your Discord username"
                    maxLength={100}
                    required
                  />

                  <label htmlFor="payment-reference">PAYMENT REFERENCE</label>
                  <input
                    id="payment-reference"
                    type="text"
                    value={paymentReference}
                    onChange={event => setPaymentReference(event.target.value)}
                    placeholder="Transaction reference or note"
                    maxLength={200}
                    required
                  />

                  {cart.some(item => item.id === 4) && (
                    <>
                      <label htmlFor="request-details">
                        PERSONALIZED REQUEST DETAILS
                      </label>
                      <textarea
                        id="request-details"
                        value={requestDetails}
                        onChange={event => setRequestDetails(event.target.value)}
                        placeholder="Describe your request..."
                        rows={3}
                        maxLength={2000}
                      />
                    </>
                  )}

                  <button
                    className="button-primary full-width"
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting
                      ? "SUBMITTING ORDER…"
                      : "SUBMIT ORDER FOR REVIEW"}
                    <ArrowRight size={16} />
                  </button>
                </form>

                {notice && (
                  <p className="notice" role="alert">{notice}</p>
                )}

                <p className="fine-print">
                  Submitting creates a pending order only. It does not prove
                  payment, activate a membership, or grant a Discord role.
                </p>
              </>
            )}

            <a
              className="checkout-discord-link"
              href={DISCORD}
              target="_blank"
              rel="noreferrer"
            >
              NEED HELP? JOIN THE DISCORD <ArrowUpRight size={13} />
            </a>
          </section>
        </div>
      )}

      {loginOpen && (
        <div className="overlay" onClick={() => setLoginOpen(false)}>
          <section
            className="login-modal"
            onClick={event => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-title"
          >
            <button
              className="close-button modal-close"
              onClick={() => setLoginOpen(false)}
              aria-label="Close account"
            >
              <X />
            </button>

            <RoseMark className="login-rose" />
            <span className="eyebrow">DEATHSWAGCLUB MEMBERS</span>
            <h2 id="login-title">
              WELCOME <span className="pink-text">BACK.</span>
            </h2>

            <p>Member account sign-in is not connected yet.</p>

            <form onSubmit={handleDemoLogin}>
              <label htmlFor="account-email">EMAIL ADDRESS</label>
              <input
                id="account-email"
                type="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />

              <button className="button-primary full-width" type="submit">
                CONTINUE <ArrowRight size={16} />
              </button>
            </form>

            {notice && <p className="notice" role="status">{notice}</p>}

            <p className="fine-print">
              This account form is a preview and does not create a member account.
            </p>
          </section>
        </div>
      )}
    </main>
  );
}

export default function App() {
  if (window.location.pathname === "/admin") {
    return <AdminDashboard />;
  }

  return <Storefront />;
}