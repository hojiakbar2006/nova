import { useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate, Routes, Route } from 'react-router-dom'; // Routes va Route import qilindi
import { v4 as uuidv4 } from 'uuid'; // UUID uchun
import Register from './pages/Register';
import ErrorBoundary from './components/ErrorBoundary'; // Error Boundary uchun (yaratiladi)

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    // Telegram Web App ni ishga tushirish
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
    } else {
      console.log('Telegram Web App konteksti topilmadi. Localhost rejimida ishlaydi.');
    }

    // Localhost tekshiruvi
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user;

    const setupUser = async () => {
      let userId = null;

      if (isLocalhost) {
        // Localhost uchun fake user yaratish (UUID bilan)
        const fakeUser = {
          id: uuidv4(), // Avtomatik UUID yaratish
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
          id: telegramUser.id, // Telegram ID odatda string, UUID sifatida ishlaydi
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
    };

    setupUser().catch((error) => {
      console.error('Setup xatosi:', error.message);
    });
  }, [navigate]);

  return (
    <div id="app">
      <ErrorBoundary> {/* Error Boundary qo'shildi */}
        <Routes>
          <Route path="/" element={<div>Loading...</div>} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </ErrorBoundary>
      <main></main>
    </div>
  );
}

export default App;