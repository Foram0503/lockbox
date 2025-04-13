import React, { useState, useEffect, useRef } from 'react';
import { FiEye, FiEyeOff, FiCopy, FiPlus, FiSearch, FiMoon, FiSun, FiLogOut, FiEdit2, FiDownload, FiUpload, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { passwordService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [passwords, setPasswords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPassword, setEditingPassword] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);
  const [suggestedPassword, setSuggestedPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    if (user && user.email) {
      fetchPasswords();
    }
  }, [user]);

  const fetchPasswords = async () => {
    if (!user || !user.email) {
      console.error('No user email available');
      return;
    }

    try {
      setLoading(true);
      const response = await passwordService.getPasswords(user.email);
      
      if (response.code === '130') {
        const formattedPasswords = response.data.map(pass => ({
          id: pass.id,
          platform: pass.name,
          email: pass.email,
          password: pass.password,
          created_at: pass.created_at
        }));
        setPasswords(formattedPasswords);
      }
    } catch (error) {
      console.error('Error fetching passwords:', error);
      if (error.message === 'Session expired. Please login again.') {
        toast.error('Session expired. Please login again.');
        onLogout();
      } else {
        toast.error('Failed to fetch passwords');
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (id) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleEditPassword = (password) => {
    setEditingPassword(password);
  };

  const handleUpdatePassword = async (updatedPassword) => {
    try {
      const response = await passwordService.updatePassword(updatedPassword);
      if (response.code === '150') {
        toast.success('Password updated successfully');
        setEditingPassword(null);
        fetchPasswords(); // Refresh the password list
      }
    } catch (error) {
      console.error('Error updating password:', error);
      if (error.message === 'Session expired. Please login again.') {
        toast.error('Session expired. Please login again.');
        onLogout();
      } else {
        toast.error('Failed to update password');
      }
    }
  };

  const handleExportPasswords = async () => {
    try {
      await passwordService.exportPasswords(user.email);
      toast.success('Passwords exported successfully');
    } catch (error) {
      console.error('Error exporting passwords:', error);
      toast.error('Failed to export passwords');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check if it's a CSV file
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast.error('Please select a valid CSV file');
      return;
    }
    
    try {
      setIsImporting(true);
      const response = await passwordService.importPasswords(user.email, file);
      
      if (response.code === '172') {
        toast.success(`Successfully imported ${response.data.imported} passwords`);
        fetchPasswords(); // Refresh the password list
      } else {
        toast.error(response.message || 'Failed to import passwords');
        if (response.errors && response.errors.length > 0) {
          console.error('Import errors:', response.errors);
        }
      }
    } catch (error) {
      console.error('Error importing passwords:', error);
      if (error.message === 'Session expired. Please login again.') {
        toast.error('Session expired. Please login again.');
        onLogout();
      } else {
        toast.error('Failed to import passwords');
      }
    } finally {
      setIsImporting(false);
      // Reset the file input
      event.target.value = '';
    }
  };

  const handleDeletePassword = async (passwordId) => {
    if (window.confirm('Are you sure you want to delete this password?')) {
      try {
        const response = await passwordService.deletePassword(passwordId);
        if (response.code === '160') {
          toast.success('Password deleted successfully');
          fetchPasswords(); // Refresh the password list
        }
      } catch (error) {
        console.error('Error deleting password:', error);
        if (error.message === 'Session expired. Please login again.') {
          toast.error('Session expired. Please login again.');
          onLogout();
        } else {
          toast.error('Failed to delete password');
        }
      }
    }
  };

  const filteredPasswords = passwords.filter(
    (pass) =>
      (pass.platform?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (pass.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (pass.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) || false)
  );

  // Function to generate a strong password
  const generatePassword = async () => {
    try {
      const response = await passwordService.generatePassword();
      if (response.code === '180') {
        setSuggestedPassword(response.data.password);
        setPasswordStrength(response.data.strength);
      } else {
        toast.error('Failed to generate password');
      }
    } catch (error) {
      console.error('Error generating password:', error);
      toast.error('Failed to generate password');
    }
  };

  // Function to get strength color
  const getStrengthColor = () => {
    if (passwordStrength <= 25) return 'bg-red-500';
    if (passwordStrength <= 50) return 'bg-orange-500';
    if (passwordStrength <= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Function to get strength text
  const getStrengthText = () => {
    if (passwordStrength <= 25) return 'Weak';
    if (passwordStrength <= 50) return 'Fair';
    if (passwordStrength <= 75) return 'Good';
    return 'Strong';
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Welcome back, {user?.email?.split('@')[0] || 'User'}!
            </h1>
            <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Manage your passwords securely
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleImportClick}
              className={`p-2 rounded-lg ${
                darkMode ? 'bg-gray-800 text-blue-400' : 'bg-white text-gray-600'
              } shadow-md hover:shadow-lg transition-all`}
              title="Import from CSV"
              disabled={isImporting}
            >
              <FiDownload size={20} />
            </button>
            <button
              onClick={handleExportPasswords}
              className={`p-2 rounded-lg ${
                darkMode ? 'bg-gray-800 text-green-400' : 'bg-white text-gray-600'
              } shadow-md hover:shadow-lg transition-all`}
              title="Export as CSV"
            >
              <FiUpload size={20} />
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg ${
                darkMode ? 'bg-gray-800 text-yellow-400' : 'bg-white text-gray-600'
              } shadow-md hover:shadow-lg transition-all`}
            >
              {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>
            <button
              onClick={() => navigate('/add-password')}
              className="flex items-center px-4 py-2 bg-[#2ecc71] text-white rounded-lg hover:bg-[#27ae60] transition-colors"
            >
              <FiPlus className="mr-2" />
              Add Password
            </button>
            <button
              onClick={onLogout}
              className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <FiLogOut className="mr-2" />
              Logout
            </button>
          </div>
        </div>

        {/* Hidden file input for CSV import */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv,text/csv"
          className="hidden"
        />

        <div className="mb-6">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search passwords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                darkMode
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#2ecc71]`}
            />
          </div>
        </div>

        {/* Password Generator Section */}
        <div className={`mb-8 p-6 rounded-xl shadow-md ${
          darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        }`}>
          <h2 className="text-xl font-semibold mb-4">Password Generator</h2>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={suggestedPassword}
              readOnly
              className={`flex-1 p-2 rounded-lg ${
                darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
              }`}
              placeholder="Click generate to create a password"
            />
            <button
              onClick={generatePassword}
              className={`p-2 rounded-lg ${
                darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
              } hover:bg-opacity-80 transition-colors`}
              title="Generate new password"
            >
              <FiRefreshCw size={20} />
            </button>
            <button
              onClick={() => copyToClipboard(suggestedPassword)}
              className={`p-2 rounded-lg ${
                darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
              } hover:bg-opacity-80 transition-colors`}
              title="Copy password"
            >
              <FiCopy size={20} />
            </button>
          </div>
          {suggestedPassword && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Password Strength:</span>
                <span className={`text-sm font-medium ${getStrengthColor().replace('bg-', 'text-')}`}>
                  {getStrengthText()}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getStrengthColor()} transition-all duration-300`}
                  style={{ width: `${passwordStrength}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2ecc71]"></div>
          </div>
        ) : filteredPasswords.length === 0 ? (
          <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <p className="text-xl">No passwords found</p>
            <p className="mt-2">Add your first password to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPasswords.map((pass) => (
              <div
                key={pass.id}
                className={`p-6 rounded-xl shadow-md ${
                  darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{pass.platform}</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {pass.email}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditPassword(pass)}
                      className={`p-2 rounded-lg ${
                        darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700'
                      } hover:bg-opacity-80 transition-colors`}
                      title="Edit password"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      onClick={() => copyToClipboard(pass.password)}
                      className={`p-2 rounded-lg ${
                        darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700'
                      } hover:bg-opacity-80 transition-colors`}
                      title="Copy password"
                    >
                      <FiCopy size={16} />
                    </button>
                    <button
                      onClick={() => togglePasswordVisibility(pass.id)}
                      className={`p-2 rounded-lg ${
                        darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700'
                      } hover:bg-opacity-80 transition-colors`}
                      title={visiblePasswords[pass.id] ? 'Hide password' : 'Show password'}
                    >
                      {visiblePasswords[pass.id] ? (
                        <FiEyeOff size={16} />
                      ) : (
                        <FiEye size={16} />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeletePassword(pass.id)}
                      className={`p-2 rounded-lg ${
                        darkMode ? 'bg-gray-700 text-red-400' : 'bg-gray-100 text-red-600'
                      } hover:bg-opacity-80 transition-colors`}
                      title="Delete password"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type={visiblePasswords[pass.id] ? 'text' : 'password'}
                    value={pass.password}
                    readOnly
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                {pass.tags && pass.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {pass.tags.map((tag, index) => (
                      <span
                        key={index}
                        className={`px-2 py-1 text-xs rounded-full ${
                          darkMode
                            ? 'bg-gray-700 text-gray-300'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Password Modal */}
      {editingPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-xl shadow-lg w-full max-w-md ${
            darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          }`}>
            <h2 className="text-2xl font-bold mb-4">Edit Password</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdatePassword(editingPassword);
            }}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Platform</label>
                <input
                  type="text"
                  value={editingPassword.platform}
                  onChange={(e) => setEditingPassword({
                    ...editingPassword,
                    platform: e.target.value
                  })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Email/Username</label>
                <input
                  type="text"
                  value={editingPassword.email}
                  onChange={(e) => setEditingPassword({
                    ...editingPassword,
                    email: e.target.value
                  })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="text"
                  value={editingPassword.password}
                  onChange={(e) => setEditingPassword({
                    ...editingPassword,
                    password: e.target.value
                  })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingPassword(null)}
                  className={`px-4 py-2 rounded-lg ${
                    darkMode
                      ? 'bg-gray-700 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2ecc71] text-white rounded-lg hover:bg-[#27ae60] transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 