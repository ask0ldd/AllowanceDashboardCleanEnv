export interface IPaginatedResponse<T> {
    data: T[];
    links: {
        first : string | null
        last : string | null
        next : string | null
        prev: string | null
    },
    meta:{
        // first_page_url: string;
        from: number;
        last_page: number;
        current_page: number;
        path: string;
        per_page: number;
        to: number;
        total: number;
        links : {
            url : string | null
            label : string
            active : boolean
        }[]
    }
}

/*interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}*/