import React, { useState, useEffect, useMemo, useRef, useCallback, } from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import SwipeableViews from 'react-swipeable-views';
var HeightChangeDetector = function (_a) {
    var children = _a.children, onHeightChange = _a.onHeightChange;
    var wrapperRef = useRef(null);
    var _b = useState(0), height = _b[0], setHeight = _b[1];
    var heightObserver = useMemo(function () {
        return new ResizeObserver(function (entries) {
            var wrapperEntry = entries[0];
            var wrapperNodeHeight = wrapperEntry.contentRect.height;
            if (wrapperNodeHeight !== height) {
                onHeightChange(wrapperNodeHeight);
                setHeight(wrapperNodeHeight);
            }
        });
    }, [onHeightChange, height]);
    useEffect(function () {
        var wrapperNode = wrapperRef.current;
        if (wrapperNode) {
            heightObserver.observe(wrapperNode);
            return function () { return heightObserver.unobserve(wrapperNode); };
        }
        return undefined;
    }, [heightObserver]);
    return React.createElement("div", { ref: wrapperRef }, children);
};
var AutoheightSwipeableViews = function (_a) {
    var activeIndex = _a.activeIndex, children = _a.children, onChangeIndex = _a.onChangeIndex, _b = _a.lazyLoading, lazyLoading = _b === void 0 ? false : _b;
    var _c = useState([]), contentHeightsByIndex = _c[0], setContentHeightsByIndex = _c[1];
    // index to load next
    var _d = useState(activeIndex), nextIndex = _d[0], setNextIndex = _d[1];
    // array of indexes already loaded
    var _e = useState([activeIndex]), loadedIndex = _e[0], setLoadedIndex = _e[1];
    // mutating keys of children to refresh
    var _f = useState(React.Children.map(children, function (_, index) { return index; })), childrenKeys = _f[0], setChildrenKeys = _f[1];
    var handleOnSwitching = useCallback(function (index) {
        if (index === activeIndex)
            return;
        var newNextIndex = index > activeIndex ? activeIndex + 1 : activeIndex - 1;
        if (newNextIndex !== nextIndex) {
            setNextIndex(newNextIndex);
            var newChildrenKeys = childrenKeys.slice();
            var currentChildrenKey = childrenKeys[newNextIndex];
            newChildrenKeys[newNextIndex] =
                currentChildrenKey +
                    0.1 * (currentChildrenKey === newNextIndex ? 1 : -1);
            setChildrenKeys(newChildrenKeys);
            if (lazyLoading && !loadedIndex.includes(newNextIndex)) {
                setLoadedIndex(loadedIndex.concat(newNextIndex));
            }
        }
    }, [activeIndex, nextIndex, loadedIndex, childrenKeys, lazyLoading]);
    var enhancedChildren = useMemo(function () {
        return React.Children.map(children, function (child, index) {
            var handleOnHeightReady = function (newHeight) {
                var newContentHeightByIndex = contentHeightsByIndex.slice();
                newContentHeightByIndex[index] = newHeight;
                setContentHeightsByIndex(newContentHeightByIndex);
            };
            return (React.createElement(HeightChangeDetector, { key: childrenKeys[index], onHeightChange: handleOnHeightReady }, !lazyLoading ||
                nextIndex === index ||
                loadedIndex.includes(index) ? (child) : (React.createElement(React.Fragment, null))));
        });
    }, [
        children,
        nextIndex,
        childrenKeys,
        lazyLoading,
        loadedIndex,
        contentHeightsByIndex,
    ]);
    return (React.createElement(SwipeableViews, { containerStyle: { height: contentHeightsByIndex[activeIndex] }, index: activeIndex, onChangeIndex: onChangeIndex, onSwitching: lazyLoading ? handleOnSwitching : undefined }, enhancedChildren));
};
export default AutoheightSwipeableViews;
//# sourceMappingURL=index.js.map