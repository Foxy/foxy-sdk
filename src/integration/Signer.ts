import * as crypto from 'crypto';
import * as fs from 'fs';
import { JSDOM } from 'jsdom';
import { URL } from 'url';

type CodesDict = {
  [key: number]: {
    code: string;
    parent: string;
  };
};

/**
 * HMAC signing utility. Methods are named after what it is to be signed, to
 * allow for an easy to read code in the user application.
 *
 * @tutorial https://wiki.foxycart.com/v/2.0/hmac_validation
 * @example foxy.hmacSign.url("http://...") // signs a URL
 */
export class Signer {
  private _secret?: string;

  /**
   * Creates an instance of this class.
   *
   * @param secret OAuth2 client secret for your integration.
   */
  constructor(secret: string | null = null) {
    if (secret) {
      this.setSecret(secret);
    }
  }

  /**
   * Sets the HMAC secret.
   * It won't be possible to sign anything without this secret.
   *
   * @param secret OAuth2 client secret for your integration.
   */
  public setSecret(secret: string): Signer {
    this._secret = secret;
    return this;
  }

  /**
   * Signs a whole HTML snippet.
   *
   * @param htmlStr HTML snippet to sign.
   */
  public htmlString(htmlStr: string) {
    const dom = new JSDOM(htmlStr);
    this._fragment(dom.window.document);
    return dom.serialize();
  }

  /**
   * Signs a file asynchronously.
   *
   * @param inputPath Path of the file to sign.
   * @param outputPath Path of the file where the signed result will be stored.
   */
  public htmlFile(inputPath: string, outputPath: string) {
    return new Promise((resolve, reject) => {
      JSDOM.fromFile(inputPath).then(dom => {
        const signed = this._fragment(dom.window.document);
        fs.writeFile(outputPath, dom.serialize(), err => {
          if (err) reject(err);
          else resolve(signed);
        });
      });
    });
  }

  /**
   * Signs a query string.
   * All query fields withing the query string will be signed, provided it is a proper URL and there is a code field
   *
   * @param urlStr Full URL including the query string that needs to be signed.
   */
  public url(urlStr: string): string {
    // Build a URL object
    if (Signer._isSigned(urlStr)) {
      console.error('Attempt to sign a signed URL', urlStr);
      return urlStr;
    }
    // Do not change invalid URLs
    let url;
    let stripped;
    try {
      url = new URL(urlStr);
      stripped = new URL(url.origin);
    } catch (e) {
      //console.assert(e.code === "ERR_INVALID_URL");
      return urlStr;
    }
    const originalParams = url.searchParams;
    const newParams = stripped.searchParams;
    const code = Signer._getCodeFromURL(url);
    // If there is no code, return the same URL
    if (!code) {
      return urlStr;
    }
    // sign the url object
    for (const p of originalParams.entries()) {
      const signed = this._queryArg(decodeURIComponent(p[0]), decodeURIComponent(code), decodeURIComponent(p[1])).split(
        '='
      );
      newParams.set(signed[0], signed[1]);
    }
    url.search = newParams.toString();
    return Signer._replaceURLchars(url.toString());
  }

  /**
   * Signs input name.
   *
   * @param name Name of the input element.
   * @param code Product code.
   * @param parentCode Parent product code.
   * @param value Input value.
   */
  public name(name: string, code: string, parentCode = '', value?: string | number): string {
    name = name.replace(/ /g, '_');
    const signature = this._product(code + parentCode, name, value);
    const encodedName = encodeURIComponent(name);
    const nameAttr = Signer._buildSignedName(encodedName, signature, value);
    return nameAttr;
  }

  /**
   * Signs input value.
   *
   * @param name Name of the input element.
   * @param code Product code.
   * @param parentCode Parent product code.
   * @param value Input value.
   */
  public value(name: string, code: string, parentCode = '', value?: string | number): string {
    name = name.replace(/ /g, '_');
    const signature = this._product(code + parentCode, name, value);
    const valueAttr = Signer._buildSignedValue(signature, value);
    return valueAttr;
  }

  /**
   * Signs a product composed of code, name and value.
   *
   * @param code
   * @param name
   * @param value
   * @private
   */
  private _product(code: string, name: string, value?: string | number): string {
    return this._message(code + name + Signer._valueOrOpen(value));
  }

  /**
   * Signs a single query argument to be used in `GET` requests.
   *
   * @param name
   * @param code
   * @param value
   * @private
   */
  private _queryArg(name: string, code: string, value?: string): string {
    name = name.replace(/ /g, '_');
    code = code.replace(/ /g, '_');
    const signature = this._product(code, name, value);
    const encodedName = encodeURIComponent(name).replace(/%20/g, '+');
    const encodedValue = encodeURIComponent(Signer._valueOrOpen(value)).replace(/%20/g, '+');
    const nameAttr = Signer._buildSignedQueryArg(encodedName, signature, encodedValue);
    return nameAttr;
  }

