import React, {Component, Fragment, Ref, RefObject} from 'react';
import Prediction from '../prediction';
import "./App.scss"
import {ipcRenderer} from 'electron';
import * as fs from "fs";
import * as electron from "electron";
import {insertTextInHtml} from "./Util";
import fitTextarea from "fit-textarea";

const configDir = (electron.app || electron.remote.app).getPath('home');
const PREDEFINED_TEXTS_FILE = '/predefined_texts.json';

export default class App extends Component {
    speechSynthesis: SpeechSynthesisUtterance;
    prediction: RefObject<Prediction>; // Prediction Class which shows the predictions and changes text
    output: RefObject<HTMLTextAreaElement>; // Input/Output Element

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
            if (event.key === "Enter") {
                // Enter with ctrl is speak
                if (event.ctrlKey) {
                    event.preventDefault();
                    this.speak();
                }
            }

            // F5 is command
            if (event.key === "F5") {
                event.preventDefault();

                this.setState({
                    selectedTextCommand: !this.state.selectedTextCommand,
                    saveTextCommand: false
                });
            }

            // F4 is save text
            if (event.key === "F4") {
                this.setState({
                    selectedTextCommand: !this.state.selectedTextCommand,
                    saveTextCommand: !this.state.selectedTextCommand
                });
                event.preventDefault();
            }

            // 0 - 9 to write numbers
            if (Number(event.key) >= 0 && Number(event.key) <= 9 && event.ctrlKey) {
                // If ctrl is pressed print the number
                event.preventDefault();
                insertTextInHtml(this.output, event.key);
            }

            // 1 - 8 to select predictions
            if (Number(event.key) >= 1 && Number(event.key) <= 8 && !event.ctrlKey) {
                event.preventDefault();
                // Different menues
                if (this.state.saveTextCommand) {
                    // In save command

                    if (this.output.current.value.length === 0) return;
                    // Save command
                    const _preDefTexts = this.state.predefinedText;
                    _preDefTexts[Number(event.key) - 1] = this.output.current.value;
                    this.setState({predefinedText: _preDefTexts});
                    this.savePredefinedTexts();

                    insertTextInHtml(this.output, 'Gespeichert', true);

                    const thiz = this;
                    setTimeout(() => {
                        insertTextInHtml(this.output, '', true);
                        thiz.setState({selectedTextCommand: false, saveTextCommand: false});
                    }, 1000);
                } else if (this.state.selectedTextCommand) {
                    // In select Text to read command
                    const text = this.state.predefinedText[Number(event.key) - 1];
                    if (text === undefined || text == null) return;
                    insertTextInHtml(this.output, this.state.predefinedText[Number(event.key) - 1], false);
                    this.setState({selectedTextCommand: false, saveTextCommand: false});
                } else {
                    // Normal select prediction
                    const word = this.prediction.current.selectPrediction(Number(event.key));
                    insertTextInHtml(this.output, word, true);
                }
            }

            // Tab remove all text
            if (event.key === "Tab") {
                event.preventDefault();
                insertTextInHtml(this.output, '', true);
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
        if (fs.existsSync(configDir + PREDEFINED_TEXTS_FILE)) {
            const data = fs.readFileSync(configDir + PREDEFINED_TEXTS_FILE);
            console.log(data);
            return JSON.parse(data as any);
        } else {
            return []
        }
        // return data;
    }

    speak() {
        const text = this.output.current.value;

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

                <textarea
                    // @ts-ignore
                    rows="1" tabIndex={0} className="in-out-text" id="in-out-text" ref={this.output}
                    onChange={(e) => {
                        this.setState({text: e.currentTarget.value});
                        fitTextarea(e.currentTarget);
                    }}/>

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