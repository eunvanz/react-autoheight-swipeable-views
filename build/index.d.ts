import React from 'react';
interface IAutoheightSwipeableViewsProps {
    activeIndex: number;
    children: React.ReactNode;
    onChangeIndex: (index: number) => void;
    lazyLoading?: boolean;
}
declare const AutoheightSwipeableViews: ({ activeIndex, children, onChangeIndex, lazyLoading, }: IAutoheightSwipeableViewsProps) => JSX.Element;
export default AutoheightSwipeableViews;
