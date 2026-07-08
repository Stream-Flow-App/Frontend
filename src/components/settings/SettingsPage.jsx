import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateProfile, changePassword } from '../../utils/authUtils';
import { useTheme } from '../../context/ThemeContext';
import { UserCog, Lock, Save, Phone, KeyRound, CheckCircle2, AlertCircle, MonitorSmartphone, Sun, Moon, Volume2, Database } from 'lucide-react';

const countryCodes = [
  { code: '+1', label: '🇺🇸 +1' },
  { code: '+44', label: '🇬🇧 +44' },
  { code: '+91', label: '🇮🇳 +91' },
  { code: '+61', label: '🇦🇺 +61' },
  { code: '+81', label: '🇯🇵 +81' },
  { code: '+49', label: '🇩🇪 +49' },
  { code: '+33', label: '🇫🇷 +33' },
  { code: '+971', label: '🇦🇪 +971' },
  { code: '+966', label: '🇸🇦 +966' },
  { code: '+20', label: '🇪🇬 +20' },
  { code: '+212', label: '🇲🇦 +212' },
  { code: '+213', label: '🇩🇿 +213' },
  { code: '+216', label: '🇹🇳 +216' },
];

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  
  const [activeTab, setActiveTab] = useState('account');

  // Account Form State
  const [accountData, setAccountData] = useState({
    phone: '',
  });
  const [countryCode, setCountryCode] = useState('+1');
  const [isAccountSaving, setIsAccountSaving] = useState(false);
  const [accountMessage, setAccountMessage] = useState({ type: '', text: '' });
  
  // Security Form State
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
  });
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  // Preferences State
  const [audioQuality, setAudioQuality] = useState('high');
  const [dataSaver, setDataSaver] = useState(false);

  useEffect(() => {
    if (user) {
      let initialPhone = user.phone === 'No Phone Number' ? '' : (user.phone || '');
      let parsedCode = '+1'; // Default
      
      if (initialPhone) {
        // Match country code
        const foundCode = countryCodes.find(c => initialPhone.startsWith(c.code));
        if (foundCode) {
          parsedCode = foundCode.code;
          initialPhone = initialPhone.slice(foundCode.code.length).trim();
        }
      }

      setAccountData({
        phone: initialPhone,
      });
      setCountryCode(parsedCode);
    }
  }, [user]);

  const handleAccountChange = (e) => {
    setAccountData({ ...accountData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    setIsAccountSaving(true);
    setAccountMessage({ type: '', text: '' });

    try {
      const submitData = {
        phone: accountData.phone.trim() ? `${countryCode} ${accountData.phone.trim()}` : 'No Phone Number'
      };
      const result = await updateProfile(submitData);
      if (result.success) {
        setAccountMessage({ type: 'success', text: 'Account updated successfully!' });
        updateUser(result.user);
      }
    } catch (error) {
      setAccountMessage({ type: 'error', text: error.message || 'Failed to update account.' });
    } finally {
      setIsAccountSaving(false);
      setTimeout(() => setAccountMessage({ type: '', text: '' }), 3000);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsPasswordSaving(true);
    setPasswordMessage({ type: '', text: '' });

    try {
      const result = await changePassword(passwordData.oldPassword, passwordData.newPassword);
      if (result.success) {
        setPasswordMessage({ type: 'success', text: result.message });
        setPasswordData({ oldPassword: '', newPassword: '' });
      }
    } catch (error) {
      setPasswordMessage({ type: 'error', text: error.message || 'Failed to change password.' });
    } finally {
      setIsPasswordSaving(false);
      setTimeout(() => setPasswordMessage({ type: '', text: '' }), 4000);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Settings Header */}
      <div className="relative overflow-hidden bg-[#0f0c29] p-8 sm:p-12 text-white">
        {/* Abstract shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-40 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[150%] bg-purple-600 rounded-full mix-blend-screen filter blur-[100px] opacity-50 animate-blob"></div>
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[120%] bg-cyan-500 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-blob animation-delay-2000"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-2">App Settings</h1>
          <p className="text-gray-300 text-sm sm:text-base">Manage your private account details and app preferences.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8 relative z-20">
        
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-1 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50">
          <button
            onClick={() => setActiveTab('account')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'account' 
                ? 'bg-purple-600 text-white shadow-md' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <UserCog className="w-4 h-4" />
            <span className="hidden sm:inline">Account</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'security' 
                ? 'bg-purple-600 text-white shadow-md' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span className="hidden sm:inline">Security</span>
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'preferences' 
                ? 'bg-purple-600 text-white shadow-md' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <MonitorSmartphone className="w-4 h-4" />
            <span className="hidden sm:inline">Preferences</span>
          </button>
        </div>

        {/* Account Content */}
        {activeTab === 'account' && (
          <div className="bg-white/90 dark:bg-white/5 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200/50 dark:border-gray-700/50 transition-all">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Private Details</h2>
            
            <form onSubmit={handleAccountSubmit} className="space-y-6 max-w-xl">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" /> Phone Number
                </label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none dark:text-white"
                  >
                    {countryCodes.map(country => (
                      <option key={country.code} value={country.code}>
                        {country.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    name="phone"
                    value={accountData.phone}
                    onChange={handleAccountChange}
                    className="flex-1 w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all dark:text-white"
                    placeholder="Enter your phone number (e.g. 555-0100)"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This number is kept private and used for account recovery.</p>
              </div>

              {accountMessage.text && (
                <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${accountMessage.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'}`}>
                  {accountMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {accountMessage.text}
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="submit"
                  disabled={isAccountSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-95 shadow-md shadow-purple-500/20"
                >
                  <Save className="w-4 h-4" />
                  {isAccountSaving ? 'Saving...' : 'Save Private Details'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Security Content */}
        {activeTab === 'security' && (
          <div className="bg-white/90 dark:bg-white/5 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200/50 dark:border-gray-700/50 transition-all">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Security & Password</h2>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-xl">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-gray-400" /> Current Password
                </label>
                <input
                  type="password"
                  name="oldPassword"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all dark:text-white"
                  placeholder="Enter your current password"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-gray-400" /> New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all dark:text-white"
                  placeholder="Enter a strong new password"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Must be at least 6 characters long.</p>
              </div>

              {passwordMessage.text && (
                <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${passwordMessage.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'}`}>
                  {passwordMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {passwordMessage.text}
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="submit"
                  disabled={isPasswordSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-95 shadow-md shadow-purple-500/20"
                >
                  <Lock className="w-4 h-4" />
                  {isPasswordSaving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Preferences Content */}
        {activeTab === 'preferences' && (
          <div className="bg-white/90 dark:bg-white/5 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200/50 dark:border-gray-700/50 transition-all">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">App Preferences</h2>
            
            <div className="space-y-8 max-w-2xl">
              
              {/* Theme Toggle */}
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-6">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />} 
                    Appearance
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Toggle between Light and Dark mode.</p>
                </div>
                <button
                  onClick={toggleTheme}
                  className="relative inline-flex h-7 w-14 items-center rounded-full bg-gray-200 dark:bg-purple-600 transition-colors focus:outline-none"
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      isDark ? 'translate-x-8' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Audio Quality */}
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-6">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Volume2 className="w-4 h-4" /> 
                    Audio Quality
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Choose your preferred streaming quality.</p>
                </div>
                <select 
                  value={audioQuality}
                  onChange={(e) => setAudioQuality(e.target.value)}
                  className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none dark:text-white"
                >
                  <option value="standard">Standard (96 kbps)</option>
                  <option value="high">High (160 kbps)</option>
                  <option value="ultra">Ultra (320 kbps)</option>
                </select>
              </div>

              {/* Data Saver */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Database className="w-4 h-4" /> 
                    Data Saver
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sets audio quality to standard when on mobile data.</p>
                </div>
                <button
                  onClick={() => setDataSaver(!dataSaver)}
                  className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none ${dataSaver ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      dataSaver ? 'translate-x-8' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
