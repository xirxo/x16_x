import { createMemory } from './create-mem.ts';
import { instructions } from './instructions.ts';

export class CPU {
    registerNames = ['ip', 'acc','r1', 'r2', 'r3', 'r4','r5', 'r6', 'r7', 'r8'];
    registers = createMemory(this.registerNames.length * 2);
    registerMap = this.registerNames.reduce((map, name, i) => {
        map[name] = i * 2;
        return map;
    }, {});

    constructor(mem) {
        this.mem = mem;
    }

    debug() {
        this.registerNames.forEach(name => console.log(`${name}: 0x${this.getRegister(name).toString(16).padStart(4, '0')}`));
        console.log('\n');
    }

    getRegister(name) {
        if (!(name in this.registerMap)) {
            throw new Error(`[x16_x]: [CPU]: No such register: ${name}`);
        }

        return this.registers.getUint16(this.registerMap[name]);
    }

    setRegister(name, value) {
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

    execute(inst) {
        switch (inst) {
            case instructions.MOV_LIT_R1: {
                const literal = this.fetch16();
                this.setRegister('r1', literal);
                return;
            }

            case instructions.MOV_LIT_R2: {
                const literal = this.fetch16();
                this.setRegister('r2', literal);
                return;
            }

            case instructions.ADD_REG_REG: {
                const r1 = this.fetch();
                const r2 = this.fetch();

                const r1v = this.registers.getUint16(r1 * 2);
                const r2v = this.registers.getUint16(r2 * 2);

                this.setRegister('acc', r1v + r2v);
                return;
            }

            default:
                throw new Error(`[x16_x]: [CPU]: Invalid instructions: ${inst}`);
        }
    }

    step() {
        const inst = this.fetch();
        return this.execute(inst);
    }
}