export function clear(): void {
    return console.clear();
}

export function moveTo(x: string | number, y: string | number): void {
    return console.log(`\x1b[${y};${x}H`);
}

export function setBold() {
    Deno.stdout.write(new TextEncoder().encode('\x1b[1m'));
}
  
export function reset() {
    Deno.stdout.write(new TextEncoder().encode('\x1b[0m'));
}
  
export function createScreenDevice() {
    return {
        getUint16: () => 0,
        getUint8: () => 0,
        setUint16: (address: number, data: number) => {
            const command = (data & 0xff00) >> 8;
            const characterValue = data & 0x00ff;
    
            if (command === 0xff) {
                clear();
            }
            
            else if (command === 0x01) {
                setBold();
            }
            
            else if (command === 0x02) {
                reset();
            }
    
            const x = (address % 16) + 1;
            const y = Math.floor(address / 16) + 1;
            moveTo(x * 2, y);
            const character = String.fromCharCode(characterValue);
            Deno.stdout.write(new TextEncoder().encode(character));
        }
    }
}