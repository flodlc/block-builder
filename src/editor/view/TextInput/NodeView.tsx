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
            // data-attrs={JSON.stringify(mark.d)}
            // data-type={mark.t}
            style={{
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
    const buffers = useRef<{ prevBuffer: Text; nextBuffer: Text }>();
    useLayoutEffect(() => {
        const prevBuffer = document.createTextNode('\uFEFF');
        const nextBuffer = document.createTextNode('\uFEFF');
        buffers.current = { prevBuffer, nextBuffer };
        if (!ref.current) return;

        setBuffers(ref.current as HTMLElement, nextBuffer, prevBuffer);
        const handler = () => {
            setBuffers(ref.current as HTMLElement, nextBuffer, prevBuffer);
        };
        const root = ref.current.closest('.editable_content');
        root?.addEventListener('input', handler);

        return () => {
            root?.removeEventListener('input', handler);
            removeBuffers(buffers);
        };
    }, []);
    useLayoutEffect(() => {
        resetBuffers(buffers);
        // return () => removeBuffers(buffers);
    });
    useLayoutEffect(() => {
        return () => removeBuffers(buffers);
    }, []);
    return buffers;
};

function setBuffers(element: HTMLElement, nextBuffer: Text, prevBuffer: Text) {
    if (element?.nextSibling !== nextBuffer) {
        element?.parentElement?.insertBefore(nextBuffer, element?.nextSibling);
    } else if (nextBuffer?.textContent) {
        const index = nextBuffer.textContent.indexOf('\uFEFF');
        if (index > 0) {
            nextBuffer.deleteData(index, 1);
            nextBuffer.insertData(0, '\uFEFF');
        }
    }
    if (element?.previousSibling !== prevBuffer) {
        element?.parentElement?.insertBefore(prevBuffer, element);
    } else if (prevBuffer?.textContent) {
        const index = prevBuffer.textContent.indexOf('\uFEFF');
        if (index > 0) {
            prevBuffer.deleteData(index, 1);
            prevBuffer.insertData(0, '\uFEFF');
        }
    }
}

function resetBuffers(
    buffers: React.MutableRefObject<
        { nextBuffer: Text; prevBuffer: Text } | undefined
    >
) {
    const nextBuffer = buffers.current?.nextBuffer;
    if (nextBuffer?.textContent !== '\uFEFF') {
        nextBuffer?.replaceData(0, nextBuffer?.length ?? 0, '\uFEFF');
    }
    const prevBuffer = buffers.current?.prevBuffer;
    if (prevBuffer?.textContent !== '\uFEFF') {
        prevBuffer?.replaceData(0, prevBuffer?.length ?? 0, '\uFEFF');
    }
}

function removeBuffers(
    buffers: React.MutableRefObject<
        { nextBuffer: Text; prevBuffer: Text } | undefined
    >
) {
    buffers.current?.nextBuffer.parentElement?.removeChild(
        buffers.current?.nextBuffer
    );
    buffers.current?.prevBuffer.parentElement?.removeChild(
        buffers.current?.prevBuffer
    );
}
