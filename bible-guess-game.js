import { LitElement, html, css } from 'lit';
import { darkOrange } from 'sakura-themes';

class BibleGuessGame extends LitElement {
  static styles = [
    darkOrange,
    css`
      h1 {
        color: #ffffff;
      }
      .card {
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1rem;
      }
      .choices button {
        margin: 0.25rem;
        padding: 0.5rem 1rem;
      }
      .feedback {
        font-weight: bold;
        margin-top: 1rem;
      }
      .correct {
        color: lightgreen;
      }
      .incorrect {
        color: red;
      }
      .scoreboard {
        margin-top: 1rem;
        font-size: 1.1rem;
      }
    `
  ];

  static properties = {
    verse: { type: Object },
    feedback: { type: String },
    timeLeft: { type: Number },
    correct: { type: Number },
    total: { type: Number },
    gameOver: { type: Boolean },
    options: { type: Array },
    choiceMade: { type: Boolean }, // NEW
  };

  constructor() {
    super();
    this.verse = null;
    this.feedback = '';
    this.timeLeft = 180;
    this.correct = 0;
    this.total = 0;
    this.gameOver = false;
    this.options = [];
    this.choiceMade = false; // NEW
  }

  async firstUpdated() {
    this.startTimer();
    await this.fetchVerse();
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        clearInterval(this.timerInterval);
        this.timeLeft = 0;
        this.gameOver = true;
      }
      this.requestUpdate();
    }, 1000);
  }

  async fetchVerse() {
    const res = await fetch('https://bible-api.com/data/web/random?translation=kjv');
    const data = await res.json();
    this.verse = data?.random_verse;
    this.feedback = '';
    this.choiceMade = false;
    this.options = this.getOptions(this.verse.book);
  }

  checkGuess(selected) {
    if (this.choiceMade) return; // prevent multiple clicks
    this.choiceMade = true;

    const correct = this.verse?.book;
    this.total++;
    if (selected === correct) {
      this.correct++;
      this.feedback = '✅ Correct!';
    } else {
      this.feedback = `❌ Incorrect! The book was: ${correct}`;
    }

    setTimeout(() => this.fetchVerse(), 3000);
  }

  getOptions(correctBook) {
    const books = [
      "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
      "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
      "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles",
      "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs",
      "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah",
      "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos",
      "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah",
      "Haggai", "Zechariah", "Malachi", "Matthew", "Mark", "Luke",
      "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians",
      "Galatians", "Ephesians", "Philippians", "Colossians",
      "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy",
      "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter",
      "1 John", "2 John", "3 John", "Jude", "Revelation"
    ];
    const shuffled = books.filter(b => b !== correctBook).sort(() => 0.5 - Math.random());
    const choices = [correctBook, ...shuffled.slice(0, 3)];
    return choices.sort(() => 0.5 - Math.random());
  }

  formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  render() {
    return html`
      <h1>📖 Bible Book Guess Game</h1>
      <div class="scoreboard">
        ⏳ Time Left: ${this.formatTime(this.timeLeft)}<br />
        ✅ Score: ${this.correct}/${this.total}
      </div>

      ${this.gameOver
        ? html`<p>⏱️ Time's up! Final Score: ${this.correct}/${this.total}</p>`
        : this.verse
        ? html`
            <div class="card">"${this.verse.text}"</div>
            ${!this.choiceMade
              ? html`
                  <div class="choices">
                    ${this.options.map(book => html`
                      <button @click=${() => this.checkGuess(book)}>${book}</button>
                    `)}
                  </div>
                `
              : ''}
            <div class="feedback ${this.feedback.startsWith('✅') ? 'correct' : 'incorrect'}">
              ${this.feedback}
            </div>
          `
        : html`<p>Loading verse...</p>`}
    `;
  }
}

customElements.define('bible-guess-game', BibleGuessGame);
