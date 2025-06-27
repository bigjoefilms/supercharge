"use client"
import  { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const Pages = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/'); // Replace with your desired path
  }, [router]);

  return null; // Or a loading spinner if you want
};

export default Pages;