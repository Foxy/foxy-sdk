import * as Nucleon from '../src/nucleon';

import { css, html } from 'lit-element';

import i18next from 'i18next';

const whenI18NReady = i18next.init({
  resources: {
    en: { translation: { hello: 'Hello!' } },
    ru: { translation: { hello: 'Привет!' } },
  },
});

class DemoElement extends Nucleon.Element {
  static get styles() {
    return css`
      @import 'https://cdn.jsdelivr.net/npm/water.css@2/out/light.css';
    `;
  }
}

class DemoHelloElement extends DemoElement {
  render() {
    return html`Hello!`;
  }
}

class DemoI18NElement extends DemoElement {
  constructor() {
    super({ i18n: { instance: i18next, whenReady: whenI18NReady } });
  }

  render() {
    return html`${this._t('hello')}`;
  }
}

class DemoBreakpointsElement extends DemoElement {
  static get styles() {
    return css`
      .sm-and-up,
      .md-and-up {
        display: none;
      }

      :host([breakpoint~='sm']) .sm-and-up {
        display: inline;
      }

      :host([breakpoint~='md']) .md-and-up {
        display: inline;
      }
    `;
  }

  constructor() {
    super({ breakpoints: { md: 200, sm: 100 } });
  }

  render() {
    return html`
      <span class="xs-and-up">XS+</span>
      <span class="sm-and-up">SM+</span>
      <span class="md-and-up">MD+</span>
    `;
  }
}

class DemoCardElement extends DemoElement {
  render() {
    return html`
      <h1>${this.resource?.title ?? ''}</h1>
      <p>${this.resource?.body ?? ''}</p>
    `;
  }
}

class DemoFormElement extends DemoElement {
  render() {
    return html`
      <form @submit=${evt => [evt.preventDefault(), this._submit()]}>
        <label for="title">Title</label>
        <input
          id="title"
          .value=${this.resource?.title ?? ''}
          @input=${evt => this._setProperty({ title: evt.target.value })}
        />

        <label for="body"> Text </label>
        <textarea
          id="body"
          .value=${this.resource?.body ?? ''}
          @input=${evt => this._setProperty({ body: evt.target.value })}
        >
        </textarea>

        <button ?disabled=${!this._is('form.idle')}>Save</button>
      </form>
    `;
  }
}

class DemoRemoverElement extends DemoElement {
  render() {
    return html`
      <button
        ?disabled=${!this._is('form.idle')}
        @click=${() => {
          const isConfirmed = confirm(`Delete ${this.resource.title}?`);
          if (isConfirmed) this._delete();
        }}
      >
        Delete
      </button>
    `;
  }
}

class DemoV8NElement extends DemoElement {
  static get resourceV8N() {
    return {
      title: [
        ({ title }) => (title && title.length > 0) || 'Title is required',
        ({ title }) => (title && title.length <= 100) || 'Title is limited to 100 characters',
      ],
    };
  }

  render() {
    return html`
      <form @submit=${evt => [evt.preventDefault(), this._submit()]}>
        <p>
          <label for="title">Title</label>
          <input
            id="title"
            .value=${this.resource?.title ?? ''}
            @input=${evt => this._setProperty({ title: evt.target.value })}
          />
          <small aria-live="polite">${this._getErrorMessages().title ?? ''}</small>
        </p>

        <button ?disabled=${!this._is('form.idle.snapshot.modified.valid') && !this._is('form.idle.template.valid')}>
          Submit
        </button>
      </form>
    `;
  }
}

class DemoListElement extends DemoElement {
  render() {
    return html`
      ${this.resource?._embedded.posts.map(
        post => html`
          <h4>${post.title}</h4>
          <p>${post.body ?? ''}</p>
        `
      )}
    `;
  }
}

customElements.define('demo-hello', DemoHelloElement);
customElements.define('demo-i18n', DemoI18NElement);
customElements.define('demo-breakpoints', DemoBreakpointsElement);
customElements.define('demo-card', DemoCardElement);
customElements.define('demo-form', DemoFormElement);
customElements.define('demo-remover', DemoRemoverElement);
customElements.define('demo-v8n', DemoV8NElement);
customElements.define('demo-list', DemoListElement);

const post = {
  _links: { self: { href: 'https://api.test/posts/123' } },
  body: 'Quia et suscipit suscipit recusandae consequuntur expedita et cum reprehenderit molestiae.',
  title: 'Lorem ipsum',
};

const posts = {
  _embedded: {
    posts: [
      {
        _links: { self: { href: 'https://api.test/posts/123' } },
        body: 'Try editing this post and see how it updates in the card.',
        title: 'Post 123',
      },
      {
        _links: { self: { href: 'https://api.test/posts/456' } },
        body: 'Quia et suscipit suscipit recusandae consequuntur.',
        title: 'Post 456',
      },
      {
        _links: { self: { href: 'https://api.test/posts/789' } },
        body: 'Expedita et cum reprehenderit molestiae.',
        title: 'Post 789',
      },
    ],
  },
  _links: { self: { href: 'https://api.test/posts' } },
};

addEventListener('request', async evt => {
  if (!(evt instanceof Nucleon.RequestEvent)) return;

  evt.preventDefault();
  await new Promise(r => setTimeout(r, 1000));

  const url = evt.detail.request.url;
  const method = evt.detail.request.method;

  if (url === 'https://api.test/posts/123') {
    if (method === 'GET' || method === 'DELETE') {
      return evt.detail.resolve(new Response(JSON.stringify(post)));
    }

    if (method === 'PATCH') {
      const patch = await evt.detail.request.json();
      return evt.detail.resolve(new Response(JSON.stringify({ ...post, ...patch })));
    }
  }

  if (url === 'https://api.test/posts') {
    if (method === 'GET') {
      return evt.detail.resolve(new Response(JSON.stringify(posts)));
    }

    if (method === 'POST') {
      const { title, body } = await evt.detail.request.json();
      return evt.detail.resolve(new Response(JSON.stringify({ ...post, body, title })));
    }
  }

  return evt.detail.resolve(new Response(null, 404));
});
