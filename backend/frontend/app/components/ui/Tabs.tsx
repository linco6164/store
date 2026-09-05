"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import clsx from "clsx";

interface TabsContextProps {
    value: string;
    setValue: (value: string) => void;
}

const TabsContext =
    createContext<TabsContextProps | null>(null);

function useTabs() {
    const context = useContext(TabsContext);

    if (!context) {
        throw new Error(
            "Tabs components must be inside <Tabs>"
        );
    }

    return context;
}

interface TabsProps {
    defaultValue: string;
    children: ReactNode;
}

export function Tabs({
    defaultValue,
    children,
}: TabsProps) {
    const [value, setValue] =
        useState(defaultValue);

    return (
        <TabsContext.Provider
            value={{
                value,
                setValue,
            }}
        >
            {children}
        </TabsContext.Provider>
    );
}

interface TabsListProps {
    children: ReactNode;
}

export function TabsList({
    children,
}: TabsListProps) {
    return (
        <div className="inline-flex rounded-2xl bg-gray-100 p-1">
            {children}
        </div>
    );
}

interface TabsTriggerProps {
    value: string;
    children: ReactNode;
}

export function TabsTrigger({
    value,
    children,
}: TabsTriggerProps) {
    const tabs = useTabs();

    const active =
        tabs.value === value;

    return (
        <button
            onClick={() =>
                tabs.setValue(value)
            }
            className={clsx(
                "rounded-xl px-5 py-2 text-sm font-semibold transition-all duration-200",

                active
                    ? "bg-white text-blue-600 shadow"
                    : "text-gray-500 hover:text-gray-900"
            )}
        >
            {children}
        </button>
    );
}

interface TabsContentProps {
    value: string;
    children: ReactNode;
}

export function TabsContent({
    value,
    children,
}: TabsContentProps) {
    const tabs = useTabs();

    if (tabs.value !== value)
        return null;

    return (
        <div className="mt-6">
            {children}
        </div>
    );
}