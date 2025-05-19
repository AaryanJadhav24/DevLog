import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, BarChart2 } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', icon: Home, path: '/' },
    { name: 'Logs', icon: BookOpen, path: '/logs' },
    { name: 'Stats', icon: BarChart2, path: '/stats' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="hidden md:flex md:flex-shrink-0 ">
      <div className="flex flex-col w-64 h-screen bg-blue-50 text-gray-600 border-r border-gray-200 shadow-sm rounded-tr-2xl rounded-br-2xl">
        {/* Logo area */}
        <div className="flex items-center justify-center h-20 px-4 border-b border-gray-100">
          <h1 className="text-3xl font-bold tracking-tight font-mono flex items-center gap-2">
            <span className="text-4xl text-primary-600">⌘</span>
            <span className="bg-gradient-to-r from-primary-600 to-indigo-500 bg-clip-text text-transparent">
              DevLog
            </span>
          </h1>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {navItems.map(({ name, icon: Icon, path }) => (
            <Link
              key={name}
              to={path}
              className={`group flex items-center px-4 py-2 rounded-lg transition-all duration-150 ${isActive(path)
                  ? 'bg-primary-100 text-primary-700 font-semibold shadow-inner'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                }`}
            >
              <Icon
                className={`mr-3 h-5 w-5 transition ${isActive(path)
                    ? 'text-primary-600'
                    : 'text-gray-400 group-hover:text-blue-500'
                  }`}
              />
              {name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
