import * as fs from "fs";
import { JSDOM } from "jsdom";
import { Signer } from '../../src/integration';

describe("Signer", () => {

  const signer = new Signer("1");

  const outputPath = "/tmp/foxyTestOutput.html";

  it("Signs an input name", () => {
    const code = "ABC123";
    const name = "name";
    const value = "My Example Product";
    expect(signer.name(name, code, "", value)).toBe(
      "name||dbaa042ec8018e342058417e058d7a479226976c7cb287664197fd67970c4715"
    );
    expect(signer.name(name, code, "", 100)).toBe(
      "name||bd87a3e47a20a60c9c5d7d2a026605310f20753b80535e56336cfd5502f61143"
    );
  });

  it("Signs an input name with user edited values", () => {
    const code = "ABC123";
    const name = "name";
    expect(signer.name(name, code, "")).toBe(
      "name||3f2075135e3455131bd0d6ce8643551e9e2e43bc09dd0474fa3effbe4e588c9e||open"
    );
    expect(signer.name(name, code)).toBe(
      "name||3f2075135e3455131bd0d6ce8643551e9e2e43bc09dd0474fa3effbe4e588c9e||open"
    );
  });

  it("Signs a value with user edited values", () => {
    const code = "ABC123";
    const name = "name";
    expect(signer.value(name, code, "")).toBe(
      "||open||3f2075135e3455131bd0d6ce8643551e9e2e43bc09dd0474fa3effbe4e588c9e"
    );
    expect(signer.value(name, code)).toBe(
      "||open||3f2075135e3455131bd0d6ce8643551e9e2e43bc09dd0474fa3effbe4e588c9e"
    );
  });

  it("Signs a whole URL", () => {
    const fullURL =
      "http://mockdomain.mock/?code=mycode&name=testname&price=123.00&other atribute=Some Other Thing";
    const signedURL =
      "http://mockdomain.mock/?" +
      "code||43f429e41303929871266b879a880efce32b35bda757e70f527bc5c8e1353c0a=mycode&" +
      "name||07f23df6159ba32f01de36db07bf998d7661bda812a7c0d597cfacdefe0f0064=testname&" +
      "price||aed2692b1b278b04b974c3c9822e597dc5da880561cf256ab20b2873a5346b66=123.00&" +
      "other_atribute||98700cf679c5d7394e3e33b883f18683664b4843707f916a0739ba1c9adeabab=Some+Other+Thing";
    expect(signer.url(fullURL)).toBe(signedURL);
  });

  it("Signs a whole HTML string", () => {
    const htmlString = fs.readFileSync("./test/mocks/html/onepage.html").toString();
    const signedHTML = signer.htmlString(htmlString);
    // e.g: ||aed2692b1b278b04b974c3c9822e597dc5da880561cf256ab20b2873a5346b66=
    const signatureRegex = /\|\|[0-9a-fA-F]{64}=/;
    const expectedAttributeMatches = [/name/, /price/, /quantity/];
    for (const p of expectedAttributeMatches) {
      const toMatch = new RegExp(p.source + signatureRegex.source, "g");
      const signedItems = signedHTML.match(toMatch);
      expect(signedItems).toHaveLength(31);
    }
  });

  it("Signs an HTML string", () => {
    const htmlString = fs.readFileSync("./test/mocks/html/onepagewithforms.html").toString();
    const signedHTML = signer.htmlString(htmlString);
    // e.g: ||aed2692b1b278b04b974c3c9822e597dc5da880561cf256ab20b2873a5346b66=
    const namePrefixRegex = /name="\d{1,3}:/;
    const valuePrefixRegex = /value="\d{1,3}:/;
    const signatureRegex = /\|\|[0-9a-fA-F]{64}\W/;
    const expectedAttributeMatches: [RegExp, RegExp, number][] = [
      [namePrefixRegex, /name/, 5],
      [namePrefixRegex, /price/, 5],
      [namePrefixRegex, /code/, 5],
      [valuePrefixRegex, /small\{p-2\}/, 5],
      [valuePrefixRegex, /medium/, 5],
      [valuePrefixRegex, /large\{p\+3\}/, 5],
      [namePrefixRegex, /quantity/, 5],
    ];
    for (const p of expectedAttributeMatches) {
      const toMatch = new RegExp(p[0].source + p[1].source + signatureRegex.source, "g");
      const signedItems = signedHTML.match(toMatch);
      expect(signedItems).toHaveLength(p[2]);
    }
  });

  it("Signs an HTML file", async () => {
    const inputPath = "./test/mocks/html/onepagewithforms.html";
    await signer.htmlFile(inputPath, outputPath);
    const result = fs.readFileSync(outputPath).toString();
    const namePrefixRegex = /name="\d{1,3}:/;
    const valuePrefixRegex = /value="\d{1,3}:/;
    const signatureRegex = /\|\|[0-9a-fA-F]{64}\W/;
    const expectedAttributeMatches: [RegExp, RegExp, number][] = [
      [namePrefixRegex, /name/, 5],
      [namePrefixRegex, /price/, 5],
      [namePrefixRegex, /code/, 5],
      [valuePrefixRegex, /express/, 3],
      [valuePrefixRegex, /regular/, 3],
      [valuePrefixRegex, /pickup/, 3],
      [valuePrefixRegex, /small\{p-2\}/, 5],
      [valuePrefixRegex, /medium/, 5],
      [valuePrefixRegex, /large\{p\+3\}/, 5],
      [namePrefixRegex, /quantity/, 5],
    ];
    for (const p of expectedAttributeMatches) {
      const toMatch = new RegExp(p[0].source + p[1].source + signatureRegex.source, "g");
      const signedItems = result.match(toMatch);
      expect(signedItems?.length).toBe(p[2]);
    }

    const notAFile = await signer
      .htmlFile(inputPath, "/shouldNotHavePermissionHere")
      .then(() => false)
      .catch(() => true);
    expect(notAFile).toBe(true);
  });

  it("Signs fields with editable values", () => {
    // Reuse previously generated signed html
    const result = fs.readFileSync(outputPath).toString();
    const colorEditable = /name="\d{1,3}:color\|\|[0-9a-fA-F]{64}||open\W/;
    const additionalDetails = /name="\d{1,3}:additional-details\|\|[0-9a-fA-F]{64}||open\W/;
    let signedItems = result.match(colorEditable);
    expect(signedItems?.length).toBe(1);
    signedItems = result.match(additionalDetails);
    expect(signedItems?.length).toBe(1);
  });

  it("Preserves different products", () => {
    const inputPath = "./test/mocks/html/onepagewithforms.html";
    const before = fs.readFileSync(inputPath).toString();
    // Reuse previously generated signed html
    const result = fs.readFileSync(outputPath).toString();
    const names1before = before.match(/name="1:/g)?.length;
    const names1after = result.match(/name="1:/g)?.length;
    const names2before = before.match(/name="2:/g)?.length;
    const names2after = result.match(/name="2:/g)?.length;
    expect(names1before).toBe(names1after);
    expect(names2before).toBe(names2after);
  });

  it("Properly signs signs bundled products", () => {
    expect(signer.name("name", "abc124", "abc123", "Different T-Shirt")).toBe(
      "name||ca2df56d0a72b3637b688d519939f7f00551f054cede1e35aa57602201e2b75f"
    );
    // Reuse previously generated signed html
    const result = fs.readFileSync(outputPath).toString();
    expect(
      result.match(
        /name="2:name\|\|ca2df56d0a72b3637b688d519939f7f00551f054cede1e35aa57602201e2b75f" value="Different T-Shirt"/
      )?.length
    ).toBe(1);
  });

  it("Do not touch forms without code", () => {
    // Reuse previously generated signed html
    const result = fs.readFileSync(outputPath).toString();
    expect(result.match(/name="honeypot"/)?.length).toBe(1);
    // Do not affect html without code attribute
    let simpleHTML = `<html><head></head><body><h1>Test form</h1><div><p>There is no form to be found here</p></div></body></html>`;
    let signed = signer.htmlString(simpleHTML);
    expect(signed).toBe(simpleHTML);
    // Do not affect forms html without code attribute
    simpleHTML = `<html><head></head><body><h1>Test
    form</h1><div><form>There is no code to be found here
    <input name="test" type="text"></form></div></body></html>`;
    signed = signer.htmlString(simpleHTML);
    expect(signed).toBe(simpleHTML);
    // Do not change a form element without a code
    const dom = new JSDOM(simpleHTML).window.document;
    const f = dom.querySelector("form");
    const prev = f!.outerHTML;
    signer.htmlString(f!.outerHTML);
    expect(f!.outerHTML).toBe(prev);
  });

  it("Does not process multiple codes for a product", () => {
    const simpleHTML = `<html><head></head><body><h1>Test form</h1>
       <form>
       <input name="code" value="test">
       <input name="code" value="test2">
       </form>
       </body></html>`;
    expect(() => signer.htmlString(simpleHTML)).toThrow();
  });

  it("Does not resigns a url", async () => {
    const url = "http://storename?code=ABC123&name=name&value=My Example Product";
    const consoleError = console.error;
    console.error = jest.fn();
    const signed = signer.url(url);
    const reSigned = signer.url(signed);
    expect(signed).toBe(reSigned);
    console.error = consoleError;
  });

  it("Does not sign without a secret", () => {
    const woSecretFoxy = new Signer();
    const woSign = () => woSecretFoxy.url("http://signthis?code=test&price=5");
    expect(woSign).toThrow();
  });

  it("Does not sign invalid URL", () => {
    const badURL = `href="what://code=test"`;
    const attemptSigned = signer.url(badURL);
    expect(badURL).toBe(attemptSigned);
  });

  it("Parent code can be missing", () => {
    const noParent = `
    <form>
    <input name="code" value="test">
    <input name="parent_code" >
    </form>
    `;
    const signed = signer.htmlString(noParent);
    expect(
      signed.match(/3ce339bde0689065ad4f18698603d5f957581bc8ef819e1a6d5a11ddefddc46a/)
    ).toHaveLength(1);
  });
});
