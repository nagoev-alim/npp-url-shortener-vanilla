/**
 * @class App
 */
import axios from 'axios';
import feather from 'feather-icons';
import { showNotification } from '../modules/showNotification.js';

export default class App {
  constructor(root) {
    this.root = root;

    this.root.innerHTML = `
    <h3 class='title'>URL Shortener</h3>
    <div class='content'>
      <form data-form=''>
        <input type='text' name='url' placeholder='Paste a link to shorten it'>
        <button type='submit'>Submit</button>
      </form>
      <div class='result'>
        <input type='text' data-result=''>
        <button data-copy=''>${feather.icons.clipboard.toSvg()}</button>
      </div>
    </div>
      `;

    this.DOM = {
      form: document.querySelector('[data-form]'),
      inputResult: document.querySelector('[data-result]'),
      btnCopy: document.querySelector('[data-copy]'),
    };

    this.DOM.form.addEventListener('submit', this.onSubmit);
    this.DOM.btnCopy.addEventListener('click', this.onCopy);
  }

  /**
   * @function onSubmit - Form submit event handler
   * @param event
   * @returns {Promise<void>}
   */
  onSubmit = async (event) => {
    event.preventDefault();
    const form = event.target;
    const url = Object.fromEntries(new FormData(form).entries()).url.trim();

    if (!/^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/.test(url) || url.length === 0) {
      showNotification('warning', 'Please select validate URL.');
      this.onChangeClass(false)
      return;
    }

    try {
      form.querySelector('button').textContent = 'Loading...';

      const {
        data: {
          ok,
          result: { full_short_link },
        },
      } = await axios.get(`https://api.shrtco.de/v2/shorten?url=${url}`);

      if (!ok) {
        showNotification('danger', 'Something went wrong, open dev console.');
        this.onChangeClass(false)
        return;
      }

      this.DOM.inputResult.value = full_short_link;
      this.onChangeClass(true)

    } catch (e) {
      showNotification('danger', 'Something went wrong, open dev console.');
      this.onChangeClass(false)
      console.log(e);
    }
  };

  /**
   * @function onCopy - Copy text to clipboard
   */
  onCopy = () => {
    if (this.DOM.inputResult.value.trim().length === 0) {
      return;
    }
    navigator.clipboard.writeText(this.DOM.inputResult.value);
    showNotification('success', 'URL copied successfully to clipboard.');
  };

  onChangeClass = (type) => {
    document.querySelector('.result').className = `${document.querySelector('.result').classList[0]} ${type ? 'open' : ''}`;
    this.DOM.form.querySelector('button').textContent = 'Submit';
  };
}
