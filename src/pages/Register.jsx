import React, { useState, useEffect } from 'react';
import './Register.css';
import Logo from '../../public/Nova.png';
import UzFlag from '../assets/UzbekistanFlag.png';
import { supabase } from '../supabaseClient';

export default function Register() {
  const [phoneNumber, setPhoneNumber] = useState('+998');
  const [location, setLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [telegramUser, setTelegramUser] = useState(null);
  const [userPhoto, setUserPhoto] = useState(null);

  // Telegram Mini App ma'lumotlarini olish
  useEffect(() => {
    // Telegram WebApp SDK mavjudligini tekshirish
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      
      // WebApp ni kengaytirish
      tg.expand();
      
      // Foydalanuvchi ma'lumotlarini olish
      const user = tg.initDataUnsafe?.user;
      
      if (user) {
        setTelegramUser(user);
        
        // Agar telefon raqam mavjud bo'lsa, uni o'rnatish
        if (user.phone_number) {
          setPhoneNumber(user.phone_number.startsWith('+') ? user.phone_number : '+' + user.phone_number);
        }
        
        // Foydalanuvchi rasmini olish
        if (user.photo_url) {
          setUserPhoto(user.photo_url);
        } else {
          // Agar rasm yo'q bo'lsa, Telegram API orqali olishga harakat qilish
          fetchTelegramUserPhoto(user.id);
        }
        
        console.log('Telegram User:', user);
      } else {
        console.warn('Telegram user ma\'lumotlari topilmadi. Mini App tashqarida ochilgan bo\'lishi mumkin.');
      }
    } else {
      console.warn('Telegram WebApp SDK topilmadi. Iltimos, Telegram ichida oching.');
    }
  }, []);

  // Telegram foydalanuvchi rasmini olish (ixtiyoriy)
  const fetchTelegramUserPhoto = async (userId) => {
    try {
      // Bu yerda backend API orqali rasmni olish kerak
      // Chunki Telegram Bot API dan foydalanish kerak
      // Masalan: /api/telegram/getUserPhoto?userId=${userId}
      
      // Hozircha placeholder ishlatamiz
      console.log('User photo yo\'q, default photo ishlatiladi');
    } catch (error) {
      console.error('Rasmni olishda xatolik:', error);
    }
  };

  // Telefon raqamni formatlash
  const handlePhoneChange = (e) => {
    let value = e.target.value;
    value = value.replace(/[^\d+]/g, '');
    
    if (!value.startsWith('+998')) {
      value = '+998';
    }
    
    if (value.length <= 13) {
      setPhoneNumber(value);
    }
  };

  // Telefon raqamni formatlangan ko'rinishda ko'rsatish
  const formatPhoneDisplay = (phone) => {
    if (phone.length <= 4) return phone;
    
    const cleaned = phone.replace('+998', '');
    const match = cleaned.match(/^(\d{0,2})(\d{0,3})(\d{0,2})(\d{0,2})$/);
    
    if (match) {
      let formatted = '+998';
      if (match[1]) formatted += `-${match[1]}`;
      if (match[2]) formatted += `-${match[2]}`;
      if (match[3]) formatted += `-${match[3]}`;
      if (match[4]) formatted += `-${match[4]}`;
      return formatted;
    }
    
    return phone;
  };

  // Lokatsiyani olish
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setSubmissionStatus('error');
      setTimeout(() => {
        alert('Brauzeringiz geolokatsiyani qo\'llab-quvvatlamaydi');
      }, 100);
      return;
    }

    setIsLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({
          lat: latitude.toFixed(6),
          lng: longitude.toFixed(6)
        });
        setIsLoadingLocation(false);
      },
      (error) => {
        setIsLoadingLocation(false);
        let errorMessage = 'Lokatsiyani olishda xatolik yuz berdi';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Lokatsiya ruxsati rad etildi. Iltimos, brauzer sozlamalaridan ruxsat bering.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Lokatsiya ma\'lumoti mavjud emas';
            break;
          case error.TIMEOUT:
            errorMessage = 'Lokatsiyani olish vaqti tugadi';
            break;
          default:
            errorMessage = 'Noma\'lum xatolik yuz berdi';
        }
        
        alert(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Formani yuborish va Supabase ga saqlash
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validatsiya
    if (phoneNumber.length < 13) {
      setSubmissionStatus('error');
      alert('Iltimos, to\'liq telefon raqamini kiriting');
      return;
    }

    if (!location) {
      setSubmissionStatus('error');
      alert('Iltimos, avval lokatsiyangizni aniqlang');
      return;
    }

    setIsSubmitting(true);
    setSubmissionStatus('loading');

    try {
      // Ma'lumotlarni Supabase ga yuborish
      const userData = {
        id: telegramUser?.id?.toString() || crypto.randomUUID(),
        phone_number: phoneNumber,
        location_lat: parseFloat(location.lat),
        location_lng: parseFloat(location.lng),
        username: telegramUser?.username || 'user_' + Math.random().toString(36).substring(2, 8),
        first_name: telegramUser?.first_name || null,
        last_name: telegramUser?.last_name || null,
        photo_url: userPhoto || null,
        telegram_id: telegramUser?.id || null,
        language_code: telegramUser?.language_code || 'uz',
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert(userData)
        .select();

      if (error) {
        console.error('Ma\'lumotlar saqlashda xatolik:', error);
        setSubmissionStatus('error');
        
        // Xatolik turini aniqlash
        if (error.code === '23505') {
          alert('Bu telefon raqam yoki Telegram ID allaqachon ro\'yxatdan o\'tgan!');
        } else {
          alert('Ma\'lumotlarni saqlashda xatolik yuz berdi: ' + error.message);
        }
      } else {
        console.log('Ma\'lumotlar muvaffaqiyatli saqlandi:', data);
        setSubmissionStatus('success');
        
        // Telegram WebApp ga xabar yuborish
        if (window.Telegram?.WebApp) {
          window.Telegram.WebApp.showAlert('Ro\'yxatdan o\'tish muvaffaqiyatli!', () => {
            // Mini App ni yopish yoki boshqa sahifaga o'tkazish
            // window.Telegram.WebApp.close();
          });
        }
        
        // 3 soniyadan keyin formani tozalash (ixtiyoriy)
        setTimeout(() => {
          setPhoneNumber('+998');
          setLocation(null);
          setSubmissionStatus(null);
        }, 3000);
      }
    } catch (err) {
      console.error('Kutilmagan xatolik:', err);
      setSubmissionStatus('error');
      alert('Kutilmagan xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-page">
      <div className="content-register">
        <div className="register-imgs">
          <div className="nova-img-register">
            <img src={Logo} alt="NOVA logo" />
          </div>
          <div className="user-img-register">
            {userPhoto ? (
              <img src={userPhoto} alt="user profile" />
            ) : telegramUser ? (
              <div className="user-initials">
                {telegramUser.first_name?.[0]}{telegramUser.last_name?.[0]}
              </div>
            ) : (
              <img src={Logo} alt="default user img" />
            )}
          </div>
        </div>

        <div className="register-forms">
          <form onSubmit={handleSubmit}>
            <h3>Ro'yhatdan o'tish</h3>
            
            {telegramUser && (
              <div className="user-greeting">
                <p>Assalomu alaykum, {telegramUser.first_name}!</p>
              </div>
            )}
            
            <span>Telefon raqam</span>
            <div className="input-box">
              <div className="number-box">
                <img src={UzFlag} alt="flag-uzbekistan" width="30" height="30" />
              </div>
              <input
                type="tel"
                name="phone"
                id="phone"
                placeholder="+998-00-000-00-00"
                value={formatPhoneDisplay(phoneNumber)}
                onChange={handlePhoneChange}
                required
                disabled={isSubmitting}
              />
            </div>
            
            <span>GeoLocatsiya</span>
            <div 
              className={`location-register ${location ? 'has-location' : ''} ${isLoadingLocation ? 'loading' : ''}`}
              onClick={!isLoadingLocation && !isSubmitting ? handleGetLocation : null}
            >
              {isLoadingLocation && (
                <div className="location-loading">
                  <div className="spinner"></div>
                  <p>Lokatsiya aniqlanmoqda...</p>
                </div>
              )}
              
              {!isLoadingLocation && location && (
                <div className="location-info">
                  <svg 
                    className="location-icon-small" 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <p className="location-coords">
                    {location.lat}, {location.lng}
                  </p>
                </div>
              )}
              
              {!isLoadingLocation && !location && (
                <div className="location-placeholder">
                  <p>Lokatsiyani aniqlash uchun bosing</p>
                </div>
              )}
            </div>

            <div className="buttons">
              <button 
                type="button" 
                className="btn-location"
                onClick={handleGetLocation}
                disabled={isLoadingLocation || isSubmitting}
              >
                {isLoadingLocation ? 'Aniqlanmoqda...' : 'Joyni aniqlash'}
              </button>
              <button 
                type="submit" 
                className="btn-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Yuklanmoqda...' : 'Tasdiqlash'}
              </button>
            </div>

            {/* Tasdiqlash xabari */}
            {submissionStatus && (
              <div className={`submission-message ${submissionStatus}`}>
                {submissionStatus === 'loading' && (
                  <>
                    <div className="spinner-small"></div>
                    <p>Ma'lumotlar yuklanmoqda...</p>
                  </>
                )}
                {submissionStatus === 'success' && (
                  <>
                    <svg className="success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <p>Ro'yxatdan o'tish muvaffaqiyatli!</p>
                  </>
                )}
                {submissionStatus === 'error' && (
                  <>
                    <svg className="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <p>Xatolik yuz berdi!</p>
                  </>
                )}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}