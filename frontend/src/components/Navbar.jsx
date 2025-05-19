import { Link } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';

const Navbar = () => {
  return (
    <nav className="bg-white border-b border-gray-200 text-blue-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side: DevLog title */}
          <h1 className="text-2xl font-bold text-primary-700 tracking-tight font-mono flex items-center space-x-2 mx-auto">
            <span className="text-3xl text-primary-600">⌘</span>
            <span className="bg-gradient-to-r from-primary-600 to-indigo-500 bg-clip-text text-transparent">
              DevLog
            </span>
          </h1>

          <Link
            to="/logs/new"
            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-tr from-primary-600 to-primary-700 text-white text-sm font-semibold shadow-lg hover:shadow-xl hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
          >
            <FiPlus className="w-4 h-4 transform transition-transform duration-200 group-hover:rotate-90 group-hover:scale-110" />
            <span className="tracking-wide">New Log</span>
          </Link>


        </div>
      </div>
    </nav>
  );
};

export default Navbar;
