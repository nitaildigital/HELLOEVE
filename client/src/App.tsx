import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import LandingPage from '@/components/LandingPage';
import Wizard from '@/components/Wizard';
import Dashboard from '@/components/Dashboard';
import EveAssistant from '@/components/EveAssistant';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import { SiteData } from '@/types';
import { INITIAL_SITE_DATA } from '@/constants';
import { auth, sites, isAuthenticated, clearTokens } from '@/services/api';

type View = 'landing' | 'login' | 'register' | 'wizard' | 'dashboard';

const App: React.FC = () => {
  const [siteData, setSiteData] = useState<SiteData>(INITIAL_SITE_DATA);
  const [siteId, setSiteId] = useState<string | undefined>();
  const [userEmail, setUserEmail] = useState<string | undefined>();
  const [userName, setUserName] = useState<string | undefined>();
  const [view, setView] = useState<View>(isAuthenticated() ? 'dashboard' : 'landing');
  const [authError, setAuthError] = useState<string | undefined>();

  useEffect(() => {
    if (isAuthenticated()) {
      auth.me().then(user => {
        setUserEmail(user.email);
        setUserName(user.name);
        loadUserSite();
      }).catch(() => {
        clearTokens();
        setView('landing');
      });
    }
  }, []);

  const loadUserSite = async () => {
    try {
      const userSites = await sites.list();
      if (userSites.length > 0) {
        const site = userSites[0];
        setSiteId(site.id);
        setSiteData({
          businessName: site.businessName,
          businessNameEn: site.businessNameEn,
          type: site.type as any,
          domain: site.domain || '',
          logoUrl: site.logoUrl,
          colors: { primary: site.colorPrimary, secondary: site.colorSecondary },
          font: site.font,
          about: site.about,
          services: site.services || [],
          contact: site.contact || { phone: '', email: '', address: '', whatsapp: '' },
          isLaunched: site.isLaunched,
        });
        setView(site.isLaunched ? 'dashboard' : 'wizard');
      } else {
        setView('wizard');
      }
    } catch {
      setView('wizard');
    }
  };

  const handleLogin = async (email: string, password: string) => {
    setAuthError(undefined);
    try {
      const user = await auth.login(email, password);
      setUserEmail(user.email);
      setUserName(user.name);
      await loadUserSite();
    } catch (err: any) {
      setAuthError(err.message || 'Login failed');
    }
  };

  const handleRegister = async (email: string, password: string, name: string) => {
    setAuthError(undefined);
    try {
      const user = await auth.register(email, password, name);
      setUserEmail(user.email);
      setUserName(user.name);
      setView('wizard');
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed');
    }
  };

  const handleGoogleLogin = () => {
    // Google OAuth would be integrated with @react-oauth/google
    // For now, show a message
    setAuthError('Google login requires GOOGLE_CLIENT_ID configuration');
  };

  const handleStartBuilding = () => {
    if (isAuthenticated()) {
      setView('wizard');
    } else {
      setView('register');
    }
  };

  const handleLogout = async () => {
    await auth.logout();
    setUserEmail(undefined);
    setUserName(undefined);
    setSiteData(INITIAL_SITE_DATA);
    setSiteId(undefined);
    setView('landing');
  };

  const handleLaunch = async (data: SiteData) => {
    try {
      if (siteId) {
        await sites.update(siteId, {
          businessName: data.businessName,
          businessNameEn: data.businessNameEn,
          type: data.type,
          domain: data.domain,
          colorPrimary: data.colors.primary,
          colorSecondary: data.colors.secondary,
          font: data.font,
          about: data.about,
        });
        await sites.launch(siteId);
      } else {
        const newSite = await sites.create({
          businessName: data.businessName,
          businessNameEn: data.businessNameEn,
          type: data.type,
          domain: data.domain,
          colorPrimary: data.colors.primary,
          colorSecondary: data.colors.secondary,
          font: data.font,
          about: data.about,
        });
        setSiteId(newSite.id);
        await sites.launch(newSite.id);
      }
      setSiteData({ ...data, isLaunched: true });
      setView('dashboard');
    } catch (err) {
      console.error('Launch error:', err);
      setSiteData({ ...data, isLaunched: true });
      setView('dashboard');
    }
  };

  const renderView = () => {
    switch (view) {
      case 'landing':
        return <LandingPage onStart={handleStartBuilding} />;
      case 'login':
        return (
          <Login
            onLogin={handleLogin}
            onGoogleLogin={handleGoogleLogin}
            onSwitchToRegister={() => { setAuthError(undefined); setView('register'); }}
            error={authError}
          />
        );
      case 'register':
        return (
          <Register
            onRegister={handleRegister}
            onGoogleLogin={handleGoogleLogin}
            onSwitchToLogin={() => { setAuthError(undefined); setView('login'); }}
            error={authError}
          />
        );
      case 'wizard':
        return <Wizard initialData={siteData} onComplete={handleLaunch} />;
      case 'dashboard':
        return <Dashboard siteData={siteData} />;
    }
  };

  return (
    <Layout
      userEmail={userEmail}
      onLogin={() => setView('login')}
      onLogout={handleLogout}
    >
      {renderView()}
      {(view === 'wizard' || view === 'dashboard') && userEmail && (
        <EveAssistant siteData={siteData} siteId={siteId} />
      )}
    </Layout>
  );
};

export default App;
