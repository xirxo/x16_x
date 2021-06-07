export function createMemory(size: number): DataView {
    return new DataView(new ArrayBuffer(size));
}