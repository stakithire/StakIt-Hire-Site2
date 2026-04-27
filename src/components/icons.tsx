import Image from 'next/image';

export const Icons = {
  logo: () => (
    <Image
      src="/logo.png"
      alt="StakIt Hire Logo"
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      priority
      style={{ objectFit: 'contain' }}
    />
  ),
};
