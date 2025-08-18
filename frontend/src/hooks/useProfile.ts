import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { UpdateProfileRequest } from '../types';

export const profileKeys = {
  all: ['profile'] as const,
  update: () => [...profileKeys.all, 'update'] as const,
} as const;

// Hook for updating profile
export function useUpdateProfile() {
  return useMutation({
    mutationKey: profileKeys.update(),
    mutationFn: (profileData: UpdateProfileRequest) => apiClient.updateProfile(profileData),
    onSuccess: (data) => {
      console.log('Profile updated successfully:', data);
    },
    onError: (error) => {
      console.error('Failed to update profile:', error);
    },
  });
}
