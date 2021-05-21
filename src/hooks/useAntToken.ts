import { useContext } from 'react';
import { Context } from '../contexts/AntTokenProvider';

const useAntToken = () => {
  const { antToken } = useContext(Context);
  return antToken;
};

export default useAntToken;
