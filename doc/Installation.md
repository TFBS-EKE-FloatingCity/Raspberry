# Installation RaspberryPi

**MicroSD card wit 16 GB is required**

-   Raspberry Pi OS Lite (32bit)
-   Node(14.19.2) + Yarn (1.22.18)
-   Python3
-   g++

## Installation

-   Install [Raspberry Pi OS Lite (32bit)](https://www.raspberrypi.com/software/operating-systems/) on an SD card with [Raspberry Pi Imager](https://www.raspberrypi.com/software/)
    - Following the [Tutorial Method 1](https://peppe8o.com/install-raspberry-pi-os-lite-in-your-raspberry-pi/)

**It is Important to install Node before yarn**

-   Optinal: Install [nvm - Node Verion Manager](https://github.com/nvm-sh/nvm#installing-and-updating)
-   Install NodeJS 14.19.2
-   Install Python

```bash
 sudo apt-get update  && sudo apt-get install python3
```

-   Install Build-Essentials (for the c++ compiler)

```bash
 sudo apt-get update  && sudo apt-get install build-essential
```

-   Install Yarn 1.22.18 (after NodeJS) (https://classic.yarnpkg.com/en/docs/install/)

