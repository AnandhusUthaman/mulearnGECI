import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { eventsAPI } from '../services/api';
import { getEventImageUrl } from '../utils/imageUtils';
import { Weight } from 'lucide-react';

export function Timeline() {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch only completed events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const response = await eventsAPI.getAll('completed');
        let fetchedEvents = response.data || [];

        // Sort events by date (latest first)
        fetchedEvents = fetchedEvents.sort(
            (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setEvents(fetchedEvents);
      } catch (error) {
        console.error('Failed to fetch events:', error);
        alert('Failed to load events');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

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
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Timeline</h1>
            <p className="text-xl text-blue-100 dark:text-blue-200 max-w-3xl mx-auto leading-relaxed">
              A glimpse of our past events and activities.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Timeline Section */}
      <div className="flex justify-center py-16 bg-gray-50 dark:bg-gray-800 transition-colors duration-300 min-h-screen">
        <div className="relative w-full max-w-5xl">
          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">Loading events...</p>
            </div>
          )}

          {/* No Events */}
          {!isLoading && events.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No events available at the moment.
              </p>
            </div>
          )}

          {/* Events Timeline */}
          {!isLoading && events.length > 0 && (
            <>
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-600 rounded-full"></div>

              {events.map((event, index) => (
                <motion.div
                  key={index}
                  className={`relative w-full flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'} mb-16`}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                >
                  {/* Timeline dot */}
                  <div  className="absolute left-1/2 -translate-x-1/2 w-5 h-5 bg-blue-500 border-4 border-white rounded-full shadow-md" />

                  {/* Event card */}
                  <div  className="w-96 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Event image */}
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={getEventImageUrl(event.image)}
                        alt={event.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      
                    </div>

                    {/* Event content */}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 leading-tight">
                        {event.title}
                      </h3>
                      <p className="text-xl font-bold text-blue-600 dark:text-blue-300 mb-2">
                        {new Date(event.date).toLocaleDateString(undefined, {
                          year: 'numeric', month: 'long', day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
