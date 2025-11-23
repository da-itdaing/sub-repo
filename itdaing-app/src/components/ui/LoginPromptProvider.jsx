import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const LoginPromptContext = createContext(null);

export const LoginPromptProvider = ({ children }) => {
  const [prompt, setPrompt] = useState(null);

  const openLoginPrompt = useCallback(
    (options = {}) =>
      new Promise((resolve) => {
        setPrompt({
          title: options.title ?? '로그인이 필요해요',
          description:
            options.description ?? '이 기능은 로그인 후 이용할 수 있습니다. 지금 로그인하시겠어요?',
          confirmText: options.confirmText ?? '로그인',
          cancelText: options.cancelText ?? '닫기',
          resolve,
        });
      }),
    []
  );

  const closePrompt = useCallback(() => {
    setPrompt(null);
  }, []);

  const handleResult = (result) => {
    prompt?.resolve?.(result);
    setPrompt(null);
  };

  const contextValue = useMemo(
    () => ({
      openLoginPrompt,
      closePrompt,
    }),
    [closePrompt, openLoginPrompt]
  );

  return (
    <LoginPromptContext.Provider value={contextValue}>
      {children}
      {prompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-[360px] rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900">{prompt.title}</h3>
            <p className="mt-2 text-sm text-gray-600 whitespace-pre-line">{prompt.description}</p>
            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleResult(true)}
                className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
              >
                {prompt.confirmText}
              </button>
              <button
                type="button"
                onClick={() => handleResult(false)}
                className="w-full rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                {prompt.cancelText}
              </button>
            </div>
          </div>
        </div>
      )}
    </LoginPromptContext.Provider>
  );
};

export const useLoginPromptContext = () => useContext(LoginPromptContext);

