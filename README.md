# Sprachcomputer

This program was part of [UNIKATE 2019](https://www.behindertenrat.at/2019/10/unikate-per-ideenwettbewerb-barrieren-beseitigen/). It is a simple GUI with word prediction.

It uses the predictionary libary by klues [https://github.com/asterics/predictionary](https://github.com/asterics/predictionary) for the word prediction.

## Development

This is an electron app with integrated react. 

To start the development use `npm run electron-dev`

To pack everything into an installable .exe use `npm run electron-pack`. Mac builds are also possible if the package.json is changed.

As is uses alternate input methods and serial, robotjs and serialport packages are used. These require a specific node version. If the node Version is changed the package.json needs to be changed according to the new version.

## Running

If the progam is started it will generate a dictionary file in the users home directory. This files saves all the words and how they are placed in sentences. A german dictionary is used as a start. This is saved in the code itself and cannot be changed during runtime (altough predictionary can do that). If the file is deleted it will be regenerated. 

