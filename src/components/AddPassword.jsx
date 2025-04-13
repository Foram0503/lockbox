import React, { useState } from 'react';
import { FiX, FiEye, FiEyeOff } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { passwordService } from '../services/api';

const AddPassword = ({ isOpen, onClose, onAdd, user }) => {
  const [formData, setFormData] = useState({
    platform: '',
    email: '',
    password: '',
    notes: '',
    tags: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generatorSettings, setGeneratorSettings] = useState({
    length: 12,
    includeUppercase: true,
    includeNumbers: true,
    includeSymbols: true,
  });

  const generatePassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let chars = lowercase;
    if (generatorSettings.includeUppercase) chars += uppercase;
    if (generatorSettings.includeNumbers) chars += numbers;
    if (generatorSettings.includeSymbols) chars += symbols;

    let password = '';
    for (let i = 0; i < generatorSettings.length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    setFormData({ ...formData, password });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.platform || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await passwordService.addPassword(
        user.id,
        formData.password,
        formData.platform,
        user.email
      );
      
      if (response.code === 11) {
        // Success
        const newPassword = {
          id: response.data.id,
          platform: formData.platform,
          email: formData.email,
          password: formData.password,
          notes: formData.notes,
          tags: formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
        };
        
        onAdd(newPassword);
        onClose();
        toast.success('Password added successfully!');
      } else {
        // Error
        toast.error('Failed to add password. Please try again.');
      }
    } catch (error) {
      console.error('Error adding password:', error);
      toast.error('An error occurred while adding the password');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Add New Password</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Platform Name *
            </label>
            <input
              type="text"
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2ecc71]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email/Username *
            </label>
            <input
              type="text"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2ecc71]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2ecc71]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Password Generator</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Length: {generatorSettings.length}
                </label>
                <input
                  type="range"
                  min="8"
                  max="32"
                  value={generatorSettings.length}
                  onChange={(e) =>
                    setGeneratorSettings({
                      ...generatorSettings,
                      length: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
              </div>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={generatorSettings.includeUppercase}
                    onChange={(e) =>
                      setGeneratorSettings({
                        ...generatorSettings,
                        includeUppercase: e.target.checked,
                      })
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-600">Uppercase</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={generatorSettings.includeNumbers}
                    onChange={(e) =>
                      setGeneratorSettings({
                        ...generatorSettings,
                        includeNumbers: e.target.checked,
                      })
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-600">Numbers</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={generatorSettings.includeSymbols}
                    onChange={(e) =>
                      setGeneratorSettings({
                        ...generatorSettings,
                        includeSymbols: e.target.checked,
                      })
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-600">Symbols</span>
                </label>
              </div>
              <button
                type="button"
                onClick={generatePassword}
                className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Generate Password
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2ecc71]"
              rows="2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2ecc71]"
              placeholder="work, email, social"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-white bg-[#2ecc71] rounded-lg hover:bg-[#27ae60] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Adding...' : 'Add Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPassword; 