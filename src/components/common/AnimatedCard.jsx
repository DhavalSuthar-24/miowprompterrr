import React from 'react';

const AnimatedCard = React.memo(({ children, className = "", hover = false, delay = 0 }) => {
    return (
        <div
            className={`
                animate-slide-up
                transition-all duration-200
                ${hover ? "hover:translate-y-[-1px] cursor-pointer" : ""} 
                ${className}
            `}
            style={{
                animationFillMode: 'backwards',
                animationDelay: `${delay}ms`,
            }}
        >
            {children}
        </div>
    );
});

AnimatedCard.displayName = 'AnimatedCard';

export default AnimatedCard;
