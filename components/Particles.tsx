
import React from 'react';

export const Particles: React.FC = () => {
    return (
        <div className="floating-particles">
            {[...Array(20)].map((_, i) => (
                <div
                    key={i}
                    className="particle"
                    style={{
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 6}s`,
                        animationDuration: `${4 + Math.random() * 4}s`,
                    }}
                />
            ))}
        </div>
    );
};
