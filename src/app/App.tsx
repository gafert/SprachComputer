import React, {Component, Fragment, Ref, RefObject} from 'react';
import Prediction from '../prediction';
import "./App.scss"
import {ipcRenderer} from 'electron';
import {insertTextInHtmlRefAndSetCarret} from "./Util";
import * as fs from "fs";
import * as electron from "electron";

const configDir = (electron.app || electron.remote.app).getPath('home');
const PREDEFINED_TEXTS_FILE = '/predefined_texts.json';

export default class App extends Component {
    speechSynthesis: SpeechSynthesisUtterance;
    prediction: RefObject<Prediction>; // Prediction Class which shows the predictions and changes text
    output: RefObject<HTMLDivElement>; // Input/Output Element

    state = {
        text: "",
        isScreenOn: true,
        selectedTextCommand: false,
        saveTextCommand: false,
        predefinedText: this.loadPredefinedTexts()
    };

    constructor(props) {
        super(props);
        this.output = React.createRef();
        this.prediction = React.createRef();
        this.speechSynthesis = new SpeechSynthesisUtterance();

        window.addEventListener("keydown", event => {
            // Enter is speak
            if (event.keyCode === 13) {
                this.speak();
                event.preventDefault();
            }

            // F5 is command
            if (event.keyCode === 116) {
                this.setState({selectedTextCommand: !this.state.selectedTextCommand});
                event.preventDefault();
            }

            // F4 is save text
            if (event.keyCode === 115) {
                this.setState({
                    selectedTextCommand: !this.state.selectedTextCommand,
                    saveTextCommand: !this.state.saveTextCommand
                });
                event.preventDefault();
            }

            // 1 - 8 to select predictions
            if (event.keyCode - 48 >= 1 && event.keyCode - 48 <= 8) {
                event.preventDefault();
                console.log(this.state);
                if (this.state.saveTextCommand) {
                    if(this.output.current.innerText.length === 0) return;
                    // Save command
                    const _preDefTexts = this.state.predefinedText;
                    _preDefTexts[event.keyCode - 48 - 1] = this.output.current.innerText;
                    this.setState({predefinedText: _preDefTexts});
                    this.savePredefinedTexts();
                    insertTextInHtmlRefAndSetCarret(this.output, 'Gespeichert');
                    const thiz = this;
                    setTimeout(() => {
                        insertTextInHtmlRefAndSetCarret(this.output, '');
                        thiz.setState({selectedTextCommand: false, saveTextCommand: false});
                    }, 1000);
                } else if (this.state.selectedTextCommand) {
                    const text = this.state.predefinedText[event.keyCode - 48 - 1];
                    if (text === undefined || text == null) return;
                    insertTextInHtmlRefAndSetCarret(this.output, this.state.predefinedText[event.keyCode - 48 - 1]);
                    this.setState({selectedTextCommand: false, saveTextCommand: false});
                } else {
                    // Normal select prediction
                    this.prediction.current.selectPrediction(event.keyCode - 48);
                }
            }

            // Tab remove all text
            if (event.keyCode === 9) {
                this.output.current.innerHTML = "";
                // Call that the input changed so it rerenders the predictions
                const e = new Event('input', {bubbles: true});
                this.output.current.dispatchEvent(e);
                event.preventDefault();
            }
        });

        ipcRenderer.on('switch-successful', () => {
            this.setState({isScreenOn: !this.state.isScreenOn})
        });
    }

    savePredefinedTexts() {
        console.log(this.state.predefinedText);
        fs.writeFile(configDir + PREDEFINED_TEXTS_FILE, JSON.stringify(this.state.predefinedText), function (err) {
            if (err) {
                return console.log(err);
            }
            console.log("Predefined texts file was saved!");
        });
    }

    loadPredefinedTexts(): Array<string> {
        if(fs.existsSync(configDir + PREDEFINED_TEXTS_FILE)) {
            const data = fs.readFileSync(configDir + PREDEFINED_TEXTS_FILE);
            console.log(data);
            return JSON.parse(data as any);
        } else {
            return []
        }
        // return data;
    }

    speak() {
        const text = this.output.current.innerText;

        if (text === undefined || text === null) {
            return;
        }

        this.speechSynthesis.lang = 'de-AT';
        this.speechSynthesis.rate = 0.8;
        this.speechSynthesis.text = text;
        window.speechSynthesis.speak(this.speechSynthesis);
        this.output.current.focus();
    };

    render() {
        return (
            <Fragment>
                <div style={{margin: "0.5em"}}>
                    Nummern: Auswahl, Enter: Sprachausgabe, Tab: Löschen<br/>
                    F1: Vollbild, F4: Speichern, F5: Text, F6: Display, F7: Links Klick, F9: Rechts Klick, F10: Öffnen
                </div>

                <div className="commands">
                    <button type="button" onClick={() => {
                        ipcRenderer.send('switch-screen');
                        this.output.current.focus();
                    }
                    } className="button">
                        {this.state.isScreenOn && <i className="fas fa-tablet"/>}
                        {!this.state.isScreenOn && <i className="fas fa-tablet-alt"/>}
                    </button>
                    <button type="button" onClick={() => {
                        this.speak();
                    }} className="button">
                        <i className="fas fa-volume-up"/>
                    </button>

                </div>

                <div
                    // @ts-ignore
                    tabIndex="0" className="in-out-text" id="in-out-text" ref={this.output}
                    onInput={(e) => this.setState({text: e.currentTarget.innerText})} contentEditable={true}/>

                {!this.state.selectedTextCommand &&
                <Prediction ref={this.prediction} text={this.state.text} textfield={this.output}/>}

                {this.state.selectedTextCommand && <div>
                    <div style={{fontWeight: 1000, padding: "0.5em"}}>
                        {this.state.saveTextCommand ? "Slot zum Speichern wählen" : "Text wählen"}
                    </div>
                    <table className="predefined-text-table">
                        {this.state.predefinedText.map((text, i) => {
                            return <tr className="predefined-text">
                                <td className="predefined-text-number">{i + 1}</td>
                                <td>
                                    {text}
                                </td>
                            </tr>
                        })}
                    </table>
                </div>}

            </Fragment>
        );
    }
}