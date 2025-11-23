import { useToastContext } from '@/components/ui/ToastProvider';

/**
 * 토스트 훅
 */
export const useToast = () => {
  const context = useToastContext();
  if (!context) {
    return {
      addToast: () => {},
      removeToast: () => {},
    };
  }
  return context;
};

export default useToast;

