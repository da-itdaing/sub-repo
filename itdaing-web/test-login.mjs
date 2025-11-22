import { authService } from './src/services/authService.js';

(async () => {
  try {
    const data = await authService.login({ loginId: 'consumer1', password: 'pass!1234' });
    console.log('login ok', data.role, data.userId);
    const profile = await authService.getMyProfile();
    console.log('profile', profile.role, profile.id);
  } catch (err) {
    console.error('err', err);
  }
})();
