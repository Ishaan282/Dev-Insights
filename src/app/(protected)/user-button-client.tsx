'use client';
import dynamic from 'next/dynamic';

const UserButton = dynamic(() => import('@clerk/nextjs').then(m => ({ default: m.UserButton })), { ssr: false });

export default function UserButtonClient() {
    return <UserButton afterSignOutUrl="/sign-in" />;
}
