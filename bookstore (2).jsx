import { useState, useEffect, createContext, useContext, useReducer } from "react";

// ─── Design Tokens ───────────────────────────────────────────────
const COLORS = {
  ink: "#1a1208",
  parchment: "#f5f0e8",
  cream: "#faf7f2",
  amber: "#c8852a",
  amberLight: "#e8a84a",
  rust: "#8b3a1a",
  forest: "#2d5016",
  gold: "#d4a847",
  muted: "#8a7a6a",
  mutedLight: "#b8a898",
  white: "#ffffff",
  cardBg: "#fffef9",
  border: "#e0d8cc",
};

// ─── Mock Database ────────────────────────────────────────────────
const BOOKS_DB = [
  { id: 1, title: "The Midnight Library", author: "Matt Haig", price: 16.99, category: "Fiction", rating: 4.7, reviews: 2341, stock: 15, cover: "🌙", description: "A dazzling novel about all the choices that go into a life well lived, from the author of Reasons to Stay Alive.", year: 2020, pages: 288 },
  { id: 2, title: "Atomic Habits", author: "James Clear", price: 18.99, category: "Self-Help", rating: 4.8, reviews: 5621, stock: 22, cover: "⚛️", description: "An Easy & Proven Way to Build Good Habits & Break Bad Ones.", year: 2018, pages: 320 },
  { id: 3, title: "Project Hail Mary", author: "Andy Weir", price: 14.99, category: "Sci-Fi", rating: 4.9, reviews: 3102, stock: 8, cover: "🚀", description: "A lone astronaut must save the earth from disaster in this incredible new science-based thriller.", year: 2021, pages: 476 },
  { id: 4, title: "The Song of Achilles", author: "Madeline Miller", price: 13.99, category: "Fiction", rating: 4.6, reviews: 1893, stock: 19, cover: "🏛️", description: "A tale of gods, kings, immortal fame, and the human heart — a dazzling literary re-imagining of Homer's Iliad.", year: 2011, pages: 352 },
  { id: 5, title: "Dune", author: "Frank Herbert", price: 19.99, category: "Sci-Fi", rating: 4.8, reviews: 7841, stock: 30, cover: "🏜️", description: "Set on the desert planet Arrakis, Dune is the story of Paul Atreides, heir to a noble family.", year: 1965, pages: 688 },
  { id: 6, title: "Educated", author: "Tara Westover", price: 15.99, category: "Memoir", rating: 4.7, reviews: 4210, stock: 12, cover: "📚", description: "A memoir about a young girl who, kept out of school, leaves her survivalist family and goes on to earn a PhD from Cambridge University.", year: 2018, pages: 334 },
  { id: 7, title: "The Alchemist", author: "Paulo Coelho", price: 12.99, category: "Fiction", rating: 4.5, reviews: 9823, stock: 25, cover: "✨", description: "A philosophical novel about a young Andalusian shepherd who longs to travel in search of a worldly treasure.", year: 1988, pages: 208 },
  { id: 8, title: "Thinking, Fast and Slow", author: "Daniel Kahneman", price: 17.99, category: "Psychology", rating: 4.6, reviews: 3567, stock: 18, cover: "🧠", description: "Reveals where we can and cannot trust our intuitions and how we can tap into the benefits of slow thinking.", year: 2011, pages: 499 },
  { id: 9, title: "Normal People", author: "Sally Rooney", price: 14.99, category: "Fiction", rating: 4.3, reviews: 2109, stock: 14, cover: "💬", description: "A story about how one person can be profoundly important to another and still not make you happy.", year: 2018, pages: 273 },
  { id: 10, title: "Sapiens", author: "Yuval Noah Harari", price: 16.99, category: "History", rating: 4.7, reviews: 6432, stock: 20, cover: "🌍", description: "A brief history of humankind, from the Stone Age to the present day.", year: 2011, pages: 443 },
  { id: 11, title: "The Girl with the Dragon Tattoo", author: "Stieg Larsson", price: 13.99, category: "Thriller", rating: 4.4, reviews: 5210, stock: 10, cover: "🐉", description: "A gripping mystery thriller following journalist Mikael Blomkvist and hacker Lisbeth Salander.", year: 2005, pages: 672 },
  { id: 12, title: "The Power of Now", author: "Eckhart Tolle", price: 14.99, category: "Self-Help", rating: 4.5, reviews: 4100, stock: 16, cover: "🕊️", description: "A guide to spiritual enlightenment and living in the present moment.", year: 1997, pages: 236 },
];

const REVIEWS_DB = {
  1: [{ id: 1, user: "Aria K.", rating: 5, text: "Life-changing read. Made me reflect on every decision I've ever made.", date: "2024-03-10" }],
  2: [{ id: 1, user: "Ben T.", rating: 5, text: "The best productivity book I've read. Practical, clear, and transformative.", date: "2024-02-15" }],
  3: [{ id: 1, user: "Cleo S.", rating: 5, text: "Couldn't put it down. Andy Weir does it again!", date: "2024-04-01" }],
};

const USERS_DB = [
  { id: 1, name: "Admin User", email: "admin@bookstore.com", password: "admin123", role: "admin" },
  { id: 2, name: "Jane Reader", email: "jane@example.com", password: "pass123", role: "user" },
];

// ─── Context ──────────────────────────────────────────────────────
const AppContext = createContext(null);

function useApp() { return useContext(AppContext); }

