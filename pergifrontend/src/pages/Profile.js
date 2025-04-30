import React, { useRef, useState, useEffect } from 'react';
import { useAuthContext } from '../hooks/useAuthContext'; // Asegúrate de tener este hook
import Navbar from '../components/Navbar'; // Ajusta el path según tu estructura
import { useNavigate } from 'react-router-dom';
import 'react-datepicker/dist/react-datepicker.css';


const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth || '');
  


  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(user?.image || '/profile.svg');
  const [uploading, setUploading] = useState(false);


  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl); // Mostrar preview inmediata
      setUploading(true);

      const formData = new FormData();
      formData.append('profileImage', file);

      try {
        const response = await fetch('/api/upload-profile-image', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${user.token}` // Si usas auth por token
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error('We couldn\'t process your image');
        }

        const data = await response.json();

        // Si el backend devuelve la URL nueva:
        if (data.imageUrl) {
          setPreview(data.imageUrl);
        }

      } catch (error) {
        console.error('Error trying to upload the picture:', error);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  if (!user) {
    return <div className="text-white p-4">Loading profile...</div>;
  }

  const birthDate = new Date(user.dateOfBirth);
  const formattedDate = birthDate.toLocaleDateString('en-US'); // Formato de fecha en inglés (MM/DD/YYYY)

  const handleSaveProfile = async () => {
    try {
      const response = await fetch('/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ dateOfBirth }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to save profile changes');
      }
  
      alert('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Error updating profile');
    }
  };
  
  const today = new Date();
  const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <div className="flex flex-col items-center mt-10">
        <img
          src={preview}
          alt={user.name}
          className={`h-40 w-40 rounded-full object-cover border-4 border-white mb-4 ${!user.image ? 'invert' : ''}`}
        />
        <h1 className="text-2xl font-bold mt-3">{user.name +' ' + user.surname}</h1>

        <div className='flex flex-col items-start'>
          <h1 className="text-gray-200 mt-12">{user.email}</h1>
          <label className="text-gray-200 mt-3">
            Date of birth:
            <input
              type='date'
              selected={dateOfBirth}
              onChange={(date) => setDateOfBirth(date)}
              placeholder=' MM/dd/YYYY'
              max={localDate}
              className='bg-transparent'
            />

          </label>

          <button
            onClick={() => navigate('/oranges')}
            className="mt-2 p-0 border-none text-gray-200 hover:underline"
          >
            See your number of essays
          </button>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={handleUploadClick}
            className="p-0 border-none text-gray-200 bg-0 mt-2 hover:underline"
          >
            Change profile picture
          </button>

          <button
            className="block text-left text-gray-200 hover:underline w-full mt-2"
            onClick={() => navigate('/billing')}
          >
            Billing
          </button>

          <button
            onClick={handleSaveProfile}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Save Changes
          </button>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
