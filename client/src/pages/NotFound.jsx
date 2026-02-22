import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-screen bg-surface-50 flex items-center justify-center">
    <div className="text-center animate-fade-in">
      <div className="text-8xl mb-4">🏫</div>
      <h1 className="font-display font-bold text-6xl text-slate-900 mb-2">404</h1>
      <p className="text-xl text-slate-500 mb-8">Oops! This page doesn't exist on campus.</p>
      <Link to="/" className="btn-primary text-base px-8 py-3">Go Back Home</Link>
    </div>
  </div>
);

export default NotFound;