// ─── Cart Reducer ─────────────────────────────────────────────────
function cartReducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const existing = state.find(i => i.id === action.book.id);
      if (existing) return state.map(i => i.id === action.book.id ? { ...i, qty: i.qty + 1 } : i);
      return [...state, { ...action.book, qty: 1 }];
    }
    case "REMOVE": return state.filter(i => i.id !== action.id);
    case "UPDATE_QTY": return state.map(i => i.id === action.id ? { ...i, qty: Math.max(1, action.qty) } : i);
    case "CLEAR": return [];
    default: return state;
  }
}

// ─── Styles ───────────────────────────────────────────────────────
const S = {
  app: {
    fontFamily: "'Crimson Pro', 'Georgia', serif",
    background: COLORS.cream,
    minHeight: "100vh",
    color: COLORS.ink,
  },
  // NAV
  nav: {
    background: COLORS.ink,
    padding: "0 2.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: 64,
    position: "sticky",
    top: 0,
    zIndex: 100,
    boxShadow: "0 2px 20px rgba(0,0,0,0.4)",
  },
  navLogo: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: COLORS.gold,
    letterSpacing: "0.03em",
    cursor: "pointer",
    fontFamily: "'Playfair Display', Georgia, serif",
    display: "flex", alignItems: "center", gap: 8,
  },
  navLinks: { display: "flex", gap: "0.5rem", alignItems: "center" },
  navBtn: (active) => ({
    background: active ? COLORS.amber : "transparent",
    color: active ? COLORS.ink : COLORS.mutedLight,
    border: "none",
    padding: "0.45rem 1rem",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: "0.9rem",
    fontFamily: "inherit",
    transition: "all 0.2s",
    fontWeight: active ? 600 : 400,
  }),
  cartBtn: (count) => ({
    background: count > 0 ? COLORS.amber : "transparent",
    color: count > 0 ? COLORS.ink : COLORS.mutedLight,
    border: `1px solid ${count > 0 ? COLORS.amber : COLORS.muted}`,
    padding: "0.45rem 1.1rem",
    borderRadius: 20,
    cursor: "pointer",
    fontSize: "0.9rem",
    fontFamily: "inherit",
    transition: "all 0.2s",
    fontWeight: 600,
    display: "flex", alignItems: "center", gap: 6,
  }),
  // HERO
  hero: {
    background: `linear-gradient(135deg, ${COLORS.ink} 0%, #2d1e0a 60%, ${COLORS.rust} 100%)`,
    padding: "5rem 2.5rem 4rem",
    textAlign: "center",
    color: COLORS.parchment,
    position: "relative",
    overflow: "hidden",
  },
  heroTitle: {
    fontSize: "clamp(2.5rem, 5vw, 4rem)",
    fontFamily: "'Playfair Display', Georgia, serif",
    fontWeight: 700,
    marginBottom: "1rem",
    color: COLORS.gold,
    lineHeight: 1.1,
  },
  heroSub: {
    fontSize: "1.15rem",
    color: COLORS.mutedLight,
    maxWidth: 520,
    margin: "0 auto 2rem",
    lineHeight: 1.6,
  },
  searchBar: {
    display: "flex",
    maxWidth: 540,
    margin: "0 auto",
    background: COLORS.white,
    borderRadius: 10,
    overflow: "hidden",
    boxShadow: "0 4px 30px rgba(0,0,0,0.3)",
  },
  searchInput: {
    flex: 1,
    border: "none",
    padding: "0.9rem 1.3rem",
    fontSize: "1rem",
    fontFamily: "inherit",
    outline: "none",
    background: "transparent",
    color: COLORS.ink,
  },
  searchBtn: {
    background: COLORS.amber,
    border: "none",
    padding: "0.9rem 1.5rem",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: 700,
    color: COLORS.ink,
    fontFamily: "inherit",
    transition: "background 0.2s",
  },
  // FILTERS
  filters: {
    display: "flex",
    gap: "0.6rem",
    flexWrap: "wrap",
    padding: "1.5rem 2.5rem",
    background: COLORS.parchment,
    borderBottom: `1px solid ${COLORS.border}`,
    alignItems: "center",
  },
  filterLabel: { color: COLORS.muted, fontSize: "0.85rem", fontWeight: 600, marginRight: 4 },
  filterChip: (active) => ({
    padding: "0.35rem 0.9rem",
    borderRadius: 20,
    border: `1px solid ${active ? COLORS.amber : COLORS.border}`,
    background: active ? COLORS.amber : COLORS.white,
    color: active ? COLORS.ink : COLORS.muted,
    cursor: "pointer",
    fontSize: "0.82rem",
    fontFamily: "inherit",
    fontWeight: active ? 600 : 400,
    transition: "all 0.15s",
  }),
  sortSelect: {
    marginLeft: "auto",
    padding: "0.35rem 0.8rem",
    border: `1px solid ${COLORS.border}`,
    borderRadius: 6,
    background: COLORS.white,
    color: COLORS.ink,
    fontSize: "0.85rem",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  // BOOKS GRID
  booksGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
    gap: "1.5rem",
    padding: "2rem 2.5rem",
    maxWidth: 1400,
    margin: "0 auto",
  },
  bookCard: {
    background: COLORS.cardBg,
    borderRadius: 12,
    overflow: "hidden",
    border: `1px solid ${COLORS.border}`,
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
  },
  bookCover: {
    height: 180,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "4rem",
    background: `linear-gradient(135deg, ${COLORS.parchment}, ${COLORS.border})`,
    position: "relative",
  },
  bookInfo: { padding: "1rem 1.1rem", flex: 1, display: "flex", flexDirection: "column", gap: 4 },
  bookTitle: { fontSize: "1rem", fontWeight: 700, color: COLORS.ink, lineHeight: 1.3, fontFamily: "'Playfair Display', Georgia, serif" },
  bookAuthor: { fontSize: "0.82rem", color: COLORS.muted },
  bookCategory: {
    display: "inline-block",
    padding: "0.15rem 0.6rem",
    background: COLORS.parchment,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 10,
    fontSize: "0.72rem",
    color: COLORS.muted,
    marginTop: 2,
    width: "fit-content",
  },
  bookRating: { display: "flex", alignItems: "center", gap: 4, fontSize: "0.82rem", color: COLORS.amber, marginTop: 4 },
  bookPrice: { fontSize: "1.25rem", fontWeight: 700, color: COLORS.rust, marginTop: "auto", paddingTop: 8 },
  addToCartBtn: {
    width: "100%",
    padding: "0.65rem",
    background: COLORS.ink,
    color: COLORS.gold,
    border: "none",
    borderRadius: "0 0 12px 12px",
    cursor: "pointer",
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: "0.9rem",
    fontWeight: 600,
    letterSpacing: "0.05em",
    transition: "background 0.2s",
  },
  // MODAL
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
    zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center",
    padding: "1rem",
  },
  modal: {
    background: COLORS.cardBg,
    borderRadius: 16,
    maxWidth: 680,
    width: "100%",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  },
  modalHeader: {
    display: "flex",
    gap: "1.5rem",
    padding: "2rem",
    borderBottom: `1px solid ${COLORS.border}`,
    background: `linear-gradient(135deg, ${COLORS.parchment}, ${COLORS.cream})`,
    borderRadius: "16px 16px 0 0",
  },
  modalCover: {
    width: 100, height: 130,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "3.5rem",
    background: COLORS.border,
    borderRadius: 8,
    flexShrink: 0,
  },
  modalBody: { padding: "1.5rem 2rem" },
  // CART
  cartPanel: {
    position: "fixed", right: 0, top: 0, bottom: 0, width: 400,
    background: COLORS.cardBg,
    boxShadow: "-4px 0 30px rgba(0,0,0,0.15)",
    zIndex: 300,
    display: "flex",
    flexDirection: "column",
    borderLeft: `3px solid ${COLORS.amber}`,
  },
  cartHeader: {
    padding: "1.5rem",
    borderBottom: `1px solid ${COLORS.border}`,
    background: COLORS.ink,
    color: COLORS.gold,
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: "1.3rem",
    fontWeight: 700,
    display: "flex", alignItems: "center", justifyContent: "space-between",
  },
  cartItem: {
    display: "flex", gap: "1rem", padding: "1rem 1.5rem",
    borderBottom: `1px solid ${COLORS.border}`,
    alignItems: "center",
  },
  cartItemCover: { fontSize: "2rem", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", background: COLORS.parchment, borderRadius: 6, flexShrink: 0 },
  cartFooter: { padding: "1.5rem", borderTop: `1px solid ${COLORS.border}`, marginTop: "auto" },
  checkoutBtn: {
    width: "100%", padding: "1rem",
    background: COLORS.amber, color: COLORS.ink,
    border: "none", borderRadius: 10,
    fontSize: "1rem", fontWeight: 700, cursor: "pointer",
    fontFamily: "'Playfair Display', Georgia, serif",
    letterSpacing: "0.05em",
    transition: "all 0.2s",
  },
  // AUTH
  authCard: {
    background: COLORS.cardBg,
    borderRadius: 16,
    padding: "2.5rem",
    maxWidth: 420,
    margin: "4rem auto",
    boxShadow: "0 8px 40px rgba(0,0,0,0.1)",
    border: `1px solid ${COLORS.border}`,
  },
  authTitle: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: "1.8rem",
    fontWeight: 700,
    color: COLORS.ink,
    marginBottom: "0.4rem",
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: "0.8rem 1rem",
    border: `1.5px solid ${COLORS.border}`,
    borderRadius: 8,
    fontSize: "0.95rem",
    fontFamily: "inherit",
    outline: "none",
    background: COLORS.cream,
    color: COLORS.ink,
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  },
  primaryBtn: {
    width: "100%", padding: "0.9rem",
    background: COLORS.ink, color: COLORS.gold,
    border: "none", borderRadius: 8,
    fontSize: "1rem", fontWeight: 700, cursor: "pointer",
    fontFamily: "'Playfair Display', Georgia, serif",
    letterSpacing: "0.04em",
    transition: "background 0.2s",
  },
  // ADMIN
  adminContainer: { maxWidth: 1200, margin: "0 auto", padding: "2rem 2.5rem" },
  adminCard: {
    background: COLORS.cardBg,
    borderRadius: 12,
    border: `1px solid ${COLORS.border}`,
    padding: "1.5rem",
    marginBottom: "1.5rem",
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" },
  th: { padding: "0.8rem 1rem", textAlign: "left", background: COLORS.parchment, color: COLORS.muted, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: `1px solid ${COLORS.border}` },
  td: { padding: "0.8rem 1rem", borderBottom: `1px solid ${COLORS.border}`, color: COLORS.ink, verticalAlign: "middle" },
  badge: (color) => ({
    display: "inline-block",
    padding: "0.2rem 0.6rem",
    borderRadius: 10,
    fontSize: "0.75rem",
    fontWeight: 600,
    background: color === "green" ? "#e8f5e0" : color === "red" ? "#fde8e8" : "#fff3cd",
    color: color === "green" ? "#2d6a14" : color === "red" ? "#8b1a1a" : "#7a5200",
  }),
  statCard: {
    background: COLORS.cardBg,
    borderRadius: 12,
    border: `1px solid ${COLORS.border}`,
    padding: "1.5rem",
    textAlign: "center",
  },
  statNum: { fontSize: "2.5rem", fontWeight: 700, color: COLORS.amber, fontFamily: "'Playfair Display', Georgia, serif" },
  statLabel: { fontSize: "0.85rem", color: COLORS.muted, marginTop: 4 },
};

