const SLEEPING_SERVER_MESSAGE =
  'Сървърът се събужда (безплатен хост). Изчакайте около минута и опитайте отново.';

export const isTimeoutError = (error) => {
  return (
    error?.code === 'ECONNABORTED' ||
    String(error?.message || '').toLowerCase().includes('timeout')
  );
};

export const isNetworkOrNoResponseError = (error) => {
  return !error?.response && (error?.code === 'ERR_NETWORK' || !!error?.request);
};

export const getApiErrorMessage = (error, fallbackMessage) => {
  if (isTimeoutError(error) || isNetworkOrNoResponseError(error)) {
    return SLEEPING_SERVER_MESSAGE;
  }

  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    fallbackMessage
  );
};

