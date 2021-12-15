import { Mark } from '../../model/types';
import React, { RefObject, useLayoutEffect, useRef } from 'react';

export const InlineNode = ({
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
            onClick={() => {
                if (!buffersRef.current?.nextBuffer) return;
                getSelection()?.collapse(buffersRef.current?.nextBuffer, 1);
            }}
            ref={ref}
            data-attrs={JSON.stringify(mark.d)}
            data-type={mark.t}
            style={{
                color: '#ffffff99',
                userSelect: 'text',
                WebkitUserSelect: 'text',
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
            nextBuffer.parentElement?.removeChild(prevBuffer);
            nextBuffer.parentElement?.removeChild(nextBuffer);
        };
    }, []);
    return buffers;
};

function setBuffers(element: HTMLElement, buffer: Text, prevBuffer: Text) {
    if (element?.nextSibling !== buffer) {
        element?.parentElement?.insertBefore(buffer, element?.nextSibling);
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
    if (buffer?.textContent) {
        const index = buffer.textContent.indexOf('\uFEFF');
        if (index > 0) {
            buffer.deleteData(index, 1);
            buffer.insertData(0, '\uFEFF');
        }
    }
}