// ─── Components ───────────────────────────────────────────────────

function Stars({ rating, size = 14 }) {
  return (
    <span style={{ fontSize: size }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= Math.round(rating) ? COLORS.amber : COLORS.border }}>★</span>
      ))}
    </span>
  );
}

function Navbar() {
  const { user, setUser, page, setPage, cart, setShowCart } = useApp();
  const total = cart.reduce((s, i) => s + i.qty, 0);
  return (
    <nav style={S.nav}>
      <div style={S.navLogo} onClick={() => setPage("home")}>
        📖 <span>Folio</span><span style={{ color: COLORS.mutedLight, fontWeight: 300 }}>Books</span>
      </div>
      <div style={S.navLinks}>
        <button style={S.navBtn(page === "home")} onClick={() => setPage("home")}>Browse</button>
        {user ? (
          <>
            {user.role === "admin" && (
              <button style={S.navBtn(page === "admin")} onClick={() => setPage("admin")}>Admin Panel</button>
            )}
            <span style={{ color: COLORS.mutedLight, fontSize: "0.85rem", marginLeft: 8 }}>Hi, {user.name.split(" ")[0]}</span>
            <button style={S.navBtn(false)} onClick={() => { setUser(null); setPage("home"); }}>Sign Out</button>
          </>
        ) : (
          <button style={S.navBtn(page === "auth")} onClick={() => setPage("auth")}>Sign In</button>
        )}
        <button style={S.cartBtn(total)} onClick={() => setShowCart(true)}>
          🛒 {total > 0 ? `${total}` : "Cart"}
        </button>
      </div>
    </nav>
  );
}

