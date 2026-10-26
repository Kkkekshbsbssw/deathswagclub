import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "./orderService";
import {
  Check,
  LockKeyhole,
  LogOut,
  RefreshCw,
  X,
  AlertCircle,
  ShoppingBag,
  Search,
} from "lucide-react";
import "./index.css";

const money = (cents) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format((Number(cents) || 0) / 100);

export default function AdminDashboard() {
  const [session, setSession] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orders, setOrders] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [busyId, setBusyId] = useState("");

  // Order ID search
  const [orderSearch, setOrderSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");

  useEffect(() => {
    if (!supabase) {
      setError(
        "Supabase is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file."
      );
      setInitializing(false);
      return;
    }

    let active = true;

    async function initializeAuth() {
      try {
        const { data, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (active) setSession(data.session);
      } catch (err) {
        if (active) {
          setError(err.message || "Could not check your login session.");
        }
      } finally {
        if (active) setInitializing(false);
      }
    }

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) {
        setSession(nextSession);
        setError("");
        setSuccess("");
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadOrders = useCallback(async () => {
    if (!supabase || !session) return;

    setLoadingOrders(true);
    setError("");

    try {
      const { data, error: queryError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (queryError) throw queryError;

      setOrders(data || []);
    } catch (err) {
      setError(err.message || "Could not load orders.");
    } finally {
      setLoadingOrders(false);
    }
  }, [session]);

  useEffect(() => {
    if (session) loadOrders();
  }, [session, loadOrders]);

  async function signIn(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!supabase) {
      setError("Supabase is not configured. Check your .env file.");
      return;
    }

    setSigningIn(true);

    try {
      const { error: signInError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (signInError) throw signInError;

      setPassword("");
      setSuccess("Signed in successfully.");
    } catch (err) {
      setError(err.message || "Sign-in failed.");
    } finally {
      setSigningIn(false);
    }
  }

  async function updateOrder(id, status) {
    if (!supabase || !session) return;

    setBusyId(id);
    setError("");
    setSuccess("");

    try {
      const { data, error: updateError } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", id)
        .eq("status", "pending")
        .select("id");

      if (updateError) throw updateError;

      if (!data || data.length === 0) {
        throw new Error(
          "No order was updated. It may no longer be pending, or your database permissions may block this action."
        );
      }

      setSuccess(
        status === "paid" ? "Order marked as paid." : "Order rejected."
      );

      await loadOrders();
    } catch (err) {
      setError(err.message || "Could not update the order.");
    } finally {
      setBusyId("");
    }
  }

  async function signOut() {
    if (!supabase) return;

    setError("");
    setSuccess("");

    try {
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) throw signOutError;

      setOrders([]);
      setPassword("");
      setOrderSearch("");
      setSubmittedSearch("");
    } catch (err) {
      setError(err.message || "Could not sign out.");
    }
  }

  function handleOrderSearch(event) {
    event.preventDefault();
    setSubmittedSearch(orderSearch.trim());
  }

  function clearOrderSearch() {
    setOrderSearch("");
    setSubmittedSearch("");
  }

  const filteredOrders = useMemo(() => {
    const query = submittedSearch.trim().toLowerCase();

    if (!query) return orders;

    return orders.filter((order) =>
      String(order.id ?? "").toLowerCase().includes(query)
    );
  }, [orders, submittedSearch]);

  if (initializing) {
    return (
      <main className="admin-shell">
        <section className="admin-empty">
          <LockKeyhole size={24} />
          <p>Checking admin session...</p>
        </section>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="admin-shell">
        <section className="login-modal admin-login">
          <LockKeyhole size={28} />
          <span className="eyebrow">DEATHSWAGCLUB / PRIVATE</span>

          <h1>
            ORDER <span className="pink-text">DASHBOARD.</span>
          </h1>

          <p>Sign in with your admin account created in Supabase.</p>

          <form onSubmit={signIn}>
            <label htmlFor="admin-email">ADMIN EMAIL</label>
            <input
              id="admin-email"
              name="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              disabled={signingIn}
            />

            <label htmlFor="admin-password">PASSWORD</label>
            <input
              id="admin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
              disabled={signingIn}
            />

            <button
              className="button-primary full-width"
              type="submit"
              disabled={signingIn || !supabase}
            >
              {signingIn ? "SIGNING IN..." : "SIGN IN"}
            </button>
          </form>

          {error && (
            <p className="notice" role="alert">
              <AlertCircle size={16} /> {error}
            </p>
          )}

          <a className="button-outline" href="/">
            BACK TO STORE
          </a>
        </section>
      </main>
    );
  }

  const pendingCount = orders.filter(
    (order) => order.status === "pending"
  ).length;

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div>
          <span className="eyebrow">DEATHSWAGCLUB / PRIVATE</span>
          <h1>
            ORDER <span className="pink-text">DASHBOARD.</span>
          </h1>
          <p>
            Verify payment in your actual Cash App account before approving
            an order.
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            className="button-outline"
            type="button"
            onClick={loadOrders}
            disabled={loadingOrders}
          >
            <RefreshCw size={14} />
            {loadingOrders ? "LOADING..." : "REFRESH"}
          </button>

          <button className="button-outline" type="button" onClick={signOut}>
            <LogOut size={14} /> SIGN OUT
          </button>
        </div>
      </header>

      {error && (
        <p className="notice" role="alert">
          <AlertCircle size={16} /> {error}
        </p>
      )}

      {success && (
        <p className="notice" role="status">
          <Check size={16} /> {success}
        </p>
      )}

      <section className="admin-summary">
        <div>
          <ShoppingBag size={20} />
          <span>TOTAL ORDERS</span>
          <strong>{orders.length}</strong>
        </div>

        <div>
          <RefreshCw size={20} />
          <span>AWAITING REVIEW</span>
          <strong>{pendingCount}</strong>
        </div>
      </section>

      {/* Search orders by Order ID */}
      <section className="admin-search-section">
        <div className="admin-search-heading">
          <div>
            <span className="eyebrow">FIND AN ORDER</span>
            <h2>SEARCH BY <span className="pink-text">ORDER ID.</span></h2>
          </div>
        </div>

        <form className="admin-order-search" onSubmit={handleOrderSearch}>
          <label className="sr-only" htmlFor="order-id-search">
            Search by order ID
          </label>

          <Search size={18} aria-hidden="true" />

          <input
            id="order-id-search"
            type="text"
            value={orderSearch}
            onChange={(event) => setOrderSearch(event.target.value)}
            placeholder="Paste or enter an Order ID..."
            autoComplete="off"
          />

          <button
            className="button-primary"
            type="submit"
            disabled={!orderSearch.trim()}
          >
            <Search size={15} /> SEARCH
          </button>

          {submittedSearch && (
            <button
              className="button-outline"
              type="button"
              onClick={clearOrderSearch}
            >
              <X size={14} /> CLEAR
            </button>
          )}
        </form>

        {submittedSearch && (
          <p className="admin-search-result" role="status">
            {filteredOrders.length > 0
              ? `${filteredOrders.length} order${filteredOrders.length === 1 ? "" : "s"} found matching "${submittedSearch}".`
              : `No orders found matching "${submittedSearch}". Check the ID and try again.`}
          </p>
        )}
      </section>

      {loadingOrders && orders.length === 0 ? (
        <section className="admin-empty">
          <p>Loading orders...</p>
        </section>
      ) : orders.length === 0 ? (
        <section className="admin-empty">
          <ShoppingBag size={28} />
          <h2>NO ORDERS YET.</h2>
          <p>Submitted customer orders will appear here.</p>

          <button
            className="button-outline"
            type="button"
            onClick={loadOrders}
            disabled={loadingOrders}
          >
            <RefreshCw size={14} /> REFRESH ORDERS
          </button>
        </section>
      ) : filteredOrders.length === 0 ? (
        <section className="admin-empty">
          <Search size={28} />
          <h2>NO MATCHING ORDERS.</h2>
          <p>Try checking the Order ID and searching again.</p>

          <button
            className="button-outline"
            type="button"
            onClick={clearOrderSearch}
          >
            <X size={14} /> CLEAR SEARCH
          </button>
        </section>
      ) : (
        <div className="admin-order-list">
          {filteredOrders.map((order) => (
            <article className="admin-order-card" key={order.id}>
              <div className="admin-order-top">
                <div>
                  <span className={"admin-status status-" + order.status}>
                    {order.status}
                  </span>

                  <h2>{money(order.total_cents)}</h2>

                  <p>
                    {order.created_at
                      ? new Date(order.created_at).toLocaleString()
                      : "Date unavailable"}
                  </p>
                </div>

                <code>{order.id}</code>
              </div>

              <div className="admin-order-details">
                <p>
                  <strong>Email:</strong>{" "}
                  {order.customer_email || "Not provided"}
                </p>

                <p>
                  <strong>Discord:</strong>{" "}
                  {order.discord_username || "Not provided"}
                </p>

                <p>
                  <strong>Payment reference:</strong>{" "}
                  {order.payment_reference || "Not provided"}
                </p>

                <p>
                  <strong>Payment method:</strong> Cash App (manual verification)
                </p>

                {order.request_details && (
                  <p>
                    <strong>Custom request:</strong> {order.request_details}
                  </p>
                )}
              </div>

              <ul className="admin-order-items">
                {(Array.isArray(order.items) ? order.items : []).map(
                  (item, index) => (
                    <li key={order.id + "-" + index}>
                      {item.name} × {item.quantity}

                      <span>
                        {money(
                          (Number(item.unit_price_cents) || 0) *
                            (Number(item.quantity) || 0)
                        )}
                      </span>
                    </li>
                  )
                )}
              </ul>

              {order.status === "pending" && (
                <div className="admin-order-actions">
                  <button
                    className="button-primary"
                    type="button"
                    disabled={busyId === order.id}
                    onClick={() => updateOrder(order.id, "paid")}
                  >
                    <Check size={14} />
                    {busyId === order.id ? "UPDATING..." : "MARK PAID"}
                  </button>

                  <button
                    className="button-outline"
                    type="button"
                    disabled={busyId === order.id}
                    onClick={() => updateOrder(order.id, "rejected")}
                  >
                    <X size={14} /> REJECT
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      <footer className="admin-footer">
        <a href="/">← BACK TO STORE</a>
        <span>DEATHSWAGCLUB ADMIN</span>
      </footer>
    </main>
  );
}