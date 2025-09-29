import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { user, loading } = useAuth();

  // Redirect authenticated users to the main page
  useEffect(() => {
    if (user && !loading) {
      // User is authenticated, they will be redirected by the Navigate component below
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-dashboard">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-dashboard p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Brand */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto">
            <span className="text-primary-foreground font-bold text-xl">iW</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">iWorx</h1>
            <p className="text-muted-foreground">Enterprise Asset Management</p>
          </div>
        </div>

        {/* Auth Form */}
        {isLogin ? (
          <LoginForm onToggleForm={toggleForm} />
        ) : (
          <SignUpForm onToggleForm={toggleForm} />
        )}
      </div>
    </div>
  );
}