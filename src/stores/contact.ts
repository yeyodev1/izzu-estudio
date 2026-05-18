import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface IzzuContact {
  nombre: string
  apellido: string
  email: string
  telefono: string
  timestamp?: number
}

const STORAGE_KEY = 'izzu_contact'

export const useContactStore = defineStore('contact', () => {
  const contact = ref<IzzuContact>({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
  })

  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      Object.assign(contact.value, JSON.parse(stored))
    } catch { /* ignorar */ }
  }

  function save(data: Partial<IzzuContact>) {
    Object.assign(contact.value, data, { timestamp: Date.now() })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contact.value))
  }

  function get(): IzzuContact {
    return { ...contact.value }
  }

  function clear() {
    contact.value = { nombre: '', apellido: '', email: '', telefono: '' }
    localStorage.removeItem(STORAGE_KEY)
  }

  return { contact, save, get, clear }
})