function Hero({ search, setSearch }) {
  return (
    <div style={S.hero}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse at 30% 50%, rgba(200,133,42,0.1) 0%, transparent 60%), radial-gradient(ellipse at 70% 30%, rgba(139,58,26,0.15) 0%, transparent 50%)", pointerEvents: "none" }} />
      <h1 style={S.heroTitle}>Your Literary Universe</h1>
      <p style={S.heroSub}>Discover thousands of books across every genre. From timeless classics to modern masterpieces.</p>
      <div style={S.searchBar}>
        <input
          style={S.searchInput}
          placeholder="Search by title, author, or genre..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button style={S.searchBtn}>Search</button>
      </div>
      <div style={{ marginTop: "2.5rem", display: "flex", justifyContent: "center", gap: "3rem", color: COLORS.mutedLight, fontSize: "0.9rem" }}>
        {[["10,000+", "Books"], ["500+", "Authors"], ["50+", "Genres"]].map(([n, l]) => (
          <div key={l} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "1.4rem", fontWeight: 700, color: COLORS.gold, fontFamily: "'Playfair Display', Georgia, serif" }}>{n}</div>
            <div>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BookCard({ book, onClick }) {
  const { dispatch, toast } = useApp();
  return (
    <div
      style={S.bookCard}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.12)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
    >
      <div style={S.bookCover} onClick={onClick}>
        <span>{book.cover}</span>
        <span style={{ position: "absolute", top: 8, right: 8, background: COLORS.amber, color: COLORS.ink, fontSize: "0.7rem", fontWeight: 700, padding: "0.2rem 0.5rem", borderRadius: 10 }}>
          {book.category}
        </span>
      </div>
      <div style={S.bookInfo} onClick={onClick}>
        <div style={S.bookTitle}>{book.title}</div>
        <div style={S.bookAuthor}>{book.author}</div>
        <div style={S.bookRating}>
          <Stars rating={book.rating} size={12} />
          <span style={{ color: COLORS.muted }}>{book.rating} ({book.reviews.toLocaleString()})</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: 8 }}>
          <span style={S.bookPrice}>${book.price}</span>
          <span style={{ fontSize: "0.75rem", color: book.stock < 10 ? COLORS.rust : COLORS.forest }}>
            {book.stock < 10 ? `Only ${book.stock} left` : "In Stock"}
          </span>
        </div>
      </div>
      <button
        style={S.addToCartBtn}
        onMouseEnter={e => e.currentTarget.style.background = COLORS.amber}
        onMouseLeave={e => e.currentTarget.style.background = COLORS.ink}
        onClick={(e) => {
          e.stopPropagation();
          dispatch({ type: "ADD", book });
          toast(`"${book.title}" added to cart!`);
        }}
      >
        + Add to Cart
      </button>
    </div>
  );
}

