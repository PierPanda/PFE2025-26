import { Outlet, Link } from 'react-router';
import logo from '~/assets/images/LOGO_MAESTROO.png';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-brand/10">
      <header className="sticky top-0 z-50 bg-white p-2">
        <div className="flex h-16 w-full items-center justify-between px-12">
          <Link to="/" className="shrink-0">
            <img src={logo} alt="Maestroo" className="h-9 w-auto" />
          </Link>
        </div>
      </header>

      <Outlet />
    </div>
  );
}
