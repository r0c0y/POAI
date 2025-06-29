import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Edit, Save, XCircle } from 'lucide-react';
import ModernCard from '../components/ui/ModernCard';
import ModernButton from '../components/ui/ModernButton';
import { authService } from '../services/authService';
import { dataService } from '../services/dataService';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    const fetchProfile = async () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser?.uid) {
        const profile = await dataService.getPatientRecord(currentUser.uid);
        if (profile) {
          setUserProfile(profile);
          setFormData(profile.personalInfo);
        } else {
          // If no patient record, create a basic one
          const newProfile = {
            patientId: currentUser.uid,
            personalInfo: {
              name: currentUser.displayName || 'New User',
              age: 0,
              gender: '',
              phone: '',
              email: currentUser.email || '',
              emergencyContact: {
                name: '',
                phone: '',
                relationship: '',
              },
            },
            medicalInfo: {},
            recoveryPlan: {},
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          const newProfileId = await dataService.createPatientRecord(newProfile);
          setUserProfile({ ...newProfile, id: newProfileId });
          setFormData(newProfile.personalInfo);
        }
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('emergencyContact.')) {
      const ecField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [ecField]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    if (userProfile?.id) {
      try {
        await dataService.updatePatientRecord(userProfile.id, { personalInfo: formData });
        setUserProfile(prev => ({ ...prev, personalInfo: formData }));
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      } catch (error) {
        console.error('Error updating profile:', error);
        toast.error('Failed to update profile.');
      }
    }
  };

  if (!userProfile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-gray-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <ModernCard>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
              <User className="w-8 h-8 text-blue-600" />
              <span>User Profile</span>
            </h1>
            {!isEditing ? (
              <ModernButton onClick={() => setIsEditing(true)} variant="secondary" icon={Edit}>
                Edit Profile
              </ModernButton>
            ) : (
              <div className="flex space-x-2">
                <ModernButton onClick={handleSave} variant="primary" icon={Save}>
                  Save
                </ModernButton>
                <ModernButton onClick={() => setIsEditing(false)} variant="ghost" icon={XCircle}>
                  Cancel
                </ModernButton>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Personal Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{userProfile.personalInfo.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                  <p className="text-gray-900 font-medium">{userProfile.personalInfo.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Age</label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{userProfile.personalInfo.age}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Gender</label>
                  {isEditing ? (
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 font-medium">{userProfile.personalInfo.gender}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{userProfile.personalInfo.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Emergency Contact</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="emergencyContact.name"
                      value={formData.emergencyContact?.name || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{userProfile.personalInfo.emergencyContact?.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Relationship</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="emergencyContact.relationship"
                      value={formData.emergencyContact?.relationship || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{userProfile.personalInfo.emergencyContact?.relationship}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="emergencyContact.phone"
                      value={formData.emergencyContact?.phone || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{userProfile.personalInfo.emergencyContact?.phone}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ModernCard>
      </motion.div>
    </div>
  );
};

export default Profile;