import { useEffect } from 'react';
import { supabase } from './supabaseClient';

function App() {
  useEffect(() => {
    // Telegram Web App ni ishga tushirish
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
    }

    // Localhost tekshiruvi
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const telegramUser = window.Telegram?.WebApp.initDataUnsafe?.user;

    const setupUser = async () => {
      let userId = null;

      if (isLocalhost) {
        // Localhost uchun fake user yaratish
        const fakeUser = {
          id: 'fake-user-123',
          username: 'test_user',
          phone_number: '+998901234567',
          telegram_phone: null,
          location_lat: 41.3111, // Toshkent
          location_lng: 69.2401,
        };

        const { error } = await supabase.from('profiles').upsert(fakeUser);
        if (error) {
          console.error('Fake user qo‘shishda xato:', error.message);
        } else {
          console.log('Fake user muvaffaqiyatli qo‘shildi:', fakeUser);
        }
        userId = fakeUser.id;
      } else if (telegramUser) {
        // Telegram bot orqali kirgan foydalanuvchi
        const userData = {
          id: telegramUser.id,
          username: telegramUser.username || 'telegram_user',
          phone_number: telegramUser.phone_number || '+998000000000', // Agar yo‘q bo‘lsa, default
          telegram_phone: telegramUser.phone_number || null,
          location_lat: null, // Lokatsiyani keyin olish mumkin
          location_lng: null,
        };

        const { error } = await supabase.from('profiles').upsert(userData);
        if (error) {
          console.error('Telegram user saqlashda xato:', error.message);
        } else {
          console.log('Telegram user saqlandi:', userData);
        }
        userId = telegramUser.id;
      }

      // Keyingi sahifaga o‘tish yoki boshqa logika
      if (userId) {
        // Masalan, ro‘yxatdan o‘tish sahifasiga yo‘naltirish
        console.log('Foydalanuvchi tayyor:', userId);
      }
    };

    setupUser();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Marketplace</h1>
        <p className="mt-2">Iltimos, kuting... Foydalanuvchi tekshirilmoqda.</p>
      </div>
    </div>
  );
}

export default App;