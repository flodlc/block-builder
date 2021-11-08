import React from 'react';
import { State } from '../../model/types';

export const StateContext = React.createContext<State>(
    undefined as unknown as State
);
