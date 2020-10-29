import type { FxEmailTemplate } from './email_template';

export interface FxAdminEmailTemplate {
  curie: 'fx:admin_email_template';
  links: FxEmailTemplate['links'];
  props: FxEmailTemplate['props'];
}
