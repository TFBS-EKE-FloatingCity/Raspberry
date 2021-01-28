#FloatinCity RaspberryPi(Master) Node Server

### Requirements

-   Node(14.15.1) + NPM/Yarn
-   Python3
-   g++

### Installation

-   Install NodeJS

```shell
curl -sL https://deb.nodesource.com/setup_13.x | sudo -E bash - sudo apt-get install -y nodejs
```

-   Install Python

```bash
 sudo apt-get update  && sudo apt-get install python3
```

-   Install Build-Essentials (for the c++ compiler)

```bash
 sudo apt-get update  && sudo apt-get install build-essential
```

-   Install Yarn (after NodeJS)

```shell
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
```

```shell
sudo apt update && sudo apt install yarn
```


### Installation (Windows)


-   Install NodeJS


Install Node-Verion-Manager with setup: https://github.com/coreybutler/nvm-windows/releases/tag/1.1.7
```shell
nvm install 14.15.1

nvm use 14.15.1
```


-   Install Yarn

Install: https://classic.yarnpkg.com/en/docs/install/#windows-stable
<br>
Restart all Commandline Tools (Including IDE)


-   Install Windows Build Tools

Method 1.
```shell
yarn global add windows-build-tools
```

Method 2.
<br>
Install C++ Tools in Visual Studio



### Checkout and run

-   Clone repository

```shell
git clone https://bSdSchule@dev.azure.com/bSdSchule/FloatingCity/_git/Raspberry
```

-   Install Node Modules

```shell
yarn
```

### Run Server

-   Install Node Modules

```shell
yarn start-prod
```
