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
 * @example const signer = new Signer(mySecret); // or const signer = new Signer(); signer.setSecret(mySecret);
 *          signer.signHtml('<html lang="en">...</html>'); // signs a URL
 *          signer.signFile("/var/www/html/src/.../index.html", "/var/www/html/target/.../index.html"); // signs an HTML file
 *          signer.signUrl("http://..."); // signs a URL
 */
export class Signer {

  public static readonly cart_excludes = [
    // Analytics values
    "_",
    "_ga",
    "_ke",
    // Cart values
    "cart",
    "fcsid",
    "empty",
    "coupon",
    "output",
    "sub_token",
    "redirect",
    "callback",
    "locale",
    "template_set",
    // Checkout pre-population values
    "customer_email",
    "customer_first_name",
    "customer_last_name",
    "customer_address1",
    "customer_address2",
    "customer_city",
    "customer_state",
    "customer_postal_code",
    "customer_country",
    "customer_phone",
    "customer_company",
    "billing_first_name",
    "billing_last_name",
    "billing_address1",
    "billing_address2",
    "billing_city",
    "billing_postal_code",
    "billing_region",
    "billing_phone",
    "billing_company",
    "shipping_first_name",
    "shipping_last_name",
    "shipping_address1",
    "shipping_address2",
    "shipping_city",
    "shipping_state",
    "shipping_country",
    "shipping_postal_code",
    "shipping_region",
    "shipping_phone",
    "shipping_company",
  ];

  public static readonly cart_excludes_prefixes = ["h:", "x:", "__", "utm_"];

  private __cartURL = 'foxycart.com/cart';

  private __secret?: string;

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
   * @returns Signer to allow for convenient concatenation.
   */
  public setSecret(secret: string): Signer {
    this.__secret = secret;
    return this;
  }

  /**
   * Signs a whole HTML snippet.
   *
   * @param htmlStr HTML snippet to sign.
   * @returns the HTML snippet signed.
   */
  public signHtml(htmlStr: string): string {
    const dom = new JSDOM(htmlStr);
    this.__fragment(dom.window.document);
    return dom.serialize();
  }

