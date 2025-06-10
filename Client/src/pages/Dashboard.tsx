import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Video, 
  Plus, 
  Calendar, 
  Clock, 
  Users, 
  Settings, 
  LogOut,
  Play,
  MoreVertical,
  Search,
  Filter
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const createNewCall = () => {
    const roomId = Math.random().toString(36).substring(2, 15);
    navigate(`/call/${roomId}`);
  };

  const recentCalls = [
    {
      id: '1',
      title: 'Weekly Team Standup',
      date: '2024-01-15',
      duration: '45 min',
      participants: 8,
      thumbnail: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&dpr=1'
    },
    {
      id: '2',
      title: 'Product Review Session',
      date: '2024-01-14',
      duration: '1h 20min',
      participants: 5,
      thumbnail: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&dpr=1'
    },
    {
      id: '3',
      title: 'Client Presentation',
      date: '2024-01-13',
      duration: '30 min',
      participants: 12,
      thumbnail: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&dpr=1'
    },
    {
      id: '4',
      title: 'Design System Review',
      date: '2024-01-12',
      duration: '55 min',
      participants: 6,
      thumbnail: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&dpr=1'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Video className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-white">Riverside</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-white font-medium">{user?.name}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-white transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h2>
          <p className="text-gray-400">Ready to create something amazing?</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={createNewCall}
            className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-2xl text-left hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-[1.02]"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Video className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Start New Call</h3>
                <p className="text-purple-100 text-sm">Begin recording instantly</p>
              </div>
            </div>
          </button>

          <button className="bg-gray-800/50 p-6 rounded-2xl text-left hover:bg-gray-800/70 transition-all duration-200 transform hover:scale-[1.02] border border-gray-700/50">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Schedule Call</h3>
                <p className="text-gray-400 text-sm">Plan your next session</p>
              </div>
            </div>
          </button>

          <button className="bg-gray-800/50 p-6 rounded-2xl text-left hover:bg-gray-800/70 transition-all duration-200 transform hover:scale-[1.02] border border-gray-700/50">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <Plus className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Join Call</h3>
                <p className="text-gray-400 text-sm">Enter a room code</p>
              </div>
            </div>
          </button>
        </div>

        {/* Recent Calls */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">Recent Calls</h3>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search calls..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <button className="p-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-400 hover:text-white transition-colors">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recentCalls.map((call) => (
              <div key={call.id} className="bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700/50 hover:border-purple-500/50 transition-all duration-200 group">
                <div className="relative">
                  <img
                    src={call.thumbnail}
                    alt={call.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Play className="w-6 h-6 text-white ml-1" />
                    </button>
                  </div>
                  <div className="absolute top-3 right-3">
                    <button className="p-1 bg-black/50 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
                
                <div className="p-4">
                  <h4 className="text-white font-semibold mb-2 line-clamp-2">{call.title}</h4>
                  <div className="flex items-center text-sm text-gray-400 space-x-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{call.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{call.participants}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{call.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Video className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">24</p>
                <p className="text-sm text-gray-400">Total Calls</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">18h</p>
                <p className="text-sm text-gray-400">Recording Time</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">156</p>
                <p className="text-sm text-gray-400">Participants</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">8</p>
                <p className="text-sm text-gray-400">This Month</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;