import { Mark } from '../../model/types';
import React, { RefObject, useLayoutEffect, useRef } from 'react';

export const NodeView = ({
    mark,
    children,
}: {
    mark: Mark;
    children: React.ReactElement;
}) => {
    const ref = useRef<HTMLElement>(null);
    const buffersRef = useBuffers(ref);
    return (
        <span
            onClick={(e: React.MouseEvent) => {
                if (!buffersRef.current?.nextBuffer) return;
                const elementRect = (
                    ref.current as HTMLElement
                ).getBoundingClientRect();
                if (e.clientX > elementRect.left + elementRect.width / 2) {
                    getSelection()?.collapse(buffersRef.current?.nextBuffer, 1);
                } else {
                    getSelection()?.collapse(buffersRef.current?.prevBuffer, 0);
                }
            }}
            ref={ref}
            data-attrs={JSON.stringify(mark.d)}
            data-type={mark.t}
            style={{
                color: '#ffffff99',
                userSelect: 'none',
                WebkitUserSelect: 'none',
            }}
            contentEditable={false}
        >
            {children}
        </span>
    );
};

const useBuffers = (ref: RefObject<HTMLElement>) => {
    const buffers = useRef<{ prevBuffer: Node; nextBuffer: Node }>();
    useLayoutEffect(() => {
        const prevBuffer = document.createTextNode('\uFEFF');
        const nextBuffer = document.createTextNode('\uFEFF');
        buffers.current = { prevBuffer, nextBuffer };
        if (!ref.current) return;

        setBuffers(ref.current as HTMLElement, nextBuffer, prevBuffer);
        const observer = new MutationObserver(() => {
            setBuffers(ref.current as HTMLElement, nextBuffer, prevBuffer);
            observer.takeRecords();
        });

        const root = ref.current.closest('.editable_content');
        observer.observe(root as HTMLElement, {
            childList: true,
            characterData: true,
            subtree: true,
        });

        return () => {
            observer.disconnect();
            nextBuffer.parentElement?.removeChild(nextBuffer);
            prevBuffer.parentElement?.removeChild(prevBuffer);
        };
    }, []);
    return buffers;
};

function setBuffers(element: HTMLElement, nextBuffer: Text, prevBuffer: Text) {
    if (element?.nextSibling !== nextBuffer) {
        element?.parentElement?.insertBefore(nextBuffer, element?.nextSibling);
    }
    if (element?.previousSibling !== prevBuffer) {
        element?.parentElement?.insertBefore(prevBuffer, element);
    }
    if (prevBuffer?.textContent) {
        const index = prevBuffer.textContent.indexOf('\uFEFF');
        if (index > 0) {
            prevBuffer.deleteData(index, 1);
            prevBuffer.insertData(0, '\uFEFF');
        }
    }
    if (nextBuffer?.textContent) {
        const index = nextBuffer.textContent.indexOf('\uFEFF');
        if (index > 0) {
            nextBuffer.deleteData(index, 1);
            nextBuffer.insertData(0, '\uFEFF');
        }
    }
}
