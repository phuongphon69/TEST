import React from 'react';
import { User } from '../../types';
import { LoginBackground } from './LoginBackground';
import { LoginForm } from './LoginForm';

interface LoginPageProps {
  onSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row overflow-x-hidden font-sans">
      {/* Left Column: Tactical Background Illustration & Content */}
      <div className="w-full lg:w-7/12 min-h-[380px] lg:min-h-screen relative border-b lg:border-b-0 lg:border-r border-slate-800">
        <LoginBackground />
      </div>

      {/* Right Column: Clean Login Form */}
      <div className="w-full lg:w-5/12 min-h-screen flex items-center justify-center p-6 bg-slate-950/80 relative">
        <div className="w-full max-w-md my-auto">
          <LoginForm onSuccess={onSuccess} />
        </div>
      </div>
    </div>
  );
};
