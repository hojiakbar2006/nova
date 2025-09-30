import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { supabase } from '../supabaseClient';
import './Register.css';

function Register() {
  const [phoneNumber, setPhoneNumber] = useState('+998');
  const [location, setLocation] = useState(null); // { lat, lng }
  const [error, setError] = useState('');
  const telegramUser = window.Telegram.WebApp.initDataUnsafe.user;

  // O'zbekiston chegara cheklovi
  const isInUzbekistan = (lat, lng) => {
    return lat >= 37 && lat <= 46 && lng >= 56 && lng <= 74;
  };

  const handleConfirm = () => {
    setError('');

    // Telefon validatsiyasi
    const phoneRegex = /^\+998\d{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError('Telefon raqami +998 bilan boshlanib, 9 raqamdan iborat bo‘lishi kerak!');
      return;
    }

    // Lokatsiyani so'rash
    window.Telegram.WebApp.LocationManager.init(() => {
      window.Telegram.WebApp.LocationManager.getLocation((err, locData) => {
        if (err || !locData) {
          setError('Lokatsiya olishda xato! Iltimos, ruxsat bering yoki sozlamalardan yoqing.');
          window.Telegram.WebApp.LocationManager.openSettings();
          return;
        }

        const { latitude: lat, longitude: lng } = locData;
        if (!isInUzbekistan(lat, lng)) {
          setError('Lokatsiya O‘zbekiston ichida bo‘lishi kerak!');
          return;
        }

        setLocation({ lat, lng });
        console.log('Lokatsiya:', lat, lng);

        // Supabase ga saqlash (await ni callback ichida ishlatish)
        const saveUserData = async () => {
          const { error: dbError } = await supabase.from('profiles').upsert({
            id: telegramUser?.id || 'temp_id', // Telegram ID yoki auth ID
            phone_number: phoneNumber,
            telegram_phone: telegramUser?.phone_number || null,
            location_lat: lat,
            location_lng: lng,
          });

          if (dbError) {
            setError('Ma‘lumotlarni saqlashda xato: ' + dbError.message);
          } else {
            alert('Ro‘yxatdan o‘tdingiz! Lokatsiya saqlandi.');
          }
        };

        saveUserData(); // Asinxron funksiyani chaqirish
      });
    });
  };

  return (
    <div className="register-container">
      <div className="header">
        <img src="nova-logo.png" alt="NOVA" className="logo" /> {/* Logo rasmini o'zgartiring */}
        <h1 className="title">Ro‘yxatdan o‘tish</h1>
      </div>

      <div className="form-group">
        <label className="label">Telefon raqam</label>
        <div className="phone-input">
          <img src="uzbekistan-flag.png" alt="UZ" className="flag" /> {/* Bayroq rasmi */}
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="phone-field"
            placeholder="+998 000 00 00"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="label">GeoLokatsiya</label>
        <div className="location-box">
          {location ? (
            <MapContainer center={[location.lat, location.lng]} zoom={13} className="map">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[location.lat, location.lng]}>
                <Popup>Sizning lokatsiyangiz</Popup>
              </Marker>
            </MapContainer>
          ) : (
            <div className="location-placeholder">Lokatsiya</div>
          )}
        </div>
        <p className="location-hint">Lokatsiya</p>
      </div>

      {error && <p className="error-message">{error}</p>}

      <button className="confirm-button" onClick={handleConfirm}>
        Tasdiqlash
      </button>
    </div>
  );
}

export default Register;