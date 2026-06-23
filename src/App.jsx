function App() {
  return (
    <main style={{
      minHeight: "100vh",
      background: "#080810",
      color: "#E8E6F4",
      fontFamily: "Inter, Segoe UI, system-ui, sans-serif",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      textAlign: "center"
    }}>
      <section>
        <div style={{
          fontSize: 56,
          fontWeight: 900,
          letterSpacing: 2,
          marginBottom: 10
        }}>
          BUZA
        </div>

        <div style={{
          color: "#F5A623",
          fontSize: 24,
          fontWeight: 800,
          marginBottom: 8
        }}>
          Uzothola.
        </div>

        <div style={{
          color: "#6B6A8A",
          fontSize: 18,
          marginBottom: 28
        }}>
          Helping you find your way.
        </div>

        <button style={{
          background: "#F5A623",
          color: "#000",
          border: "none",
          borderRadius: 12,
          padding: "12px 22px",
          fontWeight: 800,
          fontSize: 15,
          cursor: "pointer"
        }}>
          Find a tutor
        </button>
      </section>
    </main>
  );
}

export default App;