"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login"); // or router.push('/login')
  }, [router]);

  return null; // or a loader/spinner while redirecting
}
