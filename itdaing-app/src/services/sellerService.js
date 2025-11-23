import apiClient from '@/api/client';

export async function getSellerDashboard() {
  return apiClient.get('/sellers/me/dashboard');
}

export async function getSellerProfile() {
  return apiClient.get('/sellers/me/profile');
}


