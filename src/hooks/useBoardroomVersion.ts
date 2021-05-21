import { useCallback, useEffect, useState } from 'react';
import useAntToken from './useAntToken';
import useStakedBalanceOnBoardroom from './useStakedBalanceOnBoardroom';

const useBoardroomVersion = () => {
  const [boardroomVersion, setBoardroomVersion] = useState('latest');
  const antToken = useAntToken();
  const stakedBalance = useStakedBalanceOnBoardroom();

  const updateState = useCallback(async () => {
    setBoardroomVersion(await antToken.fetchBoardroomVersionOfUser());
  }, [antToken?.isUnlocked, stakedBalance]);

  useEffect(() => {
    if (antToken?.isUnlocked) {
      updateState().catch((err) => console.error(err.stack));
    }
  }, [antToken?.isUnlocked, stakedBalance]);

  return boardroomVersion;
};

export default useBoardroomVersion;
