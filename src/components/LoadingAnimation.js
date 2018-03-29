import React from 'react';
import './LoadingAnimation.scss';


export class LoadingAnimation extends React.Component {
    render() {
        const squares = [];
        for (let i = 0; i < 4; i++) {
            squares.push(
                <div className={`LoadingAnimation-sq -a${i} ${this.props.initializing ? '-init' : ''}`}
                     key={i} />
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
    }
}