function BookModal({ book, onClose }) {
  const { dispatch, toast, user, reviews, setReviews } = useApp();
  const bookReviews = reviews[book.id] || [];
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);

  const submitReview = () => {
    if (!reviewText.trim()) return;
    const newReview = {
      id: Date.now(),
      user: user ? user.name : "Anonymous",
      rating: reviewRating,
      text: reviewText,
      date: new Date().toISOString().split("T")[0],
    };
    setReviews(prev => ({ ...prev, [book.id]: [newReview, ...(prev[book.id] || [])] }));
    setReviewText("");
    toast("Review submitted!");
  };

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <div style={S.modalHeader}>
          <div style={S.modalCover}>{book.cover}</div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.5rem", margin: "0 0 0.3rem", color: COLORS.ink }}>{book.title}</h2>
            <div style={{ color: COLORS.muted, marginBottom: 8 }}>by {book.author} · {book.year} · {book.pages} pages</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Stars rating={book.rating} size={16} />
              <span style={{ color: COLORS.muted, fontSize: "0.9rem" }}>{book.rating} ({book.reviews.toLocaleString()} reviews)</span>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: "1.6rem", fontWeight: 700, color: COLORS.rust }}>${book.price}</span>
              <button
                style={{ ...S.checkoutBtn, width: "auto", padding: "0.6rem 1.5rem", borderRadius: 8 }}
                onClick={() => { dispatch({ type: "ADD", book }); toast(`"${book.title}" added to cart!`); onClose(); }}
              >
                Add to Cart
              </button>
              <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: "1.3rem", color: COLORS.muted }}>✕</button>
            </div>
          </div>
        </div>
        <div style={S.modalBody}>
          <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", marginBottom: "0.6rem" }}>Description</h3>
          <p style={{ color: COLORS.muted, lineHeight: 1.7, marginBottom: "1.5rem" }}>{book.description}</p>

          <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", marginBottom: "1rem" }}>Reviews ({bookReviews.length})</h3>
          {bookReviews.map(r => (
            <div key={r.id} style={{ padding: "1rem", background: COLORS.parchment, borderRadius: 8, marginBottom: "0.8rem", border: `1px solid ${COLORS.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ fontWeight: 600 }}>{r.user}</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Stars rating={r.rating} size={13} />
                  <span style={{ fontSize: "0.78rem", color: COLORS.muted }}>{r.date}</span>
                </div>
              </div>
              <p style={{ color: COLORS.muted, margin: 0, fontSize: "0.9rem", lineHeight: 1.6 }}>{r.text}</p>
            </div>
          ))}

          <div style={{ marginTop: "1.5rem", padding: "1.2rem", background: COLORS.parchment, borderRadius: 10, border: `1px solid ${COLORS.border}` }}>
            <h4 style={{ margin: "0 0 0.8rem", fontFamily: "'Playfair Display', Georgia, serif" }}>Write a Review</h4>
            <div style={{ display: "flex", gap: 6, marginBottom: "0.8rem" }}>
              {[1,2,3,4,5].map(n => (
                <span key={n} style={{ fontSize: 22, cursor: "pointer", color: n <= reviewRating ? COLORS.amber : COLORS.border }} onClick={() => setReviewRating(n)}>★</span>
              ))}
            </div>
            <textarea
              style={{ ...S.input, height: 80, resize: "vertical", marginBottom: "0.8rem" }}
              placeholder={user ? "Share your thoughts..." : "Sign in to leave a review..."}
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              disabled={!user}
            />
            <button style={{ ...S.primaryBtn, width: "auto", padding: "0.6rem 1.5rem" }} onClick={submitReview} disabled={!user}>
              {user ? "Post Review" : "Sign in to Review"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartPanel() {
  const { cart, dispatch, setShowCart, setPage, toast, user } = useApp();
  const total = cart.reduce((s, i) => s + i.qty * i.price, 0);

  const handleCheckout = () => {
    if (!user) { toast("Please sign in to checkout."); setPage("auth"); setShowCart(false); return; }
    dispatch({ type: "CLEAR" });
    setShowCart(false);
    toast("🎉 Order placed successfully! Thank you for your purchase.");
  };

  return (
    <>
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 299 }} onClick={() => setShowCart(false)} />
      <div style={S.cartPanel}>
        <div style={S.cartHeader}>
          <span>Shopping Cart</span>
          <button onClick={() => setShowCart(false)} style={{ background: "none", border: "none", color: COLORS.gold, fontSize: "1.3rem", cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ flex: 1, overflow: "auto" }}>
          {cart.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", color: COLORS.muted }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🛒</div>
              <div>Your cart is empty</div>
              <div style={{ fontSize: "0.85rem", marginTop: 4 }}>Add some books to get started</div>
            </div>
          ) : cart.map(item => (
            <div key={item.id} style={S.cartItem}>
              <div style={S.cartItemCover}>{item.cover}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: 2 }}>{item.title}</div>
                <div style={{ fontSize: "0.78rem", color: COLORS.muted }}>{item.author}</div>
                <div style={{ fontSize: "0.85rem", color: COLORS.rust, fontWeight: 700, marginTop: 2 }}>${(item.price * item.qty).toFixed(2)}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, background: COLORS.parchment, borderRadius: 6, padding: "0.2rem 0.4rem" }}>
                  <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.9rem", color: COLORS.muted }} onClick={() => dispatch({ type: "UPDATE_QTY", id: item.id, qty: item.qty - 1 })}>−</button>
                  <span style={{ fontSize: "0.85rem", fontWeight: 600, minWidth: 16, textAlign: "center" }}>{item.qty}</span>
                  <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.9rem", color: COLORS.muted }} onClick={() => dispatch({ type: "UPDATE_QTY", id: item.id, qty: item.qty + 1 })}>+</button>
                </div>
                <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.75rem", color: COLORS.muted, textDecoration: "underline" }} onClick={() => dispatch({ type: "REMOVE", id: item.id })}>Remove</button>
              </div>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div style={S.cartFooter}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.9rem", color: COLORS.muted }}>
              <span>Subtotal ({cart.reduce((s,i) => s+i.qty,0)} items)</span>
              <span style={{ color: COLORS.ink, fontWeight: 600 }}>${total.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", fontSize: "0.85rem", color: COLORS.muted }}>
              <span>Free shipping</span><span>$0.00</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "1.1rem", marginBottom: "1rem", paddingTop: "0.8rem", borderTop: `1px solid ${COLORS.border}` }}>
              <span>Total</span><span style={{ color: COLORS.rust }}>${total.toFixed(2)}</span>
            </div>
            <button style={S.checkoutBtn} onClick={handleCheckout}>Proceed to Checkout →</button>
            <button style={{ ...S.primaryBtn, background: "transparent", color: COLORS.muted, marginTop: "0.6rem", border: `1px solid ${COLORS.border}` }} onClick={() => dispatch({ type: "CLEAR" })}>Clear Cart</button>
          </div>
        )}
      </div>
    </>
  );
}

function AuthPage() {
  const { setUser, setPage, toast } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = () => {
    setError("");
    if (isLogin) {
      const found = USERS_DB.find(u => u.email === form.email && u.password === form.password);
      if (found) { setUser(found); setPage("home"); toast(`Welcome back, ${found.name.split(" ")[0]}!`); }
      else setError("Invalid email or password.");
    } else {
      if (!form.name || !form.email || !form.password) { setError("All fields are required."); return; }
      if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
      const newUser = { id: Date.now(), name: form.name, email: form.email, password: form.password, role: "user" };
      USERS_DB.push(newUser);
      setUser(newUser);
      setPage("home");
      toast(`Account created! Welcome, ${form.name.split(" ")[0]}!`);
    }
  };

  return (
    <div style={{ padding: "2rem", background: `linear-gradient(135deg, ${COLORS.parchment} 0%, ${COLORS.cream} 100%)`, minHeight: "calc(100vh - 64px)" }}>
      <div style={S.authCard}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <span style={{ fontSize: "2.5rem" }}>📖</span>
          <h2 style={S.authTitle}>{isLogin ? "Welcome Back" : "Join Folio"}</h2>
          <p style={{ color: COLORS.muted, fontSize: "0.9rem" }}>{isLogin ? "Sign in to your account" : "Create your account to start reading"}</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", background: COLORS.parchment, borderRadius: 8, padding: 4 }}>
          {["Sign In", "Sign Up"].map((t, i) => (
            <button key={t} style={{ flex: 1, padding: "0.6rem", border: "none", borderRadius: 6, cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: "0.9rem", background: isLogin === !i ? COLORS.ink : "transparent", color: isLogin === !i ? COLORS.gold : COLORS.muted, transition: "all 0.2s" }} onClick={() => { setIsLogin(!i); setError(""); }}>
              {t}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
          {!isLogin && <input style={S.input} placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />}
          <input style={S.input} type="email" placeholder="Email Address" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <input style={S.input} type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          {error && <div style={{ color: COLORS.rust, fontSize: "0.85rem", background: "#fde8e8", padding: "0.6rem 0.8rem", borderRadius: 6 }}>{error}</div>}
          <button style={{ ...S.primaryBtn, marginTop: "0.5rem" }} onClick={handleSubmit}>{isLogin ? "Sign In →" : "Create Account →"}</button>
        </div>
        {isLogin && (
          <div style={{ marginTop: "1.2rem", padding: "0.8rem", background: COLORS.parchment, borderRadius: 8, fontSize: "0.8rem", color: COLORS.muted }}>
            <strong style={{ color: COLORS.ink }}>Demo accounts:</strong><br />
            Admin: admin@bookstore.com / admin123<br />
            User: jane@example.com / pass123
          </div>
        )}
      </div>
    </div>
  );
}

function AdminPanel() {
  const { books, setBooks, reviews, setReviews } = useApp();
  const [tab, setTab] = useState("overview");
  const [showAddBook, setShowAddBook] = useState(false);
  const [newBook, setNewBook] = useState({ title: "", author: "", price: "", category: "Fiction", description: "", cover: "📗", stock: 10 });

  const categories = ["Fiction", "Sci-Fi", "Self-Help", "Memoir", "Thriller", "Psychology", "History"];

  const handleAddBook = () => {
    if (!newBook.title || !newBook.author || !newBook.price) return;
    const b = { ...newBook, id: Date.now(), price: parseFloat(newBook.price), stock: parseInt(newBook.stock), rating: 0, reviews: 0, year: new Date().getFullYear(), pages: 0 };
    setBooks(prev => [...prev, b]);
    setNewBook({ title: "", author: "", price: "", category: "Fiction", description: "", cover: "📗", stock: 10 });
    setShowAddBook(false);
  };

  const totalRevenue = books.reduce((s, b) => s + b.price * (b.reviews > 0 ? Math.floor(b.reviews / 100) : 0), 0);
  const totalReviews = Object.values(reviews).reduce((s, r) => s + r.length, 0);

  return (
    <div style={S.adminContainer}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "2rem", marginBottom: 4 }}>Admin Panel</h1>
          <p style={{ color: COLORS.muted, fontSize: "0.9rem" }}>Manage your bookstore inventory and reviews</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        {[
          ["📚", books.length, "Total Books"],
          ["⭐", totalReviews, "Reviews"],
          ["📦", books.reduce((s, b) => s + b.stock, 0), "Total Stock"],
          ["💰", `$${(totalRevenue).toFixed(0)}`, "Est. Revenue"],
        ].map(([icon, n, l]) => (
          <div key={l} style={S.statCard}>
            <div style={{ fontSize: "1.8rem", marginBottom: 4 }}>{icon}</div>
            <div style={S.statNum}>{n}</div>
            <div style={S.statLabel}>{l}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        {["overview", "books", "reviews"].map(t => (
          <button key={t} style={{ ...S.navBtn(tab === t), border: `1px solid ${tab === t ? COLORS.amber : COLORS.border}`, textTransform: "capitalize" }} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === "overview" && (
        <div style={S.adminCard}>
          <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", marginBottom: "1rem" }}>Top Books by Rating</h3>
          <table style={S.table}>
            <thead><tr>{["Title", "Author", "Category", "Rating", "Reviews", "Stock", "Price"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {[...books].sort((a,b) => b.rating - a.rating).slice(0, 6).map(b => (
                <tr key={b.id}>
                  <td style={S.td}><strong>{b.cover} {b.title}</strong></td>
                  <td style={S.td}>{b.author}</td>
                  <td style={S.td}><span style={S.badge("amber")}>{b.category}</span></td>
                  <td style={S.td}><Stars rating={b.rating} size={12} /> {b.rating}</td>
                  <td style={S.td}>{b.reviews.toLocaleString()}</td>
                  <td style={S.td}><span style={S.badge(b.stock > 15 ? "green" : b.stock > 5 ? "amber" : "red")}>{b.stock}</span></td>
                  <td style={S.td} style={{ ...S.td, fontWeight: 700, color: COLORS.rust }}>${b.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "books" && (
        <div style={S.adminCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>All Books ({books.length})</h3>
            <button style={{ ...S.primaryBtn, width: "auto", padding: "0.6rem 1.2rem" }} onClick={() => setShowAddBook(!showAddBook)}>
              {showAddBook ? "Cancel" : "+ Add Book"}
            </button>
          </div>
          {showAddBook && (
            <div style={{ background: COLORS.parchment, padding: "1.2rem", borderRadius: 10, marginBottom: "1.2rem", border: `1px solid ${COLORS.border}` }}>
              <h4 style={{ marginBottom: "1rem", fontFamily: "'Playfair Display', Georgia, serif" }}>Add New Book</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                {[["title", "Title *"], ["author", "Author *"], ["price", "Price *"], ["stock", "Stock"]].map(([key, label]) => (
                  <input key={key} style={S.input} placeholder={label} value={newBook[key]} onChange={e => setNewBook({ ...newBook, [key]: e.target.value })} />
                ))}
                <select style={S.input} value={newBook.category} onChange={e => setNewBook({ ...newBook, category: e.target.value })}>
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
                <input style={S.input} placeholder="Cover emoji (e.g. 📗)" value={newBook.cover} onChange={e => setNewBook({ ...newBook, cover: e.target.value })} />
              </div>
              <textarea style={{ ...S.input, height: 70, resize: "vertical", marginTop: "0.8rem" }} placeholder="Description" value={newBook.description} onChange={e => setNewBook({ ...newBook, description: e.target.value })} />
              <button style={{ ...S.primaryBtn, width: "auto", padding: "0.6rem 1.5rem", marginTop: "0.8rem" }} onClick={handleAddBook}>Add Book</button>
            </div>
          )}
          <table style={S.table}>
            <thead><tr>{["Book", "Category", "Price", "Stock", "Rating", "Action"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {books.map(b => (
                <tr key={b.id}>
                  <td style={S.td}><strong>{b.cover} {b.title}</strong><div style={{ fontSize: "0.78rem", color: COLORS.muted }}>{b.author}</div></td>
                  <td style={S.td}>{b.category}</td>
                  <td style={{ ...S.td, fontWeight: 700, color: COLORS.rust }}>${b.price}</td>
                  <td style={S.td}><span style={S.badge(b.stock > 15 ? "green" : b.stock > 5 ? "amber" : "red")}>{b.stock}</span></td>
                  <td style={S.td}>{b.rating > 0 ? <><Stars rating={b.rating} size={11} /> {b.rating}</> : <span style={{ color: COLORS.muted }}>No rating</span>}</td>
                  <td style={S.td}>
                    <button style={{ background: "none", border: `1px solid ${COLORS.rust}`, color: COLORS.rust, padding: "0.25rem 0.7rem", borderRadius: 6, cursor: "pointer", fontSize: "0.8rem", fontFamily: "inherit" }} onClick={() => setBooks(prev => prev.filter(x => x.id !== b.id))}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "reviews" && (
        <div style={S.adminCard}>
          <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", marginBottom: "1rem" }}>All Reviews</h3>
          {Object.entries(reviews).map(([bookId, bookReviews]) => {
            const book = books.find(b => b.id === parseInt(bookId));
            if (!book || !bookReviews.length) return null;
            return (
              <div key={bookId} style={{ marginBottom: "1.5rem" }}>
                <div style={{ fontWeight: 700, marginBottom: "0.5rem", color: COLORS.ink }}>{book?.cover} {book?.title}</div>
                {bookReviews.map(r => (
                  <div key={r.id} style={{ display: "flex", gap: "1rem", padding: "0.8rem 1rem", background: COLORS.parchment, borderRadius: 8, marginBottom: "0.5rem", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 8, marginBottom: 4, alignItems: "center" }}>
                        <strong style={{ fontSize: "0.9rem" }}>{r.user}</strong>
                        <Stars rating={r.rating} size={12} />
                        <span style={{ fontSize: "0.75rem", color: COLORS.muted }}>{r.date}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: COLORS.muted, lineHeight: 1.5 }}>{r.text}</p>
                    </div>
                    <button style={{ background: "none", border: `1px solid ${COLORS.rust}`, color: COLORS.rust, padding: "0.2rem 0.6rem", borderRadius: 6, cursor: "pointer", fontSize: "0.75rem", fontFamily: "inherit", flexShrink: 0 }} onClick={() => setReviews(prev => ({ ...prev, [bookId]: prev[bookId].filter(x => x.id !== r.id) }))}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            );
          })}
          {Object.values(reviews).every(r => !r.length) && <div style={{ color: COLORS.muted, textAlign: "center", padding: "2rem" }}>No reviews yet.</div>}
        </div>
      )}
    </div>
  );
}

function Toast({ message }) {
  if (!message) return null;
  return (
    <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: COLORS.ink, color: COLORS.gold, padding: "0.8rem 1.5rem", borderRadius: 30, zIndex: 999, fontSize: "0.9rem", fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.3)", whiteSpace: "nowrap", animation: "fadeIn 0.3s ease" }}>
      {message}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [cart, dispatch] = useReducer(cartReducer, []);
  const [showCart, setShowCart] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");
  const [books, setBooks] = useState(BOOKS_DB);
  const [reviews, setReviews] = useState(REVIEWS_DB);
  const [toastMsg, setToastMsg] = useState("");

  const toast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2800);
  };

  const categories = ["All", ...Array.from(new Set(BOOKS_DB.map(b => b.category)))];

  let filtered = books.filter(b => {
    const q = search.toLowerCase();
    return (!q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.category.toLowerCase().includes(q))
      && (category === "All" || b.category === category);
  });

  if (sort === "price-asc") filtered = [...filtered].sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") filtered = [...filtered].sort((a, b) => b.price - a.price);
  else if (sort === "rating") filtered = [...filtered].sort((a, b) => b.rating - a.rating);
  else if (sort === "reviews") filtered = [...filtered].sort((a, b) => b.reviews - a.reviews);

  const contextValue = { user, setUser, page, setPage, cart, dispatch, showCart, setShowCart, books, setBooks, reviews, setReviews, toast };

  return (
    <AppContext.Provider value={contextValue}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Crimson+Pro:wght@300;400;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${COLORS.cream}; }
        @keyframes fadeIn { from { opacity: 0; transform: translateX(-50%) translateY(10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
        input:focus, textarea:focus, select:focus { border-color: ${COLORS.amber} !important; }
      `}</style>
      <div style={S.app}>
        <Navbar />

        {page === "home" && (
          <>
            <Hero search={search} setSearch={setSearch} />
            <div style={S.filters}>
              <span style={S.filterLabel}>Genre:</span>
              {categories.map(c => (
                <button key={c} style={S.filterChip(category === c)} onClick={() => setCategory(c)}>{c}</button>
              ))}
              <select style={S.sortSelect} value={sort} onChange={e => setSort(e.target.value)}>
                <option value="featured">Featured</option>
                <option value="rating">Top Rated</option>
                <option value="reviews">Most Reviewed</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
              </select>
            </div>
            <div style={{ padding: "0.8rem 2.5rem", color: COLORS.muted, fontSize: "0.85rem" }}>
              Showing {filtered.length} book{filtered.length !== 1 ? "s" : ""}
              {search && <> for "<strong style={{ color: COLORS.ink }}>{search}</strong>"</>}
              {category !== "All" && <> in <strong style={{ color: COLORS.ink }}>{category}</strong></>}
            </div>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "4rem", color: COLORS.muted }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
                <div style={{ fontSize: "1.1rem" }}>No books found matching your search.</div>
                <button style={{ ...S.primaryBtn, width: "auto", padding: "0.6rem 1.5rem", marginTop: "1rem" }} onClick={() => { setSearch(""); setCategory("All"); }}>Clear Filters</button>
              </div>
            ) : (
              <div style={S.booksGrid}>
                {filtered.map(book => <BookCard key={book.id} book={book} onClick={() => setSelectedBook(book)} />)}
              </div>
            )}
          </>
        )}

        {page === "auth" && <AuthPage />}
        {page === "admin" && user?.role === "admin" && <AdminPanel />}
        {showCart && <CartPanel />}
        {selectedBook && <BookModal book={selectedBook} onClose={() => setSelectedBook(null)} />}
        <Toast message={toastMsg} />

        <footer style={{ background: COLORS.ink, color: COLORS.muted, textAlign: "center", padding: "2rem", fontSize: "0.85rem", marginTop: "4rem" }}>
          <div style={{ color: COLORS.gold, fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.2rem", marginBottom: "0.5rem" }}>📖 FolioBooks</div>
          <div>© 2024 FolioBooks. All rights reserved.</div>
          <div style={{ marginTop: 8, fontSize: "0.78rem" }}>Built with React · MySQL Backend Ready · Full-Stack Architecture</div>
        </footer>
      </div>
    </AppContext.Provider>
  );
}
