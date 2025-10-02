import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Telegram Web App ni ishga tushirish
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
    } else {
      console.warn('Telegram Web App konteksti topilmadi. Localhost rejimida ishlaydi.');
    }

    // Localhost tekshiruvi
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user;

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
          phone_number: telegramUser.phone_number || '+998000000000',
          telegram_phone: telegramUser.phone_number || null,
          location_lat: null,
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

      // Foydalanuvchi tayyor bo'lsa, Register sahifasiga o'tish
      if (userId) {
        navigate('/register');
      } else {
        console.error('Foydalanuvchi aniqlanmadi!');
      }
      setIsLoading(false); // Yuklanish tugadi
    };

    setupUser().catch((error) => {
      console.error('Setup xatosi:', error.message);
      setIsLoading(false);
    });
  }, [navigate]);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>Marketplace</h1>
          <p style={{ marginTop: '10px', color: '#666' }}>Iltimos, kuting... Foydalanuvchi tekshirilmoqda.</p>
        </div>
      </div>
    );
  }

  return null; // Yuklanish tugagach, Register ga o'tadi
}

export default App;