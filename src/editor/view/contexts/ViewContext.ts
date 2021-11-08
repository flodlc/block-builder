import React from 'react';
import { ViewConfig } from '../types';

export const ViewContext = React.createContext<ViewConfig>(
    undefined as unknown as any
);
