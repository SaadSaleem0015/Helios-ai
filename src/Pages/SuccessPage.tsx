import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { FaCheckCircle } from 'react-icons/fa';

const SuccessPage: React.FC = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    document.body.style.overflow = 'hidden';

    const confettiTimer = setTimeout(() => {
      setShowConfetti(false);
      document.body.style.overflow = ''; 
    }, 7000);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(confettiTimer);
      document.body.style.overflow = ''; 
    };
  }, []);

  return (
    <div className="relative flex justify-center min-h-[80vh] items-center overflow-hidden">
      {showConfetti && (
        <Confetti
          width={windowWidth}
          height={windowHeight}
          recycle={false}
          run ={true}
          numberOfPieces={400}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 10,
          }}
        />
      )}
      <div className="relative z-20 bg-white text-white  rounded-2xl mt-12   p-16  w-96 text-center">
        <div className="flex justify-center mb-6">
          <FaCheckCircle className="text-primary text-6xl" />
        </div>
        <h1 className="text-xl font-bold mb-4">Payment succeeded!</h1>
        <p className="text-gray-400 mb-6">
          Your transaction was completed successfully. Thank you for your purchase!
        </p>
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="bg-primary hover:bg-hoverdPrimary text-white font-semibold py-2 px-6 rounded-lg shadow-md transition"
        >
          Go to Your Dashboard
        </button>
      </div>
    </div>
  );
};

export default SuccessPage;
