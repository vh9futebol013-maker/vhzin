import React, { useState } from 'react';

interface LogoProps {
  size?: 'sm' | 'md';
  showText?: boolean;
  variant?: 'on-orange' | 'on-dark';
}

/**
 * Logotipo oficial Quero Burgers:
 * Círculo branco com a letra "Q" em formato de hambúrguer laranja e amarelo.
 */
export const QueroBurgerLogo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  variant = 'on-orange',
}) => {
  const [imgError, setImgError] = useState(false);
  const circleSize = size === 'sm' ? 'w-10 h-10' : 'w-11 h-11';

  return (
    <div className="inline-flex items-center gap-3 whitespace-nowrap shrink-0 select-none">
      <div
        className={`${circleSize} rounded-full overflow-hidden flex items-center justify-center relative shadow-md shadow-black/40 ring-2 ${
          variant === 'on-orange' ? 'ring-yellow-300/80' : 'ring-orange-500/70'
        } shrink-0`}
      >
        {!imgError ? (
          <img
            src="/assets/aistudio/image_103c13c0.png"
            alt="Logotipo Quero Burgers"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover scale-[1.06]"
          />
        ) : (
          <div className="relative w-6 h-6 flex flex-col items-center justify-center" aria-hidden="true">
            <span className="w-5 h-2.5 rounded-t-full bg-orange-600 block" />
            <span className="w-[22px] h-1 bg-yellow-400 rounded-full my-[1.5px] block" />
            <span className="w-5 h-2 rounded-b-full bg-orange-600 block" />
            <span className="w-2.5 h-1 bg-orange-600 rounded-full rotate-45 absolute -bottom-0.5 -right-0.5" />
          </div>
        )}
      </div>

      {showText && (
        <span className="font-display text-2xl sm:text-[1.85rem] tracking-wider leading-none">
          {variant === 'on-orange' ? (
            <>
              <span className="text-white">QUERO</span>{' '}
              <span className="text-yellow-300">BURGERS</span>
            </>
          ) : (
            <>
              <span className="text-orange-500">QUERO</span>{' '}
              <span className="text-yellow-400">BURGERS</span>
            </>
          )}
        </span>
      )}
    </div>
  );
};
