'use client'

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

const Navbar = () => {
    const { data: session } = useSession();

    return (
        <nav className="bg-gray-800 p-4">
            <ul className="flex space-x-4">
                <li>
                    <Link href="/register" className="text-white">Register</Link>
                </li>
                <li>
                    <Link href="/recognize" className="text-white">Recognize</Link>
                </li>
                {session ?
                    (
                        <li>
                            <button onClick={() => signOut()} className="text-white">Sign out</button>
                        </li>
                    ) :
                    (
                        <li>
                            <Link href="/auth/login" className="text-white">Sign in</Link>
                        </li>
                    )
                }
            </ul>
        </nav>
    );
};

export default Navbar;