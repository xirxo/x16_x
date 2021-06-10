# x16_x
💻 A simple 16-bit virtual machine

# What's new?
This project has merged with [Hogen](https://github.com/xirxo/Hogen 'Hogen')!

# Getting started
## Prerequisite
You'll need [`deno`](https://deno.land 'Deno') and [`git`](https://git-scm.org 'Git').

## Cloning
To clone this project to your local machine, simply use [Git](https://git-scm.org 'Git').
```
$ git clone https://github.com/xirxo/x16_x.git
```

## Running
To run the VM, you'd need [Deno](https://deno.land 'Deno'). I will add supports for [NodeJS](https://nodejs.org/ 'NodeJS') in later version.
```
$ clear && deno run -qA ./src/index.ts
```
You can also execute the [`run`](https://github.com/xirxo/x16_x/blob/main/run) file.
```
$ ./run
```

## Targetting
Currently, this is not possible.

# Instructions
## Moving values
| Instructions                | Hex value | Assembly |
|-----------------------------|-----------|----------|
| Moving literal to register  | `0x10`    | N/A      |
| Moving register to register | `0x11`    | N/A      |
| Moving register to memory   | `0x12`    | N/A      |
| Moving memory to register   | `0x13`    | N/A      |

## Adding values
| Instructions                | Hex value | Assembly |
|-----------------------------|-----------|----------|
| Adding register to register | `0x14`    | N/A      |

## Conditional jumps
| Instructions      | Hex value | Assembly |
|-------------------|-----------|----------|
| Jump if not equal | `0x15`    | N/A      |

## Pushing values
| Instructions  | Hex value | Assembly |
|---------------|-----------|----------|
| Push literal  | `0x17`    | N/A      |
| Push register | `0x18`    | N/A      |

## Popping values
| Instructions     | Hex value | Assembly |
|------------------|-----------|----------|
| Pop              | `0x1A`    | N/A      |

## Calling values
| Instructions     | Hex value | Assembly |
|------------------|-----------|----------|
| Calling literal  | `0x5E`    | N/A      |
| Calling register | `0x5F`    | N/A      |

## Others
| Instructions | Hex value | Assembly |
|--------------|-----------|----------|
| Return       | `0x60`    | N/A      |
| Halt         | `0xFF`    | N/A      |