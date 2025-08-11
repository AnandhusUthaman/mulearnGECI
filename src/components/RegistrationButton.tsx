import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { eventsAPI } from '../services/api';

interface RegistrationButtonProps {
  eventId: string;
  eventTitle: string;
  registrationLink?: string;
  className?: string;
}

export function RegistrationButton({ 
  eventId, 
  eventTitle, 
  registrationLink, 
  className = "" 
}: RegistrationButtonProps) {
  const [isRegistering, setIsRegistering] = useState(false);

  const handleEventRegistration = async () => {
    setIsRegistering(true);
    try {
      await eventsAPI.register(eventId);
      alert(`Successfully registered for "${eventTitle}"! You will receive a confirmation email.`);
    } catch (error) {
      console.error('Registration error:', error);
      alert('Failed to register for event. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  if (registrationLink) {
    return (
      <a
        href={registrationLink}
        target="_blank"
        rel="noopener noreferrer"
        className={`w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2 ${className}`}
      >
        <span>Register Now</span>
        <ExternalLink className="h-4 w-4" />
      </a>
    );
  }

  return (
    <button
      onClick={handleEventRegistration}
      disabled={isRegistering}
      className={`w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <span>{isRegistering ? 'Registering...' : 'Register Now'}</span>
      <ExternalLink className="h-4 w-4" />
    </button>
  );
}
