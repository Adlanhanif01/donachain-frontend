import Header from "./Header.jsx";
import Footer from "./Footer.jsx";

export default function AuthLayout({ children, variant = "login" }) {
  return (
    <main className={`site-shell site-shell--${variant}`}>
      <Header />
      <section className={`auth-content auth-content--${variant}`}>{children}</section>
      <Footer />
    </main>
  );
}