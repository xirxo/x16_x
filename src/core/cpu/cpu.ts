import { instructions, createMemory, MemoryMapper } from '../../mod.ts';

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

    // Fetch the 8 bit value of instruction pointer
    public fetch() {
        const next = this.getRegister('ip');
        const now = this.mem.getUint8(next);

        this.setRegister('ip', next + 1);
        return now;
    }

    // Fetch the 16 bit value of instruction pointer
    public fetch16() {
        const next = this.getRegister('ip');
        const now = this.mem.getUint16(next);

        this.setRegister('ip', next + 2);
        return now;
    }

    // Push value to stack
    public push(value: number): void {
        const adrr = this.getRegister('sp');
        this.mem.setUint16(adrr, value);
        this.setRegister('sp', adrr - 2);
        this.stackSize += 2;
    }

    // Pop or remove value from stack
    public pop(): number {
        const adrr = this.getRegister('sp') + 2;
        this.setRegister('sp', adrr);
        this.stackSize -= 2;
        return this.mem.getUint16(adrr);
    }

    // Push states to stack
    public pushState(): void {
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

    // Pop states from stack
    public popState(): void {
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

    // Get the index of register
    public fetchRegisterIndex(): number {
        return (this.fetch() % this.registerNames.length) * 2;
    }

    // Execute instructions
    public execute(instruction: number): true | void {
        switch (instruction) {
            // Move from literal to register
            case instructions.MOV_LIT_REG: {
                const literal = this.fetch16();
                const register = this.fetchRegisterIndex();
                this.registers.setUint16(register, literal);
                return;
            }
        
            // Move from register to register
            case instructions.MOV_REG_REG: {
                const registerFrom = this.fetchRegisterIndex();
                const registerTo = this.fetchRegisterIndex();
                const value = this.registers.getUint16(registerFrom);
                this.registers.setUint16(registerTo, value);
                return;
            }
        
            // Move from register to memory
            case instructions.MOV_REG_MEM: {
                const registerFrom = this.fetchRegisterIndex();
                const address = this.fetch16();
                const value = this.registers.getUint16(registerFrom);
                this.mem.setUint16(address, value);
                return;
            }
        
            // Move from memory to register
            case instructions.MOV_MEM_REG: {
                const address = this.fetch16();
                const registerTo = this.fetchRegisterIndex();
                const value = this.mem.getUint16(address);
                this.registers.setUint16(registerTo, value);
                return;
            }
        
            // Add register to register
            case instructions.ADD_REG_REG: {
                const r1 = this.fetchRegisterIndex();
                const r2 = this.fetchRegisterIndex();
                const registerValue1 = this.registers.getUint16(r1 * 2);
                const registerValue2 = this.registers.getUint16(r2 * 2);
                this.setRegister('acc', registerValue1 + registerValue2);
                return;
              }

            // Conditional jump
            case instructions.JMP_NOT_EQ: {
                const value = this.fetch16();
                const address = this.fetch16();
        
                if (value !== this.getRegister('acc')) {
                  this.setRegister('ip', address);
                }
        
                return;
            }

            // Push literal
            case instructions.PSH_LIT: {
                const value = this.fetch16();
                this.push(value);
                return;
            }

            // Push register
            case instructions.PSH_REG: {
                const registerIndex = this.fetchRegisterIndex();
                this.push(this.registers.getUint16(registerIndex));
                return;
            }

            // Pop value
            case instructions.POP: {
                const registerIndex = this.fetchRegisterIndex();
                const value = this.pop();
                this.registers.setUint16(registerIndex, value);
                return;
            }

            // Call literal
            case instructions.CAL_LIT: {
                const address = this.fetch16();
                this.pushState();
                this.setRegister('ip', address);
                return;
            }

            // Call register
            case instructions.CAL_REG: {
                const registerIndex = this.fetchRegisterIndex();
                const address = this.registers.getUint16(registerIndex);
                this.pushState();
                this.setRegister('ip', address);
                return;
            }

            // Return
            case instructions.RET: {
                this.popState();
                return;
            }

            // Halt
            case instructions.HLT: {
                return true;
            }
        }

        return;
    }

    // Fetch then execute
    public step(): true | void {
        const inst = this.fetch();
        return this.execute(inst);
    }

    // Run the CPU
    public run(): void {
        const halt = this.step();
        if (!halt) setTimeout(() => this.run());
        return;
    }
}