import { CPU, createMemory, instructions, MemoryMapper, createScreenDevice } from './mod.ts';

const IP = 0;
const ACC = 1;
const R1 = 2;

// Create a new MemoryMapper instance
const MM = new MemoryMapper();

// Create memory
// A lot of them
const memory = createMemory(256 * 256);
MM.map(memory, 0, 0xffff);

// Map 0xFF bytes of the address space to an "output device" - just stdout
MM.map(createScreenDevice(), 0x3000, 0x30ff, true);

// Create a writable bytes where we will insert our instruction
// And a CPU instance
const writableBytes = new Uint8Array(memory.buffer);
const cpu = new CPU(MM);
let i = 0;

// Insert a subroutine for pausing/waiting at the address below
const waitSubroutineAddress = 0x3100;

const writeCharToScreen = (char: string, command: number, position: number) => {
    writableBytes[i++] = instructions.MOV_LIT_REG;
    writableBytes[i++] = command;
    writableBytes[i++] = char.charCodeAt(0);
    writableBytes[i++] = R1;

    writableBytes[i++] = instructions.MOV_REG_MEM;
    writableBytes[i++] = R1;
    writableBytes[i++] = 0x30;
    writableBytes[i++] = position;
};

/*
 * Use JavaScript to generate the machine code for an animation
 */

let boldValue = 0;

// Each iteration of the loop draws a different "frame" of animation
for (let x = 3; x <= 15; x += 2) {
  boldValue = boldValue === 0 ? 1 : 0;

    // Clear the screen
    writeCharToScreen(' ', 0xff, 0);

    for (let index = 0; index <= 0xff; index++) {
        const command = (index % 2 === boldValue)
        ? 0x01  // In bold
        : 0x02; // Regular
        const char = (index % x === 0) ? ' ' : '+';
        writeCharToScreen(char, command, index);
    }

    // No arguments for this functional call
    writableBytes[i++] = instructions.PSH_LIT;
    writableBytes[i++] = 0x00;
    writableBytes[i++] = 0x00;

    // Call the pause/wait function
    writableBytes[i++] = instructions.CAL_LIT;
    writableBytes[i++] = (waitSubroutineAddress & 0xff00) >> 8;
    writableBytes[i++] = (waitSubroutineAddress & 0x00ff);
}

// Jump to the start of the code
writableBytes[i++] = instructions.MOV_LIT_REG;
writableBytes[i++] = 0x00;
writableBytes[i++] = 0x00;
writableBytes[i++] = IP;

//////////// Subroutine for pausing ///////////////

// start writing code at the subroutine address
i = waitSubroutineAddress;

// R1 is a constant 1, which we add to the accumulator
writableBytes[i++] = instructions.MOV_LIT_REG;
writableBytes[i++] = 0;
writableBytes[i++] = 1;
writableBytes[i++] = R1;

// Acc starts at zero
writableBytes[i++] = instructions.MOV_LIT_REG;
writableBytes[i++] = 0;
writableBytes[i++] = 0;
writableBytes[i++] = ACC;

// loopStart is a label for the beginning of this loop
const loopStart = i;

// Add R1 (1) to the Acc
writableBytes[i++] = instructions.ADD_REG_REG;
writableBytes[i++] = R1;
writableBytes[i++] = ACC;

// if (Acc != 0xccff) then jump tp the start of the loop
writableBytes[i++] = instructions.JMP_NOT_EQ;
writableBytes[i++] = 0xcc;
writableBytes[i++] = 0xff;
writableBytes[i++] = (loopStart & 0xff00) >> 8;
writableBytes[i++] = (loopStart & 0x00ff);

// otherwise return from the function
writableBytes[i++] = instructions.RET;

// Run our CPU
cpu.run();