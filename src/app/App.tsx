import React, {Component, Fragment} from 'react';
import Prediction from '../prediction';
import "./App.scss"
import {ipcRenderer} from 'electron';

export default class App extends Component {
    output;
    speechSynthesis;

    state = {
        text: "",
        isScreenOn: true
    };

    constructor(props) {
        super(props);
        this.output = React.createRef();
        this.speechSynthesis = new SpeechSynthesisUtterance();

        window.addEventListener("keydown", event => {
            // ENTER
            if (event.keyCode === 13) {
                this.speak();
                event.preventDefault();
            }
        });

        ipcRenderer.on('switch-successful', () => {
            this.setState({isScreenOn: !this.state.isScreenOn})
        });
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
                <div style={{margin: "0.5em"}}>Nummern: Auswahl, Enter: Sprachausgabe, Tab: Löschen<br/>F10: Öffnen, F6:
                    Display, F7: Links Klick, F9: Rechts Klick
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

                <Prediction text={this.state.text} textfield={this.output}/>

                <div>
                    <table className="predefined-text-table">
                        <tr className="predefined-text">
                            <td className="predefined-text-number">1</td>
                            <td>
                                Nein
                            </td>
                        </tr>
                        <tr className="predefined-text">
                            <td className="predefined-text-number">2</td>
                            <td>
                                Ja
                            </td>
                        </tr>
                        <tr className="predefined-text">
                            <td className="predefined-text-number">3</td>
                            <td>
                                Stop!
                            </td>
                        </tr>
                        <tr className="predefined-text">
                            <td className="predefined-text-number">4</td>
                            <td>
                                Das finde ich gut!
                            </td>
                        </tr>
                    </table>
                </div>

            </Fragment>
        );
    }
}