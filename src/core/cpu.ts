import { createMemory, MemoryMapper } from '../mod.ts';

export class CPU {
    private mem: MemoryMapper;
    private stackSize: number;
    private registerNames: string[];
    private registers: DataView;
    private registerMap: Record<string, number>;

    constructor(memory: MemoryMapper) {
        this.mem = memory;
        this.stackSize = 0;
        this.registerNames = ['ip', 'acc','r1', 'r2', 'r3', 'r4','r5', 'r6', 'r7', 'r8', 'sp', 'fp'];
        this.registers = createMemory(this.registerNames.length * 2);
        this.registerMap = this.registerNames.reduce((map: Record<string, number>, name: string, i: number) => {
            map[name] = i * 2;
            return map;
        }, {});
    }

    public debug(): void {
        this.registerNames.forEach(name =>
            console.log(`${name}: 0x${this.getRegister(name).toString(16).padStart(4, '0')}`)
        );
    }

    public getRegister(name: string) {
        if (!(name in this.registerMap)) {
            throw new Error(`[x16_x]: [CPU]: No such register: ${name}`);
        }

        return this.registers.getUint16(this.registerMap[name]);
    }
}