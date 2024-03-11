# photiso

## How this project was assembled

1. Create a typescript-based electron app
    - npm init
    - npm install -D electron concurrently typescript
    - tsc init
    - create src/main.ts
    - update tsconfig.json 
        - "outDir": "./build",   
    - update src/main.ts with standard electron window creation from first app tutorial
    - 