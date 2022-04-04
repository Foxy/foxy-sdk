import type { Graph } from '../../core';
import type { User } from './user';
import type { ReportDownloadUrl } from './report_download_url';

interface Report extends Graph {
    curie: 'fx:report';
    links: {
        'self': Report,
        'fx:download_url': ReportDownloadUrl,
        'fx:user': User,
    };
    props: {
        /** The name of the report */
        name: string,
        /** The report version */
        version: string,
        /** Current status of the report */
        status: string,
        /** The start date of the report */
        datetime_start: string,
        /** The end date of the report */
        datetime_end: string,
         /** The date this resource was created. */
        date_created: string | null;
        /** The date this resource was last modified. */
        date_modified: string | null;
    };
    zooms: {}; // add your report zooms here
}
