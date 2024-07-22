import React from 'react';

interface LoadingModalProps {
    show: boolean;
}

const LoadingModal: React.FC<LoadingModalProps> = ({ show }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-0 z-50">
            <div className="bg-white p-4 rounded shadow-lg">
                <div className="text-lg text-blue-500">Registering faces, please wait...</div>
            </div>
        </div>
    );
};

export default LoadingModal;