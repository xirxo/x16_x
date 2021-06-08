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

    // A debug method to view data of all of our registers
    public debug(): void {
        return this.registerNames.forEach(name =>
            console.log(`${name}: 0x${this.getRegister(name).toString(16).padStart(4, '0')}`)
        );
    }

    // A view method to view our current memory
    public view(add: number, n = 8): void {
        const next = Array.from({ length: n }, (_, i) =>
            this.mem.getUint8(add + i)
        ).map(v => `0x${v.toString(16).padStart(2, '0')}`);

        return console.log(`${add.toString(16).padStart(2, '0')}: ${next.join(' ')}`);
    }

    // Get a specific register's value
    public getRegister(name: string) {
        if (!(name in this.registerMap)) {
            throw new Error(`[x16_x]: [CPU]: No such register: ${name}`);
        }

        return this.registers.getUint16(this.registerMap[name]);
    }

    // Set a specific register to a specific value
    public setRegister(name: string, value: number): void {
        if (!(name in this.registerMap)) {
            throw new Error(`[x16_x]: [CPU]: No such register: ${name}`);
        }

        return this.registers.setUint16(this.registerMap[name], value);
    }

    fetch() {
        const next = this.getRegister('ip');
        const now = this.mem.getUint8(next);

        this.setRegister('ip', next + 1);
        return now;
    }

    fetch16() {
        const next = this.getRegister('ip');
        const now = this.mem.getUint16(next);

        this.setRegister('ip', next + 2);
        return now;
    }
}