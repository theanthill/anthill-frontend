import { useCallback, useEffect, useState } from 'react';
import useAntToken from './useAntToken';

const useBoardroomVersion = () => {
  const [boardroomVersion, setBoardroomVersion] = useState('latest');
  const antToken = useAntToken();
  const antTokenUnlocked = antToken?.isUnlocked;

  const updateState = useCallback(async () => {
    setBoardroomVersion(await antToken.fetchBoardroomVersionOfUser());
  }, [antToken]);

  useEffect(() => {
    if (antTokenUnlocked) {
      updateState().catch((err) => console.error(err.stack));
    }
  }, [antTokenUnlocked, updateState]);

  return boardroomVersion;
};

export default useBoardroomVersion;
