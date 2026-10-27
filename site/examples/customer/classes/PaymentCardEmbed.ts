import { PaymentCardEmbed } from '@foxy.io/sdk/customer';

const embed = new PaymentCardEmbed({ url: 'https://embed.foxy.io/v1.html?template_set_id=123' });
await embed.mount(document.body);

// Tokenize when the customer presses Enter in the card form.
embed.onsubmit = async () => {
  const token = await embed.tokenize();
  console.log('Token:', token);
  embed.clear();
};
