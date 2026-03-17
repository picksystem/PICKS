import { useEffect, useState } from 'react';

export type DeviceType = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export const useDevice = () => {
  const getDevice = (): DeviceType => {
    if (typeof window === 'undefined') return 'lg';

    const width = window.innerWidth;

    if (width <= 576) return 'xs'; // mobile
    if (width >= 577 && width <= 768) return 'sm'; // tablets
    if (width >= 769 && width <= 1024) return 'md'; // large tablets / small desktops
    if (width >= 1025 && width <= 1440) return 'lg'; // desktops
    return 'xl'; // large desktops
  };

  const [device, setDevice] = useState<DeviceType>(getDevice());

  useEffect(() => {
    const handleResize = () => setDevice(getDevice());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    device,
    isXS: device === 'xs',
    isSM: device === 'sm',
    isMD: device === 'md',
    isLG: device === 'lg',
    isXL: device === 'xl',
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
  };
};
