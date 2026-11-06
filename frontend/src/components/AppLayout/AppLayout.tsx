import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '../Header/Header';
import { Footer } from '../Footer/Footer';
export function AppLayout() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    const heading = document.querySelector('main h1');
    document.title = (heading?.textContent || 'Monitoria') + ' | UFPR Exatas';
    document.getElementById('main-content')?.focus({ preventScroll: true });
  }, [pathname]);
  return (
    <>
      <a className="skip-link" href="#main-content">
        Ir para o conteúdo
      </a>
      <Header />
      <main id="main-content" className="container" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
