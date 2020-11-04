import type { FxEmailTemplate } from './email_template';
import type { Graph } from '../../core';

export interface FxAdminEmailTemplate extends Graph {
  curie: 'fx:admin_email_template';
  links: FxEmailTemplate['links'];
  props: FxEmailTemplate['props'];
}
