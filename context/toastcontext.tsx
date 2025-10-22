import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { View, Text, Animated, Pressable } from 'react-native';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType, duration?: number) => void;
    showSuccess: (message: string) => void;
    showError: (message: string) => void;
    showInfo: (message: string) => void;
    showWarning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = (message: string, type: ToastType = 'info', duration: number = 3000) => {
        const id = Date.now().toString();
        const newToast: Toast = { id, message, type, duration };

        setToasts(prev => [...prev, newToast]);

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    };

    const showSuccess = (message: string) => showToast(message, 'success');
    const showError = (message: string) => showToast(message, 'error', 4000);
    const showInfo = (message: string) => showToast(message, 'info');
    const showWarning = (message: string) => showToast(message, 'warning');

    return (
        <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo, showWarning }}>
            {children}
            <View className="absolute top-16 left-0 right-0 z-50 px-4">
                {toasts.map(toast => (
                    <ToastItem key={toast.id} toast={toast} onDismiss={() => {
                        setToasts(prev => prev.filter(t => t.id !== toast.id));
                    }} />
                ))}
            </View>
        </ToastContext.Provider>
    );
};

const ToastItem: React.FC<{ toast: Toast; onDismiss: () => void }> = ({ toast, onDismiss }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(-100)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();

        const timeout = setTimeout(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: -100,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start(() => onDismiss());
        }, (toast.duration || 3000) - 200);

        return () => clearTimeout(timeout);
    }, [fadeAnim, slideAnim, toast.duration, onDismiss]);

    const getBackgroundColor = () => {
        switch (toast.type) {
            case 'success': return 'bg-green-500';
            case 'error': return 'bg-red-500';
            case 'warning': return 'bg-amber-500';
            case 'info': return 'bg-blue-500';
            default: return 'bg-gray-700';
        }
    };

    const getIcon = () => {
        switch (toast.type) {
            case 'success': return '✓';
            case 'error': return '✕';
            case 'warning': return '⚠';
            case 'info': return 'ℹ';
            default: return '•';
        }
    };

    return (
        <Animated.View
            style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
            }}
            className="mb-2"
        >
            <Pressable
                onPress={onDismiss}
                className={`${getBackgroundColor()} rounded-2xl px-4 py-3 shadow-lg flex-row items-center`}
            >
                <Text className="text-white text-lg font-bold mr-2">{getIcon()}</Text>
                <Text className="text-white text-base font-medium flex-1">{toast.message}</Text>
            </Pressable>
        </Animated.View>
    );
};

export const useToast = (): ToastContextType => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
