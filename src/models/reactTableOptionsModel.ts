export default class ReactTableOptionsModel {
    pageSize: number;
    page: number;
    sorted: [
        {
            asc: boolean;
            id: string;
        }
    ];
    previousUuid: string;
}