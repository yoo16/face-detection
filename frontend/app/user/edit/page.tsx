'use client';

import { useSession, signIn } from 'next-auth/react';
import { useState } from 'react';

const RegisterPage = () => {
    const { data: session } = useSession();
    const [name, setName] = useState('');
    const [studentId, setStudentId] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [classroom, setClassroom] = useState('');
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: session?.user?.id,
                    name,
                    studentId,
                    birthDate,
                    classroom,
                }),
            });

            if (response.ok) {
                setMessage('User registered successfully');
                setError(null);
            } else {
                setError('User registration failed');
                setMessage(null);
            }
        } catch (error) {
            setError('An error occurred while registering the user');
            setMessage(null);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                {!session ? (
                    <>
                        <h1 className="text-3xl font-bold mb-4">Sign in</h1>
                        <div>
                            <button
                                onClick={() => signIn('google')}
                                className="bg-blue-500 text-white py-2 px-4 rounded m-2"
                            >
                                Sign in with Google
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <h1 className="text-3xl font-bold mb-4">User Registration</h1>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700">Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-3 py-2 border rounded"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700">Student ID</label>
                                <input
                                    type="text"
                                    value={studentId}
                                    onChange={(e) => setStudentId(e.target.value)}
                                    className="w-full px-3 py-2 border rounded"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700">Birth Date</label>
                                <input
                                    type="date"
                                    value={birthDate}
                                    onChange={(e) => setBirthDate(e.target.value)}
                                    className="w-full px-3 py-2 border rounded"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700">Classroom</label>
                                <input
                                    type="text"
                                    value={classroom}
                                    onChange={(e) => setClassroom(e.target.value)}
                                    className="w-full px-3 py-2 border rounded"
                                    required
                                />
                            </div>
                            {message && (
                                <div className="my-1 p-4 bg-green-200 text-green-800 rounded">
                                    {message}
                                </div>
                            )}
                            {error && (
                                <div className="my-1 p-4 bg-red-200 text-red-800 rounded">
                                    {error}
                                </div>
                            )}
                            <button
                                type="submit"
                                className="bg-blue-500 text-white py-2 px-4 rounded w-full"
                            >
                                Register
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default RegisterPage;
