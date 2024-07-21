'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useState } from 'react';

const RegisterPage = () => {
    return (
        <div className="my-4">
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-4">Sign in</h1>
                <div>
                    <button
                        onClick={() => signIn('google')}
                        className="bg-blue-500 text-white py-2 px-4 rounded m-2"
                    >
                        Sign in with Google
                    </button>
                </div>
            </div>
        </div>

    );
};

export default RegisterPage;
