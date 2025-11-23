import { useLoginPromptContext } from '@/components/ui/LoginPromptProvider';

export const useLoginPrompt = () => {
  const context = useLoginPromptContext();
  if (!context) {
    return {
      openLoginPrompt: async () => false,
    };
  }
  return context;
};

export default useLoginPrompt;

