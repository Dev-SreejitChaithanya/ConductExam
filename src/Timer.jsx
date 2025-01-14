import { useEffect, useState } from "react";
import CryptoJS from "crypto-js"; // Install via `npm install crypto-js`

const TIMER_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
const SECRET_KEY = import.meta.env.VITE_TIMER_SECRET; // Use a strong, hard-to-guess key

function Timer() {
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [isDisabled, setIsDisabled] = useState(false);

  const encrypt = (data) => CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
  const decrypt = (encryptedData) => {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch {
      return null;
    }
  };

  useEffect(() => {
    let expirationTime;
    const encryptedExpiration = localStorage.getItem("clockTick");

    if (encryptedExpiration) {
      const decryptedExpiration = decrypt(encryptedExpiration);
      if (decryptedExpiration) {
        expirationTime = parseInt(decryptedExpiration, 10);
        const currentTime = new Date().getTime();
        const remainingTime = expirationTime - currentTime;

        if (remainingTime > 0) {
          setTimeLeft(remainingTime);
        } else {
          expirationTime = null; // Timer has already expired
          setIsDisabled(true);
          setTimeLeft(0);
        }
      }
    }

    if (!expirationTime) {
      expirationTime = new Date().getTime() + TIMER_DURATION;
      const encryptedExpirationTime = encrypt(expirationTime.toString());
      localStorage.setItem("clockTick", encryptedExpirationTime);
    }

    const timerInterval = setInterval(() => {
      setTimeLeft((prevTimeLeft) => {
        if (prevTimeLeft <= 1000) {
          clearInterval(timerInterval);
          setIsDisabled(true);
          return 0;
        }
        return prevTimeLeft - 1000;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []);

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div>
      
      <p>Time Remaining: {formatTime(timeLeft)}</p>
      <input
        type="text"
        placeholder="Enter something..."
        disabled={isDisabled}
      />
      <button disabled={isDisabled}>Submit</button>
      {isDisabled && <p>The timer has ended. Inputs are disabled.</p>}
    </div>
  );
}

export default Timer;
