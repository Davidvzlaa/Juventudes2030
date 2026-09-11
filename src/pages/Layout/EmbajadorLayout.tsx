import { Outlet } from 'react-router-dom';
import Header from '../Header';
import Footer from '../Footer';

export default function EmbajadorLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex-1 min-w-0">
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}