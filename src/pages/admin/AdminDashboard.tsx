import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Users, 
  Calendar, 
  FileText, 
  TrendingUp, 
  Eye,
  Edit,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';
import { postsAPI, eventsAPI } from '../../services/api';

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalEvents: 0,
    publishedPosts: 0,
    upcomingEvents: 0,
    draftPosts: 0,
    completedEvents: 0
  });
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [postsResponse, eventsResponse] = await Promise.all([
          postsAPI.getAll(),
          eventsAPI.getAll()
        ]);

        const posts = postsResponse.data || [];
        const events = eventsResponse.data || [];

        // Calculate stats
        setStats({
          totalPosts: posts.length,
          totalEvents: events.length,
          publishedPosts: posts.filter((post: any) => post.status === 'published').length,
          upcomingEvents: events.filter((event: any) => event.status === 'upcoming').length,
          draftPosts: posts.filter((post: any) => post.status === 'draft').length,
          completedEvents: events.filter((event: any) => event.status === 'completed').length
        });

        // Get recent posts (last 5)
        setRecentPosts(posts.slice(0, 5));
        // Get upcoming events (last 5)
        setRecentEvents(events.filter((event: any) => event.status === 'upcoming').slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleEditPost = (post: any) => {
    navigate(`/admin/posts/edit/${post._id}`);
  };

  const handleEditEvent = (event: any) => {
    navigate(`/admin/events/edit/${event._id}`);
  };

  const handleViewAnalytics = () => {
    navigate('/admin/analytics');
  };

  const handleViewPost = (post: any) => {
    window.open(`/posts/${post._id}`, '_blank');
  };

  const handleViewEvent = (event: any) => {
    window.open(`/events/${event._id}`, '_blank');
  };

  const statsData = [
    { title: 'Total Posts', value: stats.totalPosts.toString(), change: `${stats.publishedPosts} published`, icon: FileText, color: 'blue' },
    { title: 'Total Events', value: stats.totalEvents.toString(), change: `${stats.upcomingEvents} upcoming`, icon: Calendar, color: 'green' },
    { title: 'Draft Posts', value: stats.draftPosts.toString(), change: 'Needs review', icon: AlertCircle, color: 'orange' },
    { title: 'Completed Events', value: stats.completedEvents.toString(), change: 'Past events', icon: CheckCircle, color: 'purple' }
  ];

  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500'
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with µLearn.</p>
          </div>
          <div className="flex space-x-4">
            <Link
              to="/admin/posts"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>New Post</span>
            </Link>
            <Link
              to="/admin/events"
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>New Event</span>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            ))
          ) : (
            statsData.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    <p className="text-sm text-green-600 mt-1">{stat.change}</p>
                  </div>
                  <div className={`w-12 h-12 ${colorClasses[stat.color]} rounded-lg flex items-center justify-center`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Posts */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Posts</h2>
              <Link
                to="/admin/posts"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg animate-pulse">
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                      <div className="flex space-x-4">
                        <div className="h-3 bg-gray-200 rounded w-20"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                        <div className="h-3 bg-gray-200 rounded w-12"></div>
                      </div>
                    </div>
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  </div>
                ))
              ) : recentPosts.length > 0 ? (
                recentPosts.map((post) => (
                  <div key={post._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 truncate">{post.title}</h3>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          post.status === 'published' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {post.status}
                        </span>
                        <span>{post.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewPost(post)}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="View post"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEditPost(post)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title="Edit post"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No posts yet</p>
                  <Link to="/admin/posts/create" className="text-blue-600 hover:text-blue-700 text-sm">
                    Create your first post
                  </Link>
                </div>
              )}
            </div>
          </motion.div>

          {/* Recent Events */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Upcoming Events</h2>
              <Link
                to="/admin/events"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg animate-pulse">
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                      <div className="flex space-x-4">
                        <div className="h-3 bg-gray-200 rounded w-20"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                        <div className="h-3 bg-gray-200 rounded w-12"></div>
                      </div>
                    </div>
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  </div>
                ))
              ) : recentEvents.length > 0 ? (
                recentEvents.map((event) => (
                  <div key={event._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 truncate">{event.title}</h3>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                        <span>{event.location}</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {event.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewEvent(event)}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="View event"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEditEvent(event)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title="Edit event"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No upcoming events</p>
                  <Link to="/admin/events/create" className="text-green-600 hover:text-green-700 text-sm">
                    Create your first event
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to="/admin/posts/create"
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <Plus className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <p className="font-medium text-gray-700">New Post</p>
                <p className="text-sm text-gray-500">Create a new post</p>
              </Link>
              <Link
                to="/admin/events/create"
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-green-500 hover:bg-green-50 transition-colors"
              >
                <Plus className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <p className="font-medium text-gray-700">New Event</p>
                <p className="text-sm text-gray-500">Create a new event</p>
              </Link>
              <Link
                to="/admin/posts"
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-purple-500 hover:bg-purple-50 transition-colors"
              >
                <FileText className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                <p className="font-medium text-gray-700">Manage Posts</p>
                <p className="text-sm text-gray-500">View all posts</p>
              </Link>
              <Link
                to="/admin/events"
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-orange-500 hover:bg-orange-50 transition-colors"
              >
                <Calendar className="h-8 w-8 text-orange-400 mx-auto mb-2" />
                <p className="font-medium text-gray-700">Manage Events</p>
                <p className="text-sm text-gray-500">View all events</p>
              </Link>
            </div>
          </motion.div>

          {/* Quick Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Insights</h2>
            <div className="space-y-4">
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex items-center space-x-3 animate-pulse">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{stats.publishedPosts} Published Posts</p>
                      <p className="text-sm text-gray-500">Content is live and visible</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{stats.draftPosts} Draft Posts</p>
                      <p className="text-sm text-gray-500">Need review and publishing</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{stats.upcomingEvents} Upcoming Events</p>
                      <p className="text-sm text-gray-500">Scheduled for the future</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{stats.completedEvents} Completed Events</p>
                      <p className="text-sm text-gray-500">Successfully finished</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
}