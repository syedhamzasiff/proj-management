'use client'

import { useState, ChangeEvent } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface ProfileSettingsProps {
  onSaveChanges: (field: string) => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onSaveChanges }) => {
  const [name, setName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [about, setAbout] = useState<string>('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  // To handle profile picture preview
   const handleProfilePictureChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(URL.createObjectURL(file));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Input
              type="Name"
              value={name}
              //onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
            <Button onClick={() => onSaveChanges('Name')} variant="default" className="mt-2">
              Save Name
            </Button>
          </div>
          <div>
            <Input
              type="Username"
              value={username}
              //onChange={(e) => setUsername(e.target.value)}
              placeholder="Your username"
            />
            <Button onClick={() => onSaveChanges('Username')} variant="default" className="mt-2">
              Save Username
            </Button>
          </div>
          <div>
            <Input
              type="email"
              value={email}
              //onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
            />
            <Button onClick={() => onSaveChanges('Email')} variant="default" className="mt-2">
              Save Email
            </Button>
          </div>
          <div>
            <Textarea
              value={about}
              //onChange={(e) => setAbout(e.target.value)}
              placeholder="Write something about yourself"
            />
            <Button onClick={() => onSaveChanges('About')} variant="default" className="mt-2">
              Save About
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Input
              type="password"
              value={password}
              //onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
            />
            <Input
              type="password"
              value={confirmPassword}
              //onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
            <Button onClick={() => onSaveChanges('Password')} variant="default" className="mt-2">
              Update Password
            </Button>
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-2">Profile Picture</label>
            <div className="flex items-center">
              <label htmlFor="profile-picture" className="cursor-pointer">
                <div className="bg-gray-200 rounded-full p-2 hover:bg-gray-300 transition-colors">
                  <Upload className="text-gray-600" />
                </div>
              </label>
              <input
                id="profile-picture"
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="hidden"
              />
              {profilePicture && (
                <div className="ml-4">
                  <img
                    src={profilePicture}
                    alt="Profile Preview"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <Button
                    onClick={() => onSaveChanges('Profile Picture')}
                    variant="default"
                    className="mt-2"
                  >
                    Save Picture
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-gray-500 text-sm">
          Changes will be saved automatically. You can update your information at any time.
        </p>
      </CardFooter>
    </Card>
  );
};

export default ProfileSettings;


/*import { useState } from 'react';

function ProfileSettings() {
    const [name, setName] = useState('');
    const [about, setAbout] = useState('');
    const [message, setMessage] = useState('');

    const handleSaveName = async () => {
        // API call to save name
        const response = await fetch('/api/profile/updateName', {
            method: 'PUT',
            body: JSON.stringify({ name }),
        });
        if (response.ok) {
            setMessage('Name updated successfully');
        } else {
            setMessage('Failed to update name');
        }
    };

    const handleSaveAbout = async () => {
        // API call to save about
        const response = await fetch('/api/profile/updateAbout', {
            method: 'PUT',
            body: JSON.stringify({ about }),
        });
        if (response.ok) {
            setMessage('About section updated successfully');
        } else {
            setMessage('Failed to update about section');
        }
    };

    return (
        <div>
            <h2>Account Settings</h2>
            <div>
                <label>Name:</label>
                <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                />
                <button onClick={handleSaveName}>Save Name</button>
            </div>
            <div>
                <label>About:</label>
                <textarea 
                    value={about} 
                    onChange={(e) => setAbout(e.target.value)} 
                />
                <button onClick={handleSaveAbout}>Save About</button>
            </div>
            {message && <p>{message}</p>}
        </div>
    );
}
}
*/