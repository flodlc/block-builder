import React, { useContext } from 'react';
import { View } from '../View';

export const ViewContext = React.createContext<View>(
    undefined as unknown as any
);

export const useView = () => {
    return useContext(ViewContext);
};
