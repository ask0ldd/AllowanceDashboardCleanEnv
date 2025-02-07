import { router } from "@inertiajs/react"
import { debounce } from "lodash"
import { useState, useMemo, useEffect } from "react"

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
    
    const [showRevoked, setShowRevoked] = useState(false)

    const [showUnlimitedOnly, setShowUnlimitedOnly] = useState(false)

    const [searchValue, setSearchValue] = useState("")
    const debouncedSearch = useMemo(
        () => debounce((value: string) => {
            router.get(route('dashboard'), 
                {   
                    showRevoked, 
                    searchValue: value, 
                    showUnlimitedOnly,
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
        [showRevoked, showUnlimitedOnly]
    )

    useEffect(() => {
        console.log("debounce")
        debouncedSearch(searchValue);
        return () => debouncedSearch.cancel();
    }, [searchValue/*, debouncedSearch*/]);

    return {debouncedSearch, searchValue, setSearchValue, showUnlimitedOnly, setShowUnlimitedOnly, showRevoked, setShowRevoked , updateDashboard}
}