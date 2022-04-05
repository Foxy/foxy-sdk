import type { DownloadUrl } from './download_url';
import type { Graph } from '../../core';
import type { User } from './user';

export interface Report extends Graph {
  curie: 'fx:report';

  links: {
    'self': Report;
    'fx:download_url': DownloadUrl;
    'fx:user': User;
  };

  props: {
    /** The type of report generated, indicating the content of the report. `complete` includes transaction details, summaries, coupon usage, subscription forecasts, and more. `customers` is for exporting customers to import elsewhere. `customers_ltv` includes the lifetime value per customer. */
    name: 'complete' | 'customers' | 'customers_ltv';
    /** In the event a report changes significantly, a new version of the report may be available. Leave this empty to retrieve the latest version, or pass a 1 to request a specific version. In the future, additional versions of each named report may be available. */
    version: '1';
    /** Current status of the report. Possible values include `queued`, `error`, and `ready`. */
    status: 'queued' | 'error' | 'ready';
    /** A timestamp in the `YYYY-MM-DD HH:MM:SS` format, for the start of the reporting period, for your store's configured timezone. Note that any offset will be ignored, and the datetime passed in will be used as your store's configured timezone. */
    datetime_start: string;
    /** Same as `datetime_start`, but for the end of the report's timeframe. Note that you likely want to pass `23:59:59` as the time portion, or you may inadvertently miss data from the last day of the reporting period. */
    datetime_end: string;
    /** The date this resource was created. */
    date_created: string | null;
    /** The date this resource was last modified. */
    date_modified: string | null;
  };
}
