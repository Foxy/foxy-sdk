import type { EmailTemplate } from './email_template';
import type { Graph } from '../../core';

export interface AdminEmailTemplate extends Graph {
  curie: 'fx:admin_email_template';
  links: EmailTemplate['links'];
  props: EmailTemplate['props'];
}