  /**
   * Signs a file asynchronously.
   *
   * @param inputPath Path of the file to sign.
   * @param outputPath Path of the file where the signed result will be stored.
   * @param readFunc a function that should read from file
   * @param writeFunc a function that should write to to file
   * @returns a ParentNode object of the signed HTML.
   */
  public signFile(
    inputPath: string,
    outputPath: string,
    readFunc: (arg0: string) => Promise<JSDOM> = JSDOM.fromFile,
    writeFunc: (path: string, content: string, callback: (err: any) => void) => void = fs.writeFile
  ): Promise<ParentNode> {
    return new Promise((resolve, reject) => {
      readFunc(inputPath).then(dom => {
        const signed = this.__fragment(dom.window.document);
        writeFunc(outputPath, dom.serialize(), err => {
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
   * @returns the signed query string.
   */
  public signUrl(urlStr: string): string {
    // Build a URL object
    if (Signer.__isSigned(urlStr)) {
      console.error('Attempt to sign a signed URL', urlStr);
      return urlStr;
    }
    const cartURLpattern = new RegExp(this.__cartURL, 'i');
    if (!cartURLpattern.test(urlStr)) {
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
    const code = Signer.__getCodeFromURL(url);
    // If there is no code, return the same URL
    if (!code) {
      return urlStr;
    }
    // sign the url object
    for (const p of originalParams.entries()) {
      const signed = this.__signQueryArg(
        decodeURIComponent(p[0]),
        decodeURIComponent(code),
        decodeURIComponent(p[1])
      ).split('=');
      newParams.set(signed[0], signed[1]);
    }
    url.search = newParams.toString();
    return Signer.__replaceUrlCharacters(url.toString());
  }

  /**
   * Signs input name.
   *
   * @param name Name of the input element.
   * @param code Product code.
   * @param parentCode Parent product code.
   * @param value Input value.
   * @returns the signed input name.
   */
  public signName(name: string, code: string, parentCode = '', value?: string | number): string {
    name = name.replace(/ /g, '_');
    if (this.__shouldSkipInput(name)) {
      return name;
    } else {
      const signature = this.__signProduct(code + parentCode, name, value);
      const encodedName = encodeURIComponent(name);
      const nameAttr = Signer.__buildSignedName(encodedName, signature, value);
      return nameAttr;
    }
  }

  /**
   * Signs input value.
   *
   * @param name Name of the input element.
   * @param code Product code.
   * @param parentCode Parent product code.
   * @param value Input value.
   * @returns the signed value.
   */
  public signValue(name: string, code: string, parentCode = '', value?: string | number): string {
    name = name.replace(/ /g, '_');
    if (this.__shouldSkipInput(name)) {
      return (value as string);
    } else {
      const signature = this.__signProduct(code + parentCode, name, value);
      const valueAttr = Signer.__buildSignedValue(signature, value);
      return valueAttr;
    }
  }

  /**
   * Signs a product composed of code, name and value.
   *
   * @param code of the product.
   * @param name name of the product.
   * @param value of the product.
   * @returns the signed product.
   * @private
   */
  private __signProduct(code: string, name: string, value?: string | number): string {
    return this.__message(code + name + Signer.__valueOrOpen(value));
  }

  /**
   * Signs a single query argument to be used in `GET` requests.
   *
   * @param name of the argument.
   * @param code of the product.
   * @param value of the argument.
   * @returns the signed query argument.
   * @private
   */
  private __signQueryArg(name: string, code: string, value?: string): string {
    name = name.replace(/ /g, '_');
    code = code.replace(/ /g, '_');
    const signature = this.__signProduct(code, name, value);
    const encodedName = encodeURIComponent(name).replace(/%20/g, '+');
    const encodedValue = encodeURIComponent(Signer.__valueOrOpen(value)).replace(/%20/g, '+');
    return Signer.__buildSignedQueryArg(encodedName, signature, encodedValue);
  }

  /**
   * Signs an input element.
   *
   * @param el the input element
   * @param codes the codes dict object containing the code and parent code
   * @returns the signed element
   * @private
   */
  private __signInput(el: HTMLInputElement, codes: CodesDict): HTMLInputElement {
    const namePrefix = Signer.__splitNamePrefix(el.name);
    const nameString = namePrefix[1];
    const prefix = namePrefix[0];
    const code = codes[prefix].code;
    const parentCode = codes[prefix].parent;
    const value = el.value;
    const signedName = this.signName(nameString, code, parentCode, value);
    el.setAttribute('name', prefix + ':' + signedName);
    return el;
  }

  /**
   * Signs a texArea element.
   *
   * @param el the textArea element.
   * @param codes the codes dict object containing the code and parent code
   * @returns the signed textarea element.
   * @private
   */
  private __signTextArea(el: HTMLTextAreaElement, codes: CodesDict): HTMLTextAreaElement {
    const namePrefix = Signer.__splitNamePrefix(el.name);
    const nameString = namePrefix[1];
    const prefix = namePrefix[0];
    const code = codes[prefix].code;
    const parentCode = codes[prefix].parent;
    const value = '';
    const signedName = this.signName(nameString, code, parentCode, value);
    el.setAttribute('name', prefix + ':' + signedName);
    return el;
  }

  /**
   * Signs all option elements within a Select element.
   *
   * @param el the select element.
   * @param codes the codes dict object containing the code and parent code.
   * @returns the signed select element.
   * @private
   */
  private __signSelect(el: HTMLSelectElement, codes: CodesDict): HTMLSelectElement {
    el.querySelectorAll('option').forEach(opt => {
      this.__signOption(opt, codes);
    });
    return el;
  }

  /**
   * Sign an option element.
   * Signatures are added to the value attribute on options.
   * This function may also be used to sign radio buttons.
   *
   * @param el the option element to be signed.
   * @param codes the codes dict object containing the code and parent code.
   * @returns the signed option element.
   * @private
   */
  private __signOption(
    el: HTMLOptionElement | HTMLInputElement,
    codes: CodesDict
  ): HTMLOptionElement | HTMLInputElement {
    // Get the name parameter, either from the "select"
    // parent element of an option tag or from the name
    // attribute of the input element itself
    let n = (el as HTMLInputElement).name;
    if (n === undefined) {
      const p = el.parentElement as HTMLSelectElement;
      n = p.name;
    }
    const namePrefix = Signer.__splitNamePrefix(n);
    const nameString = namePrefix[1];
    const prefix = namePrefix[0];
    const code = codes[prefix].code;
    const parentCode = codes[prefix].parent;
    const value = el.value;
    const signedValue = this.signValue(nameString, code, parentCode, value);
    el.setAttribute('value', prefix + ':' + signedValue);
    return el;
  }

  /**
   * Signs a radio button. Radio buttons use the value attribute to hold their signatures.
   *
   * @param el the radio button element.
   * @param codes the codes dict object containing the code and parent code.
   * @returns the signed radio button.
   * @private
   */
  private __signRadio(el: HTMLInputElement, codes: CodesDict): HTMLInputElement {
    return this.__signOption(el, codes) as HTMLInputElement;
  }

  /**
   * Splits a string using the prefix pattern for foxy store.
   * The prefix pattern allows for including more than a single product in a given GET or POST request.
   *
   * @param name the name to be separated into prefix and name.
   * @returns an array with [prefix, name]
   * @private
   */
  private static __splitNamePrefix(name: string): [number, string] {
    const namePrefix = name.split(':');
    if (namePrefix.length == 2) {
      return [parseInt(namePrefix[0], 10), namePrefix[1]];
    }
    return [0, name];
  }

  /**
   * Retrieve a parent code value from a form, given a prefix.
   *
   * @param formElement the element with the code and parent code values.
   * @param prefix the prefix used in hte element.
   * @returns the parentCode
   * @private
   */
  private static __retrieveParentCode(formElement: Element, prefix: string | number = ''): string {
    let result = ''; // A blank string indicates no parent
    const separator = prefix ? ':' : '';
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
   * @param formElement the form element to be signed.
   * @private
   */
  private __signForm(formElement: Element): void {
    // Grab all codes within the form element
    const codeList: NodeList = formElement.querySelectorAll('[name$=code]');
    // Store all codes in a object
    const codes: CodesDict = {};
    for (const node of codeList) {
      const nameAttr = (node as Element).getAttribute('name');
      const codeValue = (node as Element).getAttribute('value') ?? '';
      if (nameAttr && nameAttr.match(/^([0-9]{1,3}:)?code/)) {
        const namePrefix = nameAttr.split(':');
        const prefix = parseInt(namePrefix[0]);
        if (namePrefix.length == 2) {
          // Store prefix in codes list
          codes[prefix] = {
            code: codeValue,
            parent: Signer.__retrieveParentCode(formElement, prefix),
          };
        } else if (codes[0] === undefined) {
          // Allow to push a single code without prefix
          codes[0] = {
            code: codeValue,
            parent: Signer.__retrieveParentCode(formElement),
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
        this.__signRadio(i as HTMLInputElement, codes);
      } else {
        this.__signInput(i as HTMLInputElement, codes);
      }
    });
    // Sign selects
    formElement.querySelectorAll('select[name]').forEach(s => this.__signSelect(s as HTMLSelectElement, codes));
    // Sign textAreas
    formElement.querySelectorAll('textarea[name]').forEach(s => this.__signTextArea(s as HTMLTextAreaElement, codes));
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
  private static __buildSignedName(name: string, signature: string, value?: string | number) {
    const open = Signer.__valueOrOpen(value) == '--OPEN--' ? '||open' : '';
    return `${name}||${signature}${open}`;
  }

  /**
   * Builds a signed name given it components.
   *
   * @param signature the resulting signature.
   * @param value the value signed.
   * @returns the built signed value
   * @private
   */
  private static __buildSignedValue(signature: string, value?: string | number) {
    const open = Signer.__valueOrOpen(value) == '--OPEN--' ? '||open' : (value as string);
    return `${open}||${signature}`;
  }

  /**
   * Builds a signed query argument given its components.
   *
   * @param name the argument name.
   * @param signature the resulting signature.
   * @param value the value signed.
   * @returns the built query string argument.
   * @private
   */
  private static __buildSignedQueryArg(name: string, signature: string, value: string | number) {
    return `${name}||${signature}=${value}`;
  }

  /**
   * Returns the value of a field on the `--OPEN--` string if the value is not defined.
   * Please, notice that `0` is an acceptable value.
   *
   * @param value of the field.
   * @returns '--OPEN--' or the given value.
   * @private
   */
  private static __valueOrOpen(value: string | number | undefined): string | number {
    if (value === undefined || value === null || value === '') {
      return '--OPEN--';
    }
    return value;
  }

  /**
   * Check if a href string is already signed. Signed strings contain two consecutive pipes
   * followed by 64 hexadecimal characters.
   *
   * This method **does not validates the signature**.
   * It only checks if the format of the string is evidence that it is signed.
   *
   * @param url the potentially signed URL.
   * @returns true if the string format is evidence that it is already signed.
   * @private
   */
  private static __isSigned(url: string): boolean {
    return url.match(/^.*\|\|[0-9a-fA-F]{64}/) != null;
  }

  /**
   * Returns the code from a URL or undefined if it does not contain a code.
   *
   * @param url the URL to retrieve the code from.
   * @returns the code found, or undefined if no code was found.
   * @private
   */
  private static __getCodeFromURL(url: URL): string | undefined {
    for (const p of url.searchParams) {
      if (p[0] == 'code') {
        return p[1];
      }
    }
  }

  /**
   * Find all cart forms in a document fragment that contain an input named `code`.
   *
   * @param doc the document fragment potentially containing cart forms.
   * @returns an array of the form elements found.
   * @private
   */
  private static __findCartForms(doc: ParentNode): HTMLFormElement[] {
    return Array.from(doc.querySelectorAll('form')).filter(e => e.querySelector('[name=code]'));
  }

  /**
   * Replace some of the characters encoded by `encodeURIComponent()`.
   *
   * @param urlStr the URL string.
   * @returns a cleaned URL string.
   * @private
   */
  private static __replaceUrlCharacters(urlStr: string): string {
    return urlStr.replace(/%7C/g, '|').replace(/%3D/g, '=').replace(/%2B/g, '+');
  }

  /**
   * Signs a document fragment. This method is used to sign HTML snippets.
   *
   * @param doc an HTML doc fragment
   * @returns the signed HTML snippet
   * @private
   */
  private __fragment(doc: ParentNode): ParentNode {
    doc.querySelectorAll(`a[href*='${this.__cartURL}']`).forEach(l => {
      const anchor = l as HTMLAnchorElement;
      anchor.href = this.signUrl(anchor.href);
    });
    Signer.__findCartForms(doc).forEach(this.__signForm.bind(this));
    return doc;
  }

  /**
   * Signs a simple message. This function can only be invoked after the secret has been defined. The secret can be defined either in the construction method as in `new FoxySigner(mySecret)` or by invoking the setSecret method, as in `signer.setSecret(mySecret)`
   *
   *
   * @param message the message to be signed.
   * @returns signed message.
   * @private
   */
  private __message(message: string): string {
    if (this.__secret === undefined) {
      throw new Error('No secret was provided to build the hmac');
    }
    const hmac = crypto.createHmac('sha256', this.__secret);
    hmac.update(message);
    return hmac.digest('hex');
  }

  /**
   * Checks if a name should be skipped.
   *
   * @param name that could be signed
   * @returns it should be skipped, i.e. not be signed
   * @private
   */
  private __shouldSkipInput(name: string): boolean {
    const prefixStripped = name.replace(/^\d:/, "");
    return (
      Signer.cart_excludes.includes(prefixStripped) ||
      Signer.cart_excludes_prefixes.some(
        (p) =>
          name.toLowerCase().startsWith(p) ||
          (name.startsWith("0:") && prefixStripped.toLowerCase().startsWith(p))
      )
    );
  }

}

