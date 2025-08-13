// src/context/TestContext.ts
/**
 * @file TestContext.ts
 * @description Test context to isolate JSX parsing issues in CyberTaxi.
 * @author Kevin-Dean Livingstone & CyberTaxi Team - Grok, created by xAI
 * @version 0.1.1
 * @note Created to verify JSX behavior, using React.createElement as a workaround.
 */
import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface TestState {
    value: string;
}

const TestContext = createContext<TestState | undefined>(undefined);

interface TestProviderProps {
    children: ReactNode;
}

export const TestProvider = ({ children }: TestProviderProps) => {
    console.log('TestProvider initializing'); // Debug: Check initialization
    const [value] = useState<string>('test');
    return React.createElement(
        TestContext.Provider,
        { value: { value } },
        children
    );
};

export const useTest = (): TestState => {
    const context = useContext(TestContext);
    if (!context) throw new Error('useTest must be used within TestProvider');
    return context;
};