import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Users, Clock, X } from 'lucide-react';
import { eventsAPI } from '../services/api';
import { getEventImageUrl } from '../utils/imageUtils';
import { RegistrationButton } from '../components/RegistrationButton';

export function Events() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [pastEvents, setPastEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // For enlarged image modal
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);

  const events = activeTab === 'upcoming' ? upcomingEvents : pastEvents;

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const [upcomingResponse, pastResponse] = await Promise.all([
          eventsAPI.getAll('upcoming'),
          eventsAPI.getAll('completed'),
        ]);
        setUpcomingEvents(upcomingResponse.data || []);
        setPastEvents(pastResponse.data || []);
      } catch (error) {
        console.error('Failed to fetch events:', error);
        alert('Failed to load events');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const openImage = (src: string, alt: string) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
    setImageSize({
      width: img.naturalWidth * 0.5, // scale 50%
      height: img.naturalHeight * 0.5,
    });
    setSelectedImage({ src, alt });
  }};

  const closeImage = () => {
    setSelectedImage(null);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white dark:from-gray-900 dark:to-gray-900 dark:text-blue-100 py-20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Community Events</h1>
            <p className="text-xl text-blue-100 dark:text-blue-200 max-w-3xl mx-auto leading-relaxed">
              Discover exciting opportunities to learn, network, and grow through our carefully curated events and workshops.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tab Navigation */}
          <div className="flex justify-center mb-12">
            <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg transition-colors duration-300">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${
                  activeTab === 'upcoming'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                Upcoming Events
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${
                  activeTab === 'past'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                Past Events
              </button>
            </div>
          </div>

          {/* Events Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">Loading events...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div
                    className="relative h-48 overflow-hidden cursor-pointer"
                    onClick={() => openImage(getEventImageUrl(event.image), event.title)}
                  >
                    <img
                      src={getEventImageUrl(event.image)}
                      alt={event.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {event.type}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 leading-tight">
                      {event.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                      {event.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                        <span>
                          {new Date(event.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                        <Clock className="h-4 w-4 ml-4 mr-2 text-blue-600" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Users className="h-4 w-4 mr-2 text-blue-600" />
                        <span>{event.attendees || 0} attendees</span>
                      </div>
                    </div>

                    {activeTab === 'upcoming' && (
                      <div className="pt-2">
                        <RegistrationButton
                          eventId={event.id}
                          eventTitle={event.title}
                          registrationLink={event.registrationLink}
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {events.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">No events available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Enlarged Image Modal (same for desktop + mobile) */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeImage}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative "
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeImage}
                className="absolute top-3 right-3 bg-black/50 text-white rounded-full p-2 hover:bg-black/70"
              >
                <X className="h-5 w-5" />
              </button>
              <img
                src={selectedImage.src}
                alt={selectedImage.alt}
                className="object-contain rounded-2xl shadow-xl"
                style={{
                  width: imageSize?.width,
                  height: imageSize?.height,
                  maxWidth: "90vw",
                  maxHeight: "90vh",
                  display: 'block',
              }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

