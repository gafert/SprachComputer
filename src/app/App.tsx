import React, {Component, Fragment} from 'react';
import Prediction from '../prediction';
import "./App.scss"
import SerialPort from 'serialport'

export default class App extends Component {
    output;
    speechSynthesis;


    state = {
        text: ""
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
    }

    speak() {
        const text = this.output.current.innerText;
        console.log(text);

        if (text === undefined || text === null) {
            return;
        }

        this.speechSynthesis.lang = 'de-AT';
        this.speechSynthesis.rate = 0.8;
        this.speechSynthesis.text = text;
        window.speechSynthesis.speak(this.speechSynthesis);
    };

    showOnScreen() {
        SerialPort.list().then(
            ports => ports.forEach(console.log),
            err => console.error(err)
        )
    }

    render() {


        return (
            <Fragment>

                <div style={{margin: "0.5em"}}>Nummern: Auswahl, Enter: Sprachausgabe, Tab: Löschen</div>

                <div className="commands">
                    <button type="button" onClick={() => {
                        this.showOnScreen();
                    }} className="button">
                        <i className="fas fa-desktop"/>
                    </button>
                    <button type="button" onClick={() => {
                        this.speak();
                    }} className="button">
                        <i className="fas fa-volume-up"/>
                    </button>

                </div>


                <div
                    // @ts-ignore
                    tabIndex="0" className="in-out-text" id="in-out-text" ref={this.output} onInput={(e) => this.setState({text: e.target.innerText})} contentEditable="true"/>

                <Prediction text={this.state.text} textfield={this.output}/>

            </Fragment>
        );
    }
}