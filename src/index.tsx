import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import SwipeableViews from 'react-swipeable-views';

interface IHeightChangeDetectorProps {
  children: React.ReactNode;
  onHeightChange: (height: number) => void;
}

const HeightChangeDetector = ({
  children,
  onHeightChange,
}: IHeightChangeDetectorProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  const heightObserver = useMemo(() => {
    return new ResizeObserver(entries => {
      const wrapperEntry = entries[0];
      const wrapperNodeHeight = wrapperEntry.contentRect.height;
      if (wrapperNodeHeight !== height) {
        onHeightChange(wrapperNodeHeight);
        setHeight(wrapperNodeHeight);
      }
    });
  }, [onHeightChange, height]);

  useEffect(() => {
    const wrapperNode = wrapperRef.current;
    if (wrapperNode) {
      heightObserver.observe(wrapperNode);
      return () => heightObserver.unobserve(wrapperNode);
    }
    return undefined;
  }, [heightObserver]);

  return <div ref={wrapperRef}>{children}</div>;
};

interface IAutoheightSwipeableViewsProps {
  activeIndex: number;
  children: React.ReactNode;
  onChangeIndex: (index: number) => void;
  lazyLoading?: boolean;
}

const AutoheightSwipeableViews = ({
  activeIndex,
  children,
  onChangeIndex,
  lazyLoading = false,
}: IAutoheightSwipeableViewsProps) => {
  const [contentHeightsByIndex, setContentHeightsByIndex] = useState<number[]>(
    []
  );
  // index to load next
  const [nextIndex, setNextIndex] = useState<number>(activeIndex);
  // array of indexes already loaded
  const [loadedIndex, setLoadedIndex] = useState<number[]>([activeIndex]);
  // mutating keys of children to refresh
  const [childrenKeys, setChildrenKeys] = useState<number[]>(
    React.Children.map(children, (_, index) => index)
  );

  const handleOnSwitching = useCallback(
    (index: number) => {
      if (index === activeIndex) return;
      const newNextIndex =
        index > activeIndex ? activeIndex + 1 : activeIndex - 1;
      if (newNextIndex !== nextIndex) {
        setNextIndex(newNextIndex);
        const newChildrenKeys = childrenKeys.slice();
        const currentChildrenKey = childrenKeys[newNextIndex];
        newChildrenKeys[newNextIndex] =
          currentChildrenKey +
          0.1 * (currentChildrenKey === newNextIndex ? 1 : -1);
        setChildrenKeys(newChildrenKeys);
        if (lazyLoading && !loadedIndex.includes(newNextIndex)) {
          setLoadedIndex(loadedIndex.concat(newNextIndex));
        }
      }
    },
    [activeIndex, nextIndex, loadedIndex, childrenKeys, lazyLoading]
  );

  const enhancedChildren = useMemo(() => {
    return React.Children.map(children, (child, index) => {
      const handleOnHeightReady = (newHeight: number) => {
        const newContentHeightByIndex = contentHeightsByIndex.slice();
        newContentHeightByIndex[index] = newHeight;
        setContentHeightsByIndex(newContentHeightByIndex);
      };
      return (
        <HeightChangeDetector
          key={childrenKeys[index]}
          onHeightChange={handleOnHeightReady}
        >
          {!lazyLoading ||
          nextIndex === index ||
          loadedIndex.includes(index) ? (
            child
          ) : (
            <></>
          )}
        </HeightChangeDetector>
      );
    });
  }, [
    children,
    nextIndex,
    childrenKeys,
    lazyLoading,
    loadedIndex,
    contentHeightsByIndex,
  ]);

  return (
    <SwipeableViews
      containerStyle={{ height: contentHeightsByIndex[activeIndex] }}
      index={activeIndex}
      onChangeIndex={onChangeIndex}
      onSwitching={lazyLoading ? handleOnSwitching : undefined}
    >
      {enhancedChildren}
    </SwipeableViews>
  );
};

export default AutoheightSwipeableViews;
