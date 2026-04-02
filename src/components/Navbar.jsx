// src/components/Navbar.jsx
// Sticky top navigation bar. Accepts optional sort toggle props.
// When sort is not needed (e.g. Profile page), omit sortValue/onSort.

export default function Navbar({ sortValue, onSort }) {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <span className="brand">
          <span className="brand-heart">♡</span>
          <span className="brand-name">Whisper</span>
        </span>

        {onSort && (
          <div className="sort-toggle">
            <button
              className={sortValue === "new" ? "active" : ""}
              onClick={() => onSort("new")}
            >
              Recent
            </button>
            <button
              className={sortValue === "top" ? "active" : ""}
              onClick={() => onSort("top")}
            >
              Top
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}