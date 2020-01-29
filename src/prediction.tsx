import React, {Component, RefObject} from 'react';
import * as fs from 'fs';
import words_de from './words_de';

const electron = require('electron');
const configDir = (electron.app || electron.remote.app).getPath('home');

const Predictionary = require('../node_modules/predictionary');

const DICT_DE = 'DICT_DE';
const DICT_DE_FILE = '/dictionary_de.json';

interface Props {
    text: string
    textfield: RefObject<any>
}

export default class Prediction extends Component<Props> {
    predictionary;
    saveTimeout;

    state = {
        suggestions: [],
    };

    constructor(props) {
        super(props);
        this.predictionary = Predictionary.instance();

        // Load new dictionary if there is none
        if (!fs.existsSync(configDir + DICT_DE_FILE)) {
            // Load new dictionary
            setTimeout(function () {
                alert("Neues Wörterbuch wird in " + configDir + " generiert")
            }, 1);
            this.predictionary.parseWords(words_de, {
                elementSeparator: '\n',
                rankSeparator: ' ',
                wordPosition: 2,
                rankPosition: 0,
                addToDictionary: DICT_DE
            });

        } else {
            // Load json
            console.log("File exists, trying to read.");
            console.log(fs.readFileSync(configDir + DICT_DE_FILE, "utf8"));
            this.predictionary.loadDictionary(fs.readFileSync(configDir + DICT_DE_FILE, "utf8"), DICT_DE)
        }

        window.addEventListener("keydown", event => {

        });
    }

    /**
     * Select 1-8 prediction
     * @param i Number of the prediciton
     */
    public selectPrediction(i: number): string {
        return this.select(this.state.suggestions[i - 1])
    }

    /**
     * Put a word into the textfield
     * @param word
     */
    private select(word) {
        if (word === undefined || word === null) return this.props.textfield.current.value;
        this.setState({suggestions: this.predictionary.predict(this.props.textfield.current.value)});
        return this.predictionary.applyPrediction(this.props.textfield.current.value, word);
    }

    /**
     * Save the loaded dictionary to a local file
     */
    private saveDict() {
        let dict = this.predictionary.dictionaryToJSON(DICT_DE);
        console.log("Saving dictionary");
        fs.writeFileSync(configDir + DICT_DE_FILE, dict)
    }

    render() {
        this.predictionary.learnFromInput(this.props.text);
        this.state.suggestions = this.predictionary.predict(this.props.text, {maxPredictions: 8});

        // Save only after 2 seconds doing nothing
        if (this.saveTimeout != undefined) clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => {
            this.saveDict();
        }, 1000);

        return (
            <div className="prediction-buttons" id="button-holder">
                {this.state.suggestions.map((word, i) =>
                    <div className="prediction-button" key={word} onClick={() => this.select(word)}>
                        <div className="prediction-text">{word}</div>
                        <div className="prediction-select-number">{i + 1}</div>
                    </div>)}
            </div>
        );
    }
}