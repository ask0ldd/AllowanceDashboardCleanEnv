import { useState, useEffect } from 'react';

function useMetaMaskStatusChecker() {
  const [isMetaMaskActive, setIsMetaMaskActive] = useState(false);

  useEffect(() => {
    const checkMetaMaskStatus = () => {
      const isAvailable = typeof window.ethereum !== 'undefined';
      setIsMetaMaskActive(isAvailable);
    }

    checkMetaMaskStatus()

    const intervalId = setInterval(checkMetaMaskStatus, 5000)

    return () => clearInterval(intervalId)
  }, [])

  return isMetaMaskActive
}