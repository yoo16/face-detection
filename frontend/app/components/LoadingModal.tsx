import React from 'react';
import ClipLoader from 'react-spinners/ClipLoader';

interface LoadingModalProps {
    show: boolean;
}

const LoadingModal: React.FC<LoadingModalProps> = ({ show }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-transparent z-50">
            <div className="bg-transparent p-4 rounded shadow-lg flex items-center space-x-4">
                <ClipLoader size={35} color={"#ffffff"} loading={true} />
            </div>
        </div>
    );
};

export default LoadingModal;