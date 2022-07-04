import React from 'react';
import './LoadingAnimation.scss';

export type LoadingAnimationProps = Readonly<{
  initializing: boolean;
}>;

/**
 * Fun little themed animation to display while waiting.
 */
export const LoadingAnimation = (props: LoadingAnimationProps) => {
  const squares = [];
  for (let i = 0; i < 4; i++) {
    squares.push(
      <div
        className={`LoadingAnimation-sq -a${i} ${
          props.initializing ? '-init' : ''
        }`}
        key={i}
      />,
    );
  }
  return (
    <div
      className="LoadingAnimation"
      style={{
        width: '100%',
        height: '100%',
      }}>
      {squares}
    </div>
  );
};
