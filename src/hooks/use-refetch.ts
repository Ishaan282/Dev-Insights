import { useQueryClient } from '@tanstack/react-query'
import React from 'react'
//making this hook to refecth the data when it's updated
const useRefetch = () => {
    const queryClient = useQueryClient()
    return async () => {
        await queryClient.refetchQueries({
            type: 'active'
        })
    }
}

export default useRefetch