import React from 'react';
import { pure } from 'recompose';
import { connect } from 'react-redux';
import './WordWizard.scss';


const WordWizardView = pure(({ grid, onResize }) => {
    return (
        <div className="WordWizard">
            Word list goes here
        </div>
    );
});


const mapStateToProps = ({ grid }) => ({ grid });
const mapDispatchToProps = dispatch => ({});

export const WordWizard = connect(mapStateToProps, mapDispatchToProps)(WordWizardView);
