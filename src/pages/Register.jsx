import React, { useState } from 'react';
import './Register.css';
import Logo from '../../public/Nova.png';
import UzFlag from '../assets/UzbekistanFlag.png';

export default function Register() {
  const [phoneNumber, setPhoneNumber] = useState('+998');
  const [location, setLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Telefon raqamni formatlash
  const handlePhoneChange = (e) => {
    let value = e.target.value;
    
    // Faqat raqamlar va + belgisini qoldirish
    value = value.replace(/[^\d+]/g, '');
    
    // Agar +998 o'chirilgan bo'lsa, qaytadan qo'shish
    if (!value.startsWith('+998')) {
      value = '+998';
    }
    
    // Maksimal uzunlik: +998 + 9 raqam = 13
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
      alert('Brauzeringiz geolokatsiyani qo\'llab-quvvatlamaydi');
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

  // Formani yuborish
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validatsiya
    if (phoneNumber.length < 13) {
      alert('Iltimos, to\'liq telefon raqamini kiriting');
      return;
    }

    if (!location) {
      alert('Iltimos, avval lokatsiyangizni aniqlang');
      return;
    }

    // Ma'lumotlarni console ga chiqarish (yoki server ga yuborish)
    const formData = {
      phone: phoneNumber,
      location: location
    };

    console.log('Ro\'yxatdan o\'tish ma\'lumotlari:', formData);
    alert('Ro\'yxatdan o\'tish muvaffaqiyatli yakunlandi!');

    // Formani tozalash (ixtiyoriy)
    // setPhoneNumber('+998');
    // setLocation(null);
  };

  return (
    <div className="register-page">
      <div className="content-register">
        <div className="register-imgs">
          <div className="nova-img-register">
            <img src={Logo} alt="NOVA logo" />
          </div>
          <div className="user-img-register">
            <img src={Logo} alt="user img" />
          </div>
        </div>

        <div className="register-forms">
          <form onSubmit={handleSubmit}>
            <h3>Ro'yhatdan o'tish</h3>
            
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
              />
            </div>
            
            <span>GeoLocatsiya</span>
            
            <div 
              className={`location-register ${location ? 'has-location' : ''} ${isLoadingLocation ? 'loading' : ''}`}
              onClick={!isLoadingLocation ? handleGetLocation : null}
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
                disabled={isLoadingLocation}
              >
                {isLoadingLocation ? 'Aniqlanmoqda...' : 'Manzilni aniqlash'}
              </button>
              <button 
                type="submit" 
                className="btn-submit"
              >
                Tasdiqlash
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}