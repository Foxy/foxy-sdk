import type { APIGraph } from '../../core/types';
import type { FxEmailTemplate } from './email_template';

export interface FxAdminEmailTemplate extends APIGraph {
  curie: 'fx:admin_email_template';
  links: FxEmailTemplate['links'];
  props: FxEmailTemplate['props'];
}
