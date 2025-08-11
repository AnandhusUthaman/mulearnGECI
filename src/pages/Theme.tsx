import React from 'react';
import { motion } from 'framer-motion';
import { Code, Lightbulb, Users, Rocket, BookOpen, Award } from 'lucide-react';

export function Theme() {
  const themes = [
    {
      icon: Code,
      title: 'Technology Innovation',
      description: 'Exploring cutting-edge technologies, emerging trends, and breakthrough innovations that shape the future of digital transformation.',
      color: 'blue',
      features: ['Web Development', 'Mobile Apps', 'Cloud Computing', 'DevOps']
    },
    {
      icon: Lightbulb,
      title: 'Creative Problem Solving',
      description: 'Fostering creative thinking, design thinking methodologies, and innovative approaches to solve real-world challenges.',
      color: 'yellow',
      features: ['Design Thinking', 'Innovation Labs', 'Hackathons', 'Prototyping']
    },
    {
      icon: Users,
      title: 'Collaborative Learning',
      description: 'Building a strong community through peer-to-peer learning, mentorship programs, and collaborative project development.',
      color: 'green',
      features: ['Peer Learning', 'Mentorship', 'Team Projects', 'Study Groups']
    },
    {
      icon: Rocket,
      title: 'Entrepreneurship & Startups',
      description: 'Nurturing entrepreneurial mindset, startup culture, and providing resources for budding entrepreneurs to launch their ventures.',
      color: 'purple',
      features: ['Business Planning', 'Pitch Competitions', 'Investor Connect', 'Startup Incubation']
    },
    {
      icon: BookOpen,
      title: 'Continuous Learning',
      description: 'Promoting lifelong learning through workshops, certifications, online courses, and skill development programs.',
      color: 'indigo',
      features: ['Workshops', 'Certifications', 'Online Courses', 'Skill Assessments']
    },
    {
      icon: Award,
      title: 'Excellence & Recognition',
      description: 'Celebrating achievements, recognizing contributions, and creating opportunities for students to showcase their talents.',
      color: 'red',
      features: ['Awards Programs', 'Competitions', 'Showcases', 'Portfolio Building']
    }
  ];

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    red: 'bg-red-100 text-red-600'
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Core Themes</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Discover the fundamental pillars that drive our community's mission to empower students through innovation, collaboration, and continuous learning.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              At µLearn, we believe in creating an ecosystem where students can thrive through hands-on learning, 
              collaborative projects, and exposure to cutting-edge technologies. Our themes are designed to provide 
              comprehensive growth opportunities that prepare students for the challenges of tomorrow's digital world.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Themes Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {themes.map((theme, index) => (
              <motion.div
                key={theme.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 border border-gray-100"
              >
                <div className={`w-16 h-16 rounded-xl ${colorClasses[theme.color]} flex items-center justify-center mb-6`}>
                  <theme.icon className="h-8 w-8" />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{theme.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{theme.description}</p>
                
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Key Focus Areas:</h4>
                  <div className="flex flex-wrap gap-2">
                    {theme.features.map((feature) => (
                      <span
                        key={feature}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Explore?</h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Join our community and immerse yourself in these exciting themes through our events, workshops, and collaborative projects.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/events"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200"
              >
                View Upcoming Events
              </a>
              <a
                href="/contact"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-200"
              >
                Get Involved
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}