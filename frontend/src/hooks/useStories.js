import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../utils/api'

export const useStories = (params = {}) => {
  return useQuery({
    queryKey: ['stories', params],
    queryFn: async () => {
      const response = await api.get('/stories', { params })
      return response.data
    },
  })
}

export const useStory = (storyId) => {
  return useQuery({
    queryKey: ['story', storyId],
    queryFn: async () => {
      const response = await api.get(`/stories/${storyId}`)
      return response.data
    },
    enabled: !!storyId,
  })
}

export const useStoryAudio = (storyId) => {
  return useQuery({
    queryKey: ['story-audio', storyId],
    queryFn: async () => {
      const response = await api.get(`/stories/${storyId}/audio`)
      return response.data
    },
    enabled: !!storyId,
  })
}

export const useGenerateStory = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/stories/generate', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['stories'])
    },
  })
}

export const useUpdateProgress = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ storyId, data }) => {
      const response = await api.put(`/user/progress/${storyId}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['progress'])
    },
  })
}

export const useUserProgress = () => {
  return useQuery({
    queryKey: ['progress'],
    queryFn: async () => {
      const response = await api.get('/user/progress')
      return response.data
    },
  })
}

export const useUserStats = () => {
  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const response = await api.get('/user/stats')
      return response.data
    },
  })
}
