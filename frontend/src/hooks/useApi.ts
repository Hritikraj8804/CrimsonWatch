import { useState, useEffect } from 'react'
import axios from 'axios'
import { Metrics, Incident, Agent, ThreatSummary, Event } from '../types'

const API_BASE = '/api'

export function useMetrics() {
  const [data, setData] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${API_BASE}/metrics`)
        setData(res.data)
        setError(null)
      } catch (err) {
        setError('Failed to fetch metrics')
      } finally {
        setLoading(false)
      }
    }

    fetch()
    const interval = setInterval(fetch, 5000)
    return () => clearInterval(interval)
  }, [])

  return { data, loading, error }
}

export function useIncidents(limit = 10) {
  const [data, setData] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${API_BASE}/incidents?limit=${limit}`)
        setData(res.data)
        setError(null)
      } catch (err) {
        setError('Failed to fetch incidents')
      } finally {
        setLoading(false)
      }
    }

    fetch()
    const interval = setInterval(fetch, 5000)
    return () => clearInterval(interval)
  }, [limit])

  return { data, loading, error }
}

export function useAgents() {
  const [data, setData] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${API_BASE}/agents`)
        setData(res.data)
        setError(null)
      } catch (err) {
        setError('Failed to fetch agents')
      } finally {
        setLoading(false)
      }
    }

    fetch()
    const interval = setInterval(fetch, 5000)
    return () => clearInterval(interval)
  }, [])

  return { data, loading, error }
}

export function useThreatSummary() {
  const [data, setData] = useState<ThreatSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${API_BASE}/threat-summary`)
        setData(res.data)
        setError(null)
      } catch (err) {
        setError('Failed to fetch threat summary')
      } finally {
        setLoading(false)
      }
    }

    fetch()
    const interval = setInterval(fetch, 3000)
    return () => clearInterval(interval)
  }, [])

  return { data, loading, error }
}

export function useEvents() {
  const [data, setData] = useState<Event[]>([])
  
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${API_BASE}/events`)
        setData(res.data)
      } catch (err) {
        console.error('Failed to fetch events')
      }
    }

    fetch()
    const interval = setInterval(fetch, 5000)
    return () => clearInterval(interval)
  }, [])

  return data
}
