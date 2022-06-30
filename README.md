# FloatinCity RaspberryPi(Master) Node Server

## Requirments 

- PC/Laptop with a IDE or Code editor
- RaspberryPi 4 Model B
- MicroSD min. 16GB
- SD card reader/writer for MicroSD's
- A coffee ;)

## Step 1: Installation and Preparation
- [Installation RaspberryPi](doc/Installation.md) 
- [Preparation Environment](doc/IDE.md)

## Step 2: Checkout and run

-   Clone repository

```shell
git clone https://github.com/TFBS-EKE-FloatingCity/Raspberry.git
```

-   Install Node Modules

```shell
yarn
```

-   Start the server

```shell
yarn start
```
## Informations / Notes

- [Pinout for Raspberry to Arduino](doc/PinOuts.md)
- [General](doc/General.md)

## Key Technologies

-   [Node.js](https://nodejs.org/en/): JavaScript runtime
-   [TypeScript](https://www.typescriptlang.org/): JS superset, that allows us to use types with JavaScript
-   [Spi-Device](https://github.com/fivdi/spi-device#readme): Spi-Communication
-   [RxJS](https://www.learnrxjs.io/learn-rxjs/subjects/behaviorsubject): App State management
-   [socket.io](https://socket.io/docs/v2/index.html): websocket connection with the windows server
-   [Jest](https://jestjs.io/): unit tests
