import { router } from "@inertiajs/react"
import { debounce } from "lodash"
import { useState, useMemo, useEffect } from "react"

/*
* centralizes and handles all filtering and search logic for the dashboard.
*/
export default function useDashboardControls(){
    const updateDashboard = (params : {showRevoked : boolean, searchValue : string, showUnlimitedOnly : boolean,}) => {
        router.get(route('dashboard'), {
            ...params,
        }, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
            preserveUrl: true,
            only: ['allowances', 'flash', 'success'],
        })
    }
    

    const [filters, setFilters] = useState({
        searchValue : "",
        showUnlimitedOnly : false,
        showRevoked : false
    })

    const debouncedSearch = useMemo(
        () => debounce((value: string) => {
            router.get(route('dashboard'), 
                {   
                    showRevoked : filters.showRevoked, 
                    searchValue: value, 
                    showUnlimitedOnly : filters.showUnlimitedOnly,
                },
                {
                    preserveState: true,
                    replace: true,
                    preserveScroll: true,
                    preserveUrl: true,
                    only: ['allowances'],
                }
            )
        }, 300),
        [filters.showRevoked, filters.showUnlimitedOnly]
    )

    useEffect(() => {
        console.log("debounce")
        debouncedSearch(filters.searchValue);
        return () => debouncedSearch.cancel();
    }, [filters.searchValue/*, debouncedSearch*/]);

    const resetValue = {showRevoked : false, showUnlimitedOnly: false, searchValue : ""}

    return {debouncedSearch, updateDashboard, filters, setFilters, resetValue}
}