  /**
   * Signs an input element.
   *
   * @param el
   * @param codes
   * @private
   */
  private _input(el: HTMLInputElement, codes: CodesDict): HTMLInputElement {
    const splitted = this._splitNamePrefix(el.name);
    const nameString = splitted[1];
    const prefix = splitted[0];
    const code = codes[prefix].code;
    const parentCode = codes[prefix].parent;
    const value = el.value;
    const signedName = this.name(nameString, code, parentCode, value);
    el.setAttribute('name', prefix + ':' + signedName);
    return el;
  }

  /**
   * Signs a texArea element.
   *
   * @param el
   * @param codes
   * @private
   */
  private _textArea(el: HTMLTextAreaElement, codes: CodesDict): HTMLTextAreaElement {
    const splitted = this._splitNamePrefix(el.name);
    const nameString = splitted[1];
    const prefix = splitted[0];
    const code = codes[prefix].code;
    const parentCode = codes[prefix].parent;
    const value = '';
    const signedName = this.name(nameString, code, parentCode, value);
    el.setAttribute('name', prefix + ':' + signedName);
    return el;
  }

  /**
   * Signs all option elements within a Select element.
   *
   * @param el
   * @param codes
   * @private
   */
  private _select(el: HTMLSelectElement, codes: CodesDict): HTMLSelectElement {
    el.querySelectorAll('option').forEach(opt => {
      this._option(opt, codes);
    });
    return el;
  }

  /**
   * Sign an option element.
   * Signatures are added to the value attribute on options.
   * This function may also be used to sign radio buttons.
   *
   * @param el
   * @param codes
   * @private
   */
  private _option(el: HTMLOptionElement | HTMLInputElement, codes: CodesDict): HTMLOptionElement | HTMLInputElement {
    // Get the name parameter, either from the "select"
    // parent element of an option tag or from the name
    // attribute of the input element itself
    let n = (el as any).name;
    if (n === undefined) {
      const p = el.parentElement as HTMLSelectElement;
      n = p.name;
    }
    const splitted = this._splitNamePrefix(n);
    const nameString = splitted[1];
    const prefix = splitted[0];
    const code = codes[prefix].code;
    const parentCode = codes[prefix].parent;
    const value = el.value;
    const signedValue = this.value(nameString, code, parentCode, value);
    el.setAttribute('value', prefix + ':' + signedValue);
    return el;
  }

  /**
   * Signs a radio button. Radio buttons use the value attribute to hold their signatures.
   *
   * @param el
   * @param codes
   * @private
   */
  private _radio(el: HTMLInputElement, codes: CodesDict): HTMLInputElement {
    return this._option(el, codes) as HTMLInputElement;
  }

  /**
   * Splits a string using the prefix pattern for foxy store.
   * The prefix pattern allows for including more than a single product in a given GET or POST request.
   *
   * @param name
   * @private
   */
  private _splitNamePrefix(name: string): [number, string] {
    const splitted = name.split(':');
    if (splitted.length == 2) {
      return [parseInt(splitted[0], 10), splitted[1]];
    }
    return [0, name];
  }

  /**
   * Retrieve a parent code value from a form, given a prefix.
   *
   * @param formElement
   * @param prefix
   * @private
   */
  private _retrieveParentCode(formElement: Element, prefix: string | number = ''): string {
    let result = ''; // A blank string indicates no parent
    let separator = '';
    if (prefix) {
      separator = ':';
    }
    const parentCodeEl = formElement.querySelector(`[name='${prefix}${separator}parent_code']`);
    if (parentCodeEl) {
      const parentCode = parentCodeEl.getAttribute('value');
      if (parentCode !== null) {
        result = parentCode;
      }
    }
    return result;
  }

