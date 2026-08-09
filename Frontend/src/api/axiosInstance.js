import axios from 'axios'

const apiUrl =
  import.meta.env.VITE_API_URL ||
  'http://localhost:8080'

const api = axios.create({
  baseURL: apiUrl,

  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  function addToken(config) {
    const token = localStorage.getItem('token')

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`
    }

    return config
  },

  function requestError(error) {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  function responseSuccess(response) {
    return response
  },

  function responseError(error) {
    const status = error.response?.status
    const currentPage = window.location.pathname

    if (status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')

      if (currentPage !== '/login') {
        window.location.href = '/login'
      }
    }

    if (
      status === 403 &&
      currentPage !== '/access-denied'
    ) {
      window.location.href = '/access-denied'
    }

    if (status === 404) {
      console.error('Ressource introuvable')
    }

    if (status === 500) {
      console.error('Erreur interne du serveur')
    }

    return Promise.reject(error)
  }
)

export default api