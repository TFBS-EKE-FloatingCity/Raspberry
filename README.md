#FloatinCity RaspberryPi(Master) Node Server

### Requirements
* Node(14.15.1) + NPM/Yarn


### Installation
* Install NodeJS

```shell
curl -sL https://deb.nodesource.com/setup_13.x | sudo -E bash - sudo apt-get install -y nodejs
```
* Install Yarn (after NodeJS)

```shell
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
```
```shell
sudo apt update && sudo apt install yarn
```

* Clone repository
```shell
git clone https://bSdSchule@dev.azure.com/bSdSchule/FloatingCity/_git/Raspberry
```

* Install Node Modules 
```shell
yarn
```

### Run Server
* Install Node Modules 
```shell
yarn start-prod
```