  /**
   * Signs a whole form element.
   *
   * @param formElement
   * @private
   */
  private _form(formElement: Element) {
    // Grab all codes within the form element
    const codeList: NodeList = formElement.querySelectorAll('[name$=code]');
    // Store all codes in a object
    const codes: any = {};
    for (const node of codeList) {
      const nameAttr = (node as Element).getAttribute('name');
      const codeValue = (node as Element).getAttribute('value');
      if (nameAttr && nameAttr.match(/^([0-9]{1,3}:)?code/)) {
        const splitted = nameAttr.split(':');
        const prefix = splitted[0];
        if (splitted.length == 2) {
          // Store prefix in codes list
          codes[prefix] = {
            code: codeValue,
            parent: this._retrieveParentCode(formElement, prefix),
          };
        } else if (codes[0] === undefined) {
          // Allow to push a single code without prefix
          codes[0] = {
            code: codeValue,
            parent: this._retrieveParentCode(formElement),
          };
        } else {
          const documentationURL = 'https://wiki.foxycart.com/v/2.0/hmac_validation#multiple_products_in_one_form';
          const errorMsg = `There are multiple codes in the form element. Please, check ${documentationURL}`;
          throw new Error(errorMsg);
        }
      }
    }
    // Sign inputs
    formElement.querySelectorAll('input[name]').forEach(i => {
      if (i.getAttribute('type') === 'radio') {
        this._radio(i as HTMLInputElement, codes);
      } else {
        this._input(i as HTMLInputElement, codes);
      }
    });
    // Sign selects
    formElement.querySelectorAll('select[name]').forEach(s => this._select(s as HTMLSelectElement, codes));
    // Sign textAreas
    formElement.querySelectorAll('textarea[name]').forEach(s => this._textArea(s as HTMLTextAreaElement, codes));
  }

  /**
   * Builds the value for the signed "name" attribute value given it components.
   *
   * @param name that was signed
   * @param signature the resulting signature
   * @param value of the field that, if equal to --OPEN-- identifies an editable field.
   * @returns the signed value for the "name" attribute
   * @private
   */
  private static _buildSignedName(name: string, signature: string, value?: string | number) {
    let open = Signer._valueOrOpen(value);
    open = Signer._valueOrOpen(value) == '--OPEN--' ? '||open' : '';
    return `${name}||${signature}${open}`;
  }

  /**
   * Builds a signed name given it components.
   *
   * @param signature
   * @param value
   * @private
   */
  private static _buildSignedValue(signature: string, value?: string | number) {
    let open = Signer._valueOrOpen(value);
    open = Signer._valueOrOpen(value) == '--OPEN--' ? '||open' : (value as string);
    return `${open}||${signature}`;
  }

  /**
   * Builds a signed query argument given its components.
   *
   * @param name
   * @param signature
   * @param value
   * @private
   */
  private static _buildSignedQueryArg(name: string, signature: string, value: string | number) {
    return `${name}||${signature}=${value}`;
  }

  /**
   * Retuns the value of a field on the `--OPEN--` string if the value is not defined.
   * Please, notice that `0` is an acceptable value.
   *
   * @param value
   * @private
   */
  private static _valueOrOpen(value: string | number | undefined): string | number {
    if (value === undefined || value === null || value === '') {
      return '--OPEN--';
    }
    return value;
  }

  /**
   * Check if a href string is already signed. Signed strings contain two consecutive pipes
   * followed by 64 hexadecimal characters.
   *
   * @param url
   * @private
   */
  private static _isSigned(url: string): boolean {
    return url.match(/^.*\|\|[0-9a-fA-F]{64}/) != null;
  }

  /**
   * Returns the code from a URL or undefined if it does not contain a code.
   *
   * @param url
   * @private
   */
  private static _getCodeFromURL(url: URL): string | undefined {
    for (const p of url.searchParams) {
      if (p[0] == 'code') {
        return p[1];
      }
    }
  }

  /**
   * Find all cart forms in a document fragment that contain an input named `code`.
   *
   * @param doc
   * @private
   */
  private static _findCartForms(doc: ParentNode) {
    return Array.from(doc.querySelectorAll('form')).filter(e => e.querySelector('[name=code]'));
  }

  /**
   * Replace some of the characters encoded by `encodeURIComponent()`.
   *
   * @param urlStr
   * @private
   */
  private static _replaceURLchars(urlStr: string): string {
    return urlStr.replace(/%7C/g, '|').replace(/%3D/g, '=').replace(/%2B/g, '+');
  }

  /**
   * Signs a document fragment. This method is used to sign HTML snippets.
   *
   * @param doc
   * @private
   */
  private _fragment(doc: ParentNode): ParentNode {
    doc.querySelectorAll('a').forEach(l => {
      l.href = this.url(l.href);
    });
    Signer._findCartForms(doc).forEach(this._form.bind(this));
    return doc;
  }

  /**
   * Signs a simple message. This function can only be invoked after the secret has been defined. The secret can be defined either in the construction method as in `new FoxySigner(mySecret)` or by invoking the setSecret method, as in `signer.setSecret(mySecret)`
   *
   * @param message
   * @private
   */
  private _message(message: string): string {
    if (this._secret === undefined) {
      throw new Error('No secret was provided to build the hmac');
    }
    const hmac = crypto.createHmac('sha256', this._secret);
    hmac.update(message);
    return hmac.digest('hex');
  }
}
