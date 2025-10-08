import React from 'react';
import { supabase } from '../../utils/supabaseClient';
import Button from '../../components/ui/Button';

const SocialLogin = () => {
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/home',
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Erreur de connexion Google:', error.message);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: window.location.origin + '/home',
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Erreur de connexion Facebook:', error.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-background text-text-secondary">
            Ou continuer avec
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button
          type="button"
          onClick={handleGoogleLogin}
          className="flex items-center justify-center space-x-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1Z"
            />
          </svg>
          <span>Google</span>
        </Button>

        <Button
          type="button"
          onClick={handleFacebookLogin}
          className="flex items-center justify-center space-x-2 bg-[#1877F2] text-white hover:bg-[#1877F2]/90"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z"
            />
          </svg>
          <span>Facebook</span>
        </Button>
      </div>
    </div>
  );
};

export default SocialLogin;