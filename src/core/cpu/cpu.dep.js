import { instructions, createMemory } from '../../mod.ts';

/**
 * @deprecated Use CPU from cpu.ts instead
 */
export class CPU_JS {
    stackSize = 0;
    registerNames = ['ip', 'acc','r1', 'r2', 'r3', 'r4','r5', 'r6', 'r7', 'r8', 'sp', 'fp'];
    registers = createMemory(this.registerNames.length * 2);
    registerMap = this.registerNames.reduce((map, name, i) => {
        map[name] = i * 2;
        return map;
    }, {});

    constructor(mem) {
        this.mem = mem;
    }

    debug() {
        this.registerNames.forEach(name =>
            console.log(`${name}: 0x${this.getRegister(name).toString(16).padStart(4, '0')}`)
        );

        console.log('\n');
    }

    view(add, n = 8) {
        const next = Array.from({ length: n }, (_, i) =>
            this.mem.getUint8(add + i)
        ).map(v => `0x${v.toString(16).padStart(2, '0')}`);

        console.log(`${add.toString(16).padStart(2, '0')}: ${next.join(' ')}`);
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

    push(value) {
        const adrr = this.getRegister('sp');
        this.mem.setUint16(adrr, value);
        this.setRegister('sp', adrr - 2);
        this.stackSize += 2;
    }

    pop() {
        const adrr = this.getRegister('sp') + 2;
        this.setRegister('sp', adrr);
        this.stackSize -= 2;
        return this.mem.getUint16(adrr);
    }

    pushState() {
        this.push(this.getRegister('r1'));
        this.push(this.getRegister('r2'));
        this.push(this.getRegister('r3'));
        this.push(this.getRegister('r4'));
        this.push(this.getRegister('r5'));
        this.push(this.getRegister('r6'));
        this.push(this.getRegister('r7'));
        this.push(this.getRegister('r8'));
        this.push(this.getRegister('ip'));
        this.push(this.stackSize + 2);
    
        this.setRegister('fp', this.getRegister('sp'));
        this.stackSize = 0;
    }

    popState() {
        const fp = this.getRegister('fp');
        this.setRegister('sp', fp);
    
        this.stackSize = this.pop();
        const stackSize = this.stackSize;
    
        this.setRegister('ip', this.pop());
        this.setRegister('r8', this.pop());
        this.setRegister('r7', this.pop());
        this.setRegister('r6', this.pop());
        this.setRegister('r5', this.pop());
        this.setRegister('r4', this.pop());
        this.setRegister('r3', this.pop());
        this.setRegister('r2', this.pop());
        this.setRegister('r1', this.pop());
    
        const nArgs = this.pop();
        for (let i = 0; i < nArgs; i++) {
          this.pop();
        }
    
        this.setRegister('fp', fp + stackSize);
    }

    fetchRegisterIndex() {
        return (this.fetch() % this.registerNames.length) * 2;
    }

    execute(instruction) {
        switch (instruction) {
            case instructions.MOV_LIT_REG: {
                const literal = this.fetch16();
                const register = this.fetchRegisterIndex();
                this.registers.setUint16(register, literal);
                return;
            }
        
            case instructions.MOV_REG_REG: {
                const registerFrom = this.fetchRegisterIndex();
                const registerTo = this.fetchRegisterIndex();
                const value = this.registers.getUint16(registerFrom);
                this.registers.setUint16(registerTo, value);
                return;
            }
        
            case instructions.MOV_REG_MEM: {
                const registerFrom = this.fetchRegisterIndex();
                const address = this.fetch16();
                const value = this.registers.getUint16(registerFrom);
                this.mem.setUint16(address, value);
                return;
            }
        
            case instructions.MOV_MEM_REG: {
                const address = this.fetch16();
                const registerTo = this.fetchRegisterIndex();
                const value = this.mem.getUint16(address);
                this.registers.setUint16(registerTo, value);
                return;
            }
        
            case instructions.ADD_REG_REG: {
                const r1 = this.fetchRegisterIndex();
                const r2 = this.fetchRegisterIndex();
                const registerValue1 = this.registers.getUint16(r1 * 2);
                const registerValue2 = this.registers.getUint16(r2 * 2);
                this.setRegister('acc', registerValue1 + registerValue2);
                return;
              }

            case instructions.JMP_NOT_EQ: {
                const value = this.fetch16();
                const address = this.fetch16();
        
                if (value !== this.getRegister('acc')) {
                  this.setRegister('ip', address);
                }
        
                return;
            }

            case instructions.PSH_LIT: {
                const value = this.fetch16();
                this.push(value);
                return;
            }

            case instructions.PSH_REG: {
                const registerIndex = this.fetchRegisterIndex();
                this.push(this.registers.getUint16(registerIndex));
                return;
            }

            case instructions.POP: {
                const registerIndex = this.fetchRegisterIndex();
                const value = this.pop();
                this.registers.setUint16(registerIndex, value);
                return;
            }

            case instructions.CAL_LIT: {
                const address = this.fetch16();
                this.pushState();
                this.setRegister('ip', address);
                return;
            }

            case instructions.CAL_REG: {
                const registerIndex = this.fetchRegisterIndex();
                const address = this.registers.getUint16(registerIndex);
                this.pushState();
                this.setRegister('ip', address);
                return;
            }

            case instructions.RET: {
                this.popState();
                return;
            }

            case instructions.HLT: {
                return true;
            }
        }    
    }

    step() {
        const inst = this.fetch();
        return this.execute(inst);
    }

    run() {
        const halt = this.step();
        if (!halt) setTimeout(() => this.run());
    